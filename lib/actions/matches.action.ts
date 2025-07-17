'use server'
import { dbPromise } from '@/database/drizzle'
import { matchesTable, playerStatsTable, playersTable } from '@/database/schema'
import { eq, inArray } from 'drizzle-orm'
import { TeamType } from '@/types/TeamType'
import { organizationsTable } from '@/database/schema'

// Tipo para el resultado
export type PlayerMatchWithStats = {
  match: {
    id: string
    date: Date
    team1Id: string
    team2Id: string
    team1Goals?: number
    team2Goals?: number
  }
  stats: {
    id: string
    minutesPlayed: number
    goals: number
    assists: number
    passesCompleted: number
    duelsWon: number
    duelsLost: number
  }
  player: {
    id: string
    name: string
    lastName: string
    avatar?: string | null
    jerseyNumber?: number | null
  }
}

// Devuelve todos los matches y stats de un jugador
export async function getPlayerMatchesWithStats(
  playerId: string
): Promise<PlayerMatchWithStats[]> {
  const db = await dbPromise
  // Buscar todos los stats de este jugador
  const stats = await db
    .select()
    .from(playerStatsTable)
    .where(eq(playerStatsTable.playerId, playerId))
  if (!stats.length) return []

  // Buscar los matches correspondientes
  const matchIds = stats.map((s) => s.matchId as string)
  const matches = await db
    .select()
    .from(matchesTable)
    .where(inArray(matchesTable.id, matchIds))

  // Obtener el jugador una sola vez
  const [player] = await db
    .select({
      id: playersTable.id,
      name: playersTable.name,
      lastName: playersTable.lastName,
      avatar: playersTable.avatar,
      jerseyNumber: playersTable.jerseyNumber,
    })
    .from(playersTable)
    .where(eq(playersTable.id, playerId))

  // Unir matches, stats y player
  return stats
    .map((stat) => {
      const match = matches.find((m) => m.id === stat.matchId)
      return match
        ? {
            match: {
              id: match.id,
              date: match.date,
              team1Id: match.team1Id,
              team2Id: match.team2Id,
              team1Goals: match.team1Goals,
              team2Goals: match.team2Goals,
            },
            stats: {
              id: stat.id,
              minutesPlayed: stat.minutesPlayed,
              goals: stat.goals,
              assists: stat.assists,
              passesCompleted: stat.passesCompleted,
              duelsWon: stat.duelsWon,
              duelsLost: stat.duelsLost,
            },
            player: player || {},
          }
        : null
    })
    .filter(Boolean) as PlayerMatchWithStats[]
}

// Nueva función para obtener equipos por ids
export async function getTeamsByIds(teamIds: string[]): Promise<TeamType[]> {
  if (!teamIds.length) return []
  const db = await dbPromise
  const teams = await db
    .select()
    .from(organizationsTable)
    .where(inArray(organizationsTable.id, teamIds))
  return teams as TeamType[]
}

// Crea un partido y asocia automáticamente todos los jugadores de ambos equipos en player_stats
export async function createMatchWithPlayers({
  date,
  team1Id,
  team2Id,
}: {
  date: Date
  team1Id: string
  team2Id: string
}) {
  const db = await dbPromise
  // 1. Crear el partido
  const [match] = await db
    .insert(matchesTable)
    .values({
      date,
      team1Id,
      team2Id,
    })
    .returning()

  // 2. Obtener jugadores de ambos equipos
  const playersTeam1 = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.organizationId, team1Id))
  const playersTeam2 = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.organizationId, team2Id))

  // 3. Crear registros en player_stats para cada jugador
  const allPlayers = [...playersTeam1, ...playersTeam2]
  if (allPlayers.length > 0) {
    await db.insert(playerStatsTable).values(
      allPlayers.map((player) => ({
        playerId: player.id,
        matchId: match.id,
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        passesCompleted: 0,
        duelsWon: 0,
        duelsLost: 0,
        goalsAllowed: 0,
        goalsSaved: 0,
      }))
    )
  }
  return { match, players: allPlayers }
}

// Devuelve todos los partidos con los nombres y avatares de los equipos
export async function getAllMatchesWithTeams() {
  const db = await dbPromise
  // 1. Obtener todos los partidos
  const matches = await db.select().from(matchesTable)
  if (!matches.length) return []
  // 2. Obtener los equipos involucrados
  const teamIds = [...new Set(matches.flatMap((m) => [m.team1Id, m.team2Id]))]
  const teams = await db
    .select()
    .from(organizationsTable)
    .where(inArray(organizationsTable.id, teamIds))
  // 3. Mapear los nombres y avatares de los equipos
  return matches.map((match) => {
    const team1 = teams.find((t) => t.id === match.team1Id)
    const team2 = teams.find((t) => t.id === match.team2Id)
    return {
      id: match.id,
      date: match.date,
      team1: team1?.name || 'Unknown',
      team2: team2?.name || 'Unknown',
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      team1Goals: match.team1Goals,
      team2Goals: match.team2Goals,
      team1Avatar: team1?.avatar || '',
      team2Avatar: team2?.avatar || '',
    }
  })
}

// Devuelve un partido por id con los nombres y avatares de los equipos y los jugadores de ambos equipos
export async function getMatchWithPlayers(matchId: string) {
  const db = await dbPromise
  // 1. Obtener el partido
  const matches = await getAllMatchesWithTeams()
  const match = matches.find((m) => m.id === matchId)
  if (!match) return null
  // 2. Obtener jugadores de ambos equipos
  const playersTeam1 = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.organizationId, match.team1Id))
  const playersTeam2 = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.organizationId, match.team2Id))
  return {
    match,
    playersTeam1,
    playersTeam2,
  }
}
