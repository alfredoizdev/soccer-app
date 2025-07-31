'use server'
import { dbPromise } from '@/database/drizzle'
import {
  matchesTable,
  playerStatsTable,
  playersTable,
  liveMatchDataTable,
  liveMatchScoreTable,
  matchEventsTable,
} from '@/database/schema'
import { eq, inArray, and } from 'drizzle-orm'
import { TeamType } from '@/types/TeamType'
import { organizationsTable } from '@/database/schema'
import { sql } from 'drizzle-orm'

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
  location,
  notes,
}: {
  date: Date
  team1Id: string
  team2Id: string
  location?: string
  notes?: string
}) {
  const db = await dbPromise
  // 1. Crear el partido
  const [match] = await db
    .insert(matchesTable)
    .values({
      date,
      team1Id,
      team2Id,
      location,
      notes,
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

        goalsAllowed: 0,
        goalsSaved: 0,
      }))
    )
  }
  return {
    success: true,
    data: {
      id: match.id,
      match,
      players: allPlayers,
    },
  }
}

// Devuelve todos los partidos con los nombres y avatares de los equipos
export async function getAllMatchesWithTeams(): Promise<MatchWithTeams[]> {
  const db = await dbPromise

  // 1. Obtener todos los partidos (activos e inactivos)
  const matches = await db.select().from(matchesTable)

  if (!matches.length) return []

  // 2. Obtener los equipos involucrados
  const teamIds = [...new Set(matches.flatMap((m) => [m.team1Id, m.team2Id]))]

  const teams = await db
    .select()
    .from(organizationsTable)
    .where(inArray(organizationsTable.id, teamIds))

  // 3. Obtener datos en vivo para cada partido
  const liveScores = await db
    .select()
    .from(liveMatchScoreTable)
    .where(
      inArray(
        liveMatchScoreTable.matchId,
        matches.map((m) => m.id)
      )
    )

  // 4. Mapear los nombres y avatares de los equipos
  const result = matches.map((match) => {
    const team1 = teams.find((t) => t.id === match.team1Id)
    const team2 = teams.find((t) => t.id === match.team2Id)

    // Buscar datos en vivo para este partido
    const liveScore = liveScores.find((ls) => ls.matchId === match.id)

    return {
      id: match.id,
      date: match.date,
      team1: team1?.name || 'Unknown',
      team2: team2?.name || 'Unknown',
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      // Usar datos en vivo si están disponibles, sino usar datos del partido
      team1Goals: liveScore?.team1Goals ?? match.team1Goals,
      team2Goals: liveScore?.team2Goals ?? match.team2Goals,
      team1Avatar: team1?.avatar || '',
      team2Avatar: team2?.avatar || '',
      duration: match.duration,
      status: match.status,
      // Un partido está en vivo si tiene datos en liveMatchScoreTable
      isLive: !!liveScore,
      location: match.location || undefined,
      notes: match.notes,
    }
  })

  return result
}

export type MatchWithTeams = {
  id: string
  date: Date
  team1: string
  team2: string
  team1Id: string
  team2Id: string
  team1Goals: number
  team2Goals: number
  team1Avatar: string
  team2Avatar: string
  duration: number | null
  status: 'active' | 'inactive'
  isLive: boolean // Nuevo campo para indicar si está realmente en vivo
  location?: string // Ubicación del partido
  notes?: string | null // Notas del partido
}

// Obtener solo matches activos
export async function getActiveMatchesWithTeams(): Promise<MatchWithTeams[]> {
  const db = await dbPromise
  // 1. Obtener solo partidos activos
  const matches = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.status, 'active'))
  if (!matches.length) return []

  // 2. Obtener los equipos involucrados
  const teamIds = [...new Set(matches.flatMap((m) => [m.team1Id, m.team2Id]))]
  const teams = await db
    .select()
    .from(organizationsTable)
    .where(inArray(organizationsTable.id, teamIds))

  // 3. Obtener datos en vivo para cada partido
  const liveScores = await db
    .select()
    .from(liveMatchScoreTable)
    .where(
      inArray(
        liveMatchScoreTable.matchId,
        matches.map((m) => m.id)
      )
    )

  // 4. Mapear los nombres y avatares de los equipos, usando datos en vivo si están disponibles
  return matches.map((match) => {
    const team1 = teams.find((t) => t.id === match.team1Id)
    const team2 = teams.find((t) => t.id === match.team2Id)

    // Buscar datos en vivo para este partido
    const liveScore = liveScores.find((ls) => ls.matchId === match.id)

    return {
      id: match.id,
      date: match.date,
      team1: team1?.name || 'Unknown',
      team2: team2?.name || 'Unknown',
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      // Usar datos en vivo si están disponibles, sino usar datos del partido
      team1Goals: liveScore?.team1Goals ?? match.team1Goals,
      team2Goals: liveScore?.team2Goals ?? match.team2Goals,
      team1Avatar: team1?.avatar || '',
      team2Avatar: team2?.avatar || '',
      duration: match.duration,
      status: match.status,
      // Un partido está en vivo si tiene datos en liveMatchScoreTable
      isLive: !!liveScore,
      location: match.location || undefined,
    }
  })
}

// Devuelve un partido por id con los nombres y avatares de los equipos y los jugadores de ambos equipos
export async function getMatchWithPlayers(matchId: string) {
  const db = await dbPromise

  // 1. Obtener el partido
  const match = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId))
    .limit(1)

  if (!match.length) {
    return null
  }

  const matchData = match[0]

  // 2. Obtener los equipos
  const teams = await db
    .select()
    .from(organizationsTable)
    .where(
      inArray(organizationsTable.id, [matchData.team1Id, matchData.team2Id])
    )

  const team1 = teams.find((t) => t.id === matchData.team1Id)
  const team2 = teams.find((t) => t.id === matchData.team2Id)

  // 3. Obtener los jugadores de ambos equipos
  const players = await db
    .select()
    .from(playersTable)
    .where(
      inArray(playersTable.organizationId, [
        matchData.team1Id,
        matchData.team2Id,
      ])
    )

  const playersTeam1 = players.filter(
    (p) => p.organizationId === matchData.team1Id
  )
  const playersTeam2 = players.filter(
    (p) => p.organizationId === matchData.team2Id
  )

  return {
    id: matchData.id,
    date: matchData.date,
    team1: team1?.name || 'Unknown Team 1',
    team2: team2?.name || 'Unknown Team 2',
    team1Id: matchData.team1Id,
    team2Id: matchData.team2Id,
    team1Goals: matchData.team1Goals || 0,
    team2Goals: matchData.team2Goals || 0,
    team1Avatar: team1?.avatar || '',
    team2Avatar: team2?.avatar || '',
    duration: matchData.duration,
    status: matchData.status,
    location: matchData.location,
    playersTeam1: playersTeam1 || [],
    playersTeam2: playersTeam2 || [],
  }
}

// Obtener estadísticas actuales de un partido
export async function getMatchPlayerStats(matchId: string) {
  const db = await dbPromise
  const stats = await db
    .select({
      id: playerStatsTable.id,
      playerId: playerStatsTable.playerId,
      minutesPlayed: playerStatsTable.minutesPlayed,
      goals: playerStatsTable.goals,
      assists: playerStatsTable.assists,
      passesCompleted: playerStatsTable.passesCompleted,

      goalsAllowed: playerStatsTable.goalsAllowed,
      goalsSaved: playerStatsTable.goalsSaved,
    })
    .from(playerStatsTable)
    .where(eq(playerStatsTable.matchId, matchId))

  return stats
}

// Actualizar tiempo jugado de un jugador
export async function updatePlayerTimePlayed(
  playerStatId: string,
  minutesPlayed: number
) {
  const db = await dbPromise
  await db
    .update(playerStatsTable)
    .set({ minutesPlayed })
    .where(eq(playerStatsTable.id, playerStatId))
}

// Actualizar estadísticas de un jugador
export async function updatePlayerStats({
  playerStatId,
  stats,
}: {
  playerStatId: string
  stats: {
    goals?: number
    assists?: number
    passesCompleted?: number

    goalsAllowed?: number
    goalsSaved?: number
  }
}) {
  const db = await dbPromise

  // Obtener el playerId antes de actualizar
  const [playerStat] = await db
    .select({ playerId: playerStatsTable.playerId })
    .from(playerStatsTable)
    .where(eq(playerStatsTable.id, playerStatId))

  if (!playerStat) {
    throw new Error('Player stat not found')
  }

  // Actualizar las estadísticas del partido
  await db
    .update(playerStatsTable)
    .set(stats)
    .where(eq(playerStatsTable.id, playerStatId))

  // Importar y actualizar estadísticas acumulativas
  const { updatePlayerCumulativeStats } = await import('./player.action')
  await updatePlayerCumulativeStats(playerStat.playerId)
}

// Actualizar marcador del partido
export async function updateMatchScore({
  matchId,
  team1Goals,
  team2Goals,
}: {
  matchId: string
  team1Goals: number
  team2Goals: number
}) {
  const db = await dbPromise
  await db
    .update(matchesTable)
    .set({ team1Goals, team2Goals })
    .where(eq(matchesTable.id, matchId))
}

// Inicializar datos en vivo para un partido
export async function initializeLiveMatchData(matchId: string) {
  const db = await dbPromise

  // 1. Obtener el partido
  const match = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId))
    .limit(1)

  if (!match.length) return null

  const matchData = match[0]

  // 2. Obtener los equipos
  const teams = await db
    .select()
    .from(organizationsTable)
    .where(
      inArray(organizationsTable.id, [matchData.team1Id, matchData.team2Id])
    )

  const team1 = teams.find((t) => t.id === matchData.team1Id)
  const team2 = teams.find((t) => t.id === matchData.team2Id)

  // 3. Obtener los jugadores de ambos equipos
  const players = await db
    .select()
    .from(playersTable)
    .where(
      inArray(playersTable.organizationId, [
        matchData.team1Id,
        matchData.team2Id,
      ])
    )

  const playersTeam1 = players.filter(
    (p) => p.organizationId === matchData.team1Id
  )
  const playersTeam2 = players.filter(
    (p) => p.organizationId === matchData.team2Id
  )

  // 4. Preparar estadísticas iniciales de jugadores
  const initialPlayerStats: Record<
    string,
    {
      id: string
      timePlayed: number
      goals: number
      assists: number
      passesCompleted: number
      goalsAllowed: number
      goalsSaved: number
      isPlaying: boolean
    }
  > = {}

  ;[...playersTeam1, ...playersTeam2].forEach((player) => {
    initialPlayerStats[player.id] = {
      id: player.id,
      timePlayed: 0,
      goals: 0,
      assists: 0,
      passesCompleted: 0,
      goalsAllowed: 0,
      goalsSaved: 0,
      isPlaying: true,
    }
  })

  return {
    match: {
      id: matchData.id,
      date: matchData.date,
      team1: team1?.name || 'Unknown',
      team2: team2?.name || 'Unknown',
      team1Id: matchData.team1Id,
      team2Id: matchData.team2Id,
      team1Goals: matchData.team1Goals,
      team2Goals: matchData.team2Goals,
      team1Avatar: team1?.avatar || '',
      team2Avatar: team2?.avatar || '',
      duration: matchData.duration,
      status: matchData.status,
      location: matchData.location,
    },
    playersTeam1,
    playersTeam2,
    initialPlayerStats,
  }
}

// Obtener datos en vivo de un partido
export async function getLiveMatchData(matchId: string) {
  const db = await dbPromise

  // 1. Obtener el partido
  const match = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId))
    .limit(1)

  if (!match.length) return null

  const matchData = match[0]

  // 2. Obtener los equipos
  const teams = await db
    .select()
    .from(organizationsTable)
    .where(
      inArray(organizationsTable.id, [matchData.team1Id, matchData.team2Id])
    )

  const team1 = teams.find((t) => t.id === matchData.team1Id)
  const team2 = teams.find((t) => t.id === matchData.team2Id)

  // 3. Obtener los jugadores de ambos equipos
  const players = await db
    .select()
    .from(playersTable)
    .where(
      inArray(playersTable.organizationId, [
        matchData.team1Id,
        matchData.team2Id,
      ])
    )

  const playersTeam1 = players.filter(
    (p) => p.organizationId === matchData.team1Id
  )
  const playersTeam2 = players.filter(
    (p) => p.organizationId === matchData.team2Id
  )

  // 4. Obtener datos en vivo (si existen)
  const liveData = await db
    .select()
    .from(liveMatchDataTable)
    .where(eq(liveMatchDataTable.matchId, matchId))

  return {
    match: {
      id: matchData.id,
      date: matchData.date,
      team1: team1?.name || 'Unknown',
      team2: team2?.name || 'Unknown',
      team1Id: matchData.team1Id,
      team2Id: matchData.team2Id,
      team1Goals: matchData.team1Goals,
      team2Goals: matchData.team2Goals,
      team1Avatar: team1?.avatar || '',
      team2Avatar: team2?.avatar || '',
      duration: matchData.duration,
      status: matchData.status,
      location: matchData.location,
    },
    playersTeam1,
    playersTeam2,
    liveData,
  }
}

// Función de debug para verificar el estado de la base de datos
export async function debugLiveMatchData(matchId: string) {
  const db = await dbPromise

  // Verificar todos los datos en live_match_data
  const allLiveData = await db.select().from(liveMatchDataTable)

  // Verificar datos específicos del partido
  const matchLiveData = await db
    .select()
    .from(liveMatchDataTable)
    .where(eq(liveMatchDataTable.matchId, matchId))

  // Verificar datos de score
  const allLiveScores = await db.select().from(liveMatchScoreTable)

  const matchLiveScore = await db
    .select()
    .from(liveMatchScoreTable)
    .where(eq(liveMatchScoreTable.matchId, matchId))

  return {
    allLiveData: allLiveData.length,
    matchLiveData: matchLiveData.length,
    allLiveScores: allLiveScores.length,
    matchLiveScore: matchLiveScore.length,
  }
}

// Actualizar estadísticas en vivo
export async function updateLivePlayerStats({
  matchId,
  playerId,
  stats,
}: {
  matchId: string
  playerId: string
  stats: {
    goals?: number
    assists?: number
    passesCompleted?: number

    goalsAllowed?: number
    goalsSaved?: number
    timePlayed?: number
    isPlaying?: boolean
  }
}) {
  const db = await dbPromise

  // Filtrar solo los campos que se pueden actualizar
  const updateableStats = {
    isPlaying: stats.isPlaying,
    timePlayed: stats.timePlayed,
    goals: stats.goals,
    assists: stats.assists,
    passesCompleted: stats.passesCompleted,

    goalsAllowed: stats.goalsAllowed,
    goalsSaved: stats.goalsSaved,
    updatedAt: new Date(),
  }

  // Verificar si el registro existe
  const existingRecord = await db
    .select()
    .from(liveMatchDataTable)
    .where(
      and(
        eq(liveMatchDataTable.matchId, matchId),
        eq(liveMatchDataTable.playerId, playerId)
      )
    )
    .limit(1)

  let result

  if (existingRecord.length > 0) {
    // Actualizar registro existente
    result = await db
      .update(liveMatchDataTable)
      .set(updateableStats)
      .where(
        and(
          eq(liveMatchDataTable.matchId, matchId),
          eq(liveMatchDataTable.playerId, playerId)
        )
      )
      .returning()
  } else {
    // Crear nuevo registro
    result = await db
      .insert(liveMatchDataTable)
      .values({
        matchId,
        playerId,
        ...updateableStats,
      })
      .returning()
  }

  return result
}

// Actualizar marcador en vivo
export async function updateLiveMatchScore({
  matchId,
  team1Goals,
  team2Goals,
}: {
  matchId: string
  team1Goals: number
  team2Goals: number
}) {
  const db = await dbPromise

  // Verificar si el registro existe
  const existingRecord = await db
    .select()
    .from(liveMatchScoreTable)
    .where(eq(liveMatchScoreTable.matchId, matchId))
    .limit(1)

  if (existingRecord.length > 0) {
    // Actualizar registro existente
    await db
      .update(liveMatchScoreTable)
      .set({
        team1Goals,
        team2Goals,
        updatedAt: new Date(),
      })
      .where(eq(liveMatchScoreTable.matchId, matchId))
  } else {
    // Crear nuevo registro
    await db.insert(liveMatchScoreTable).values({
      matchId,
      team1Goals,
      team2Goals,
      isLive: true,
    })
  }
}

// Finalizar partido - transferir datos de live a permanentes
export async function endLiveMatch(matchId: string) {
  const db = await dbPromise

  // Obtener datos en vivo para este partido específico
  const liveData = await db
    .select()
    .from(liveMatchDataTable)
    .where(eq(liveMatchDataTable.matchId, matchId))

  const liveScore = await db
    .select()
    .from(liveMatchScoreTable)
    .where(eq(liveMatchScoreTable.matchId, matchId))
    .limit(1)

  // Si no hay datos en vivo, crear datos básicos
  if (!liveData.length && !liveScore.length) {
    // Obtener el partido
    const [match] = await db
      .select()
      .from(matchesTable)
      .where(eq(matchesTable.id, matchId))
      .limit(1)

    if (!match) throw new Error('Match not found')

    // Crear datos en vivo básicos
    await initializeLiveMatchData(matchId)

    // Obtener los datos nuevamente
    const newLiveData = await db
      .select()
      .from(liveMatchDataTable)
      .where(eq(liveMatchDataTable.matchId, matchId))

    const newLiveScore = await db
      .select()
      .from(liveMatchScoreTable)
      .where(eq(liveMatchScoreTable.matchId, matchId))
      .limit(1)

    if (!newLiveScore.length)
      throw new Error('Failed to initialize live match data')

    // Usar los nuevos datos
    liveData.push(...newLiveData)
    liveScore.push(newLiveScore[0])
  } else if (liveData.length > 0 && !liveScore.length) {
    // Tenemos datos de jugadores pero no de score, crear score básico
    await db.insert(liveMatchScoreTable).values({
      matchId,
      team1Goals: 0,
      team2Goals: 0,
      isLive: true,
    })

    const newLiveScore = await db
      .select()
      .from(liveMatchScoreTable)
      .where(eq(liveMatchScoreTable.matchId, matchId))
      .limit(1)

    liveScore.push(newLiveScore[0])
  }

  const finalScore = liveScore[0]

  // Actualizar marcador final, duración y estado en matches
  await db
    .update(matchesTable)
    .set({
      team1Goals: finalScore.team1Goals,
      team2Goals: finalScore.team2Goals,
      duration: Math.max(...liveData.map((stat) => stat.timePlayed), 0), // Duración en segundos
      status: 'inactive', // Marcar como terminado
    })
    .where(eq(matchesTable.id, matchId))

  // Preparar todas las operaciones de actualización de player_stats en paralelo
  const playerStatsPromises = liveData.map(async (liveStat) => {
    try {
      // Calcular el tiempo real jugado
      const maxTimePlayed = 5400 // 90 minutos en segundos
      const actualTimePlayed = Math.min(liveStat.timePlayed, maxTimePlayed)
      const minutesPlayed = Math.floor(actualTimePlayed / 60)

      // Verificar si ya existe un registro en player_stats
      const existingStat = await db
        .select()
        .from(playerStatsTable)
        .where(
          and(
            eq(playerStatsTable.matchId, matchId),
            eq(playerStatsTable.playerId, liveStat.playerId)
          )
        )
        .limit(1)

      if (existingStat.length > 0) {
        // Actualizar registro existente
        return db
          .update(playerStatsTable)
          .set({
            minutesPlayed: minutesPlayed,
            goals: liveStat.goals,
            assists: liveStat.assists,
            passesCompleted: liveStat.passesCompleted,
            goalsAllowed: liveStat.goalsAllowed,
            goalsSaved: liveStat.goalsSaved,
          })
          .where(eq(playerStatsTable.id, existingStat[0].id))
      } else {
        // Crear nuevo registro
        return db.insert(playerStatsTable).values({
          matchId,
          playerId: liveStat.playerId,
          minutesPlayed: minutesPlayed,
          goals: liveStat.goals,
          assists: liveStat.assists,
          passesCompleted: liveStat.passesCompleted,
          goalsAllowed: liveStat.goalsAllowed,
          goalsSaved: liveStat.goalsSaved,
        })
      }
    } catch (error) {
      console.error(`Error processing player ${liveStat.playerId}:`, error)
      return null
    }
  })

  // Ejecutar todas las actualizaciones de player_stats en paralelo
  await Promise.all(playerStatsPromises)

  // Actualizar estadísticas acumulativas en paralelo
  const cumulativeStatsPromises = liveData.map(async (liveStat) => {
    try {
      await db
        .update(playersTable)
        .set({
          totalGoals: sql`COALESCE(${playersTable.totalGoals}, 0) + ${liveStat.goals}`,
          totalAssists: sql`COALESCE(${playersTable.totalAssists}, 0) + ${liveStat.assists}`,
          totalPassesCompleted: sql`COALESCE(${playersTable.totalPassesCompleted}, 0) + ${liveStat.passesCompleted}`,
          updatedAt: new Date(),
        })
        .where(eq(playersTable.id, liveStat.playerId))
    } catch (error) {
      console.error(
        `❌ Error actualizando stats acumulativas para jugador ${liveStat.playerId}:`,
        error
      )
    }
  })

  // Ejecutar actualizaciones acumulativas en paralelo
  await Promise.all(cumulativeStatsPromises)

  // Limpiar datos en vivo en paralelo
  const cleanupPromises = [
    db
      .delete(liveMatchDataTable)
      .where(eq(liveMatchDataTable.matchId, matchId)),
    db
      .delete(liveMatchScoreTable)
      .where(eq(liveMatchScoreTable.matchId, matchId)),
  ]

  await Promise.all(cleanupPromises)

  return { success: true }
}

// Crear un evento del partido
export async function createMatchEvent({
  matchId,
  playerId,
  eventType,
  minute,
  teamId,
  description,
}: {
  matchId: string
  playerId?: string
  eventType:
    | 'goal'
    | 'assist'
    | 'yellow_card'
    | 'red_card'
    | 'substitution'
    | 'injury'
    | 'pass'
    | 'goal_saved'
    | 'goal_allowed'
    | 'player_in'
    | 'player_out'
    | 'half_time'
    | 'resume_match'
  minute: number
  teamId: string
  description?: string
}) {
  const db = await dbPromise

  const [event] = await db
    .insert(matchEventsTable)
    .values({
      matchId,
      playerId,
      eventType,
      minute,
      teamId,
      description,
    })
    .returning()

  return event
}

// Obtener eventos de un partido
export async function getMatchEvents(matchId: string) {
  const db = await dbPromise

  const events = await db
    .select({
      id: matchEventsTable.id,
      minute: matchEventsTable.minute,
      eventType: matchEventsTable.eventType,
      description: matchEventsTable.description,
      teamId: matchEventsTable.teamId,
      playerId: matchEventsTable.playerId,
      playerName: playersTable.name,
      playerLastName: playersTable.lastName,
      playerAvatar: playersTable.avatar,
      teamName: organizationsTable.name,
      teamAvatar: organizationsTable.avatar,
    })
    .from(matchEventsTable)
    .leftJoin(playersTable, eq(matchEventsTable.playerId, playersTable.id))
    .leftJoin(
      organizationsTable,
      eq(matchEventsTable.teamId, organizationsTable.id)
    )
    .where(eq(matchEventsTable.matchId, matchId))
    .orderBy(matchEventsTable.minute)

  return events.map((event) => {
    // Asegurar que playerId no sea undefined en la serialización
    const playerId = event.playerId || null

    const mappedEvent = {
      id: event.id,
      minute: event.minute,
      eventType: event.eventType,
      playerId: playerId, // Asegurar que no sea undefined
      playerName:
        event.playerName && event.playerLastName
          ? `${event.playerName} ${event.playerLastName}`
          : playerId
          ? 'Unknown Player'
          : undefined, // Eventos sin playerId (como goles de equipo) no tienen playerName
      playerAvatar:
        event.playerAvatar && event.playerAvatar.trim() !== ''
          ? event.playerAvatar
          : null, // Asegurar que no sea string vacío
      teamName: event.teamName || 'Unknown',
      teamAvatar: event.teamAvatar,
      description: event.description,
      teamId: event.teamId, // Agregar teamId para posicionamiento
    }

    return mappedEvent
  })
}

// Verificar si un partido ya terminó
export async function checkMatchStatus(matchId: string) {
  const db = await dbPromise

  const [match] = await db
    .select({ status: matchesTable.status })
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId))
    .limit(1)

  return match?.status === 'inactive'
}

// Resetear el estado de un partido a activo
export async function resetMatchStatus(matchId: string) {
  const db = await dbPromise

  await db
    .update(matchesTable)
    .set({ status: 'active' })
    .where(eq(matchesTable.id, matchId))
}

// Verificar si un partido existe
export async function checkMatchExists(matchId: string) {
  const db = await dbPromise
  const match = await db
    .select({ id: matchesTable.id })
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId))
    .limit(1)

  console.log('Checking if match exists:', matchId, 'Result:', match)
  return match.length > 0
}
