import { dbPromise } from '@/database/drizzle'
import { matchesTable, playerStatsTable } from '@/database/schema'
import { eq, inArray } from 'drizzle-orm'
import { TeamType } from '@/types/TeamType'
import { organizationsTable } from '@/database/schema'
import { playersTable } from '@/database/schema'

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
