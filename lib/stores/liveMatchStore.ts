import { create } from 'zustand'
import { toast } from 'sonner'

export interface PlayerStat {
  id: string
  isPlaying: boolean
  timePlayed: number // segundos
  goals: number
  assists: number
  goalsSaved: number
  goalsAllowed: number
  passesCompleted: number
}

export interface MatchEvent {
  id: string
  minute: number
  timestamp?: number // Agregar timestamp para ordenamiento correcto (opcional)
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
  playerId?: string
  teamId: string
  teamName: string
  playerName?: string
  playerAvatar?: string
  description?: string
}

interface LiveMatchStore {
  // Estado del partido
  matchId: string | null
  timer: number
  isRunning: boolean
  isHalfTime: boolean
  isMatchEnded: boolean
  hasUsedHalfTime: boolean

  // Marcador
  team1Goals: number
  team2Goals: number

  // Jugadores y sus stats
  playerStats: Record<string, PlayerStat>

  // Jugadores por equipo (para buscar porteros)
  playersTeam1: {
    id: string
    name: string
    lastName: string
    position?: string | null
    avatar?: string | null
  }[]
  playersTeam2: {
    id: string
    name: string
    lastName: string
    position?: string | null
    avatar?: string | null
  }[]

  // IDs de equipos
  team1Id: string
  team2Id: string

  // Eventos del partido
  events: MatchEvent[]

  // Acciones
  initializeMatch: (
    matchId: string,
    initialPlayerStats: Record<string, PlayerStat>,
    playersTeam1: {
      id: string
      name: string
      lastName: string
      position?: string | null
      avatar?: string | null
    }[],
    playersTeam2: {
      id: string
      name: string
      lastName: string
      position?: string | null
      avatar?: string | null
    }[],
    team1Id: string,
    team2Id: string
  ) => void
  startMatch: () => void
  pauseMatch: () => void
  resumeMatch: () => void
  endMatch: () => void
  updateTimer: () => void
  addGoal: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => void
  addTeamGoal: (
    team: 'team1' | 'team2',
    teamId: string,
    teamName: string
  ) => void
  hasRegisteredPlayers: (team: 'team1' | 'team2') => boolean
  addAssist: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => void
  addPass: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => void
  addGoalSaved: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => void
  addGoalAllowed: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => void
  addEvent: (event: Omit<MatchEvent, 'id'>) => void
  togglePlayer: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => void
  saveToDatabase: () => Promise<void>
  reset: () => void
}

export const useLiveMatchStore = create<LiveMatchStore>((set, get) => ({
  // Estado inicial
  matchId: null,
  timer: 0,
  isRunning: false,
  isHalfTime: false,
  isMatchEnded: false,
  hasUsedHalfTime: false,
  team1Goals: 0,
  team2Goals: 0,
  playerStats: {},
  playersTeam1: [],
  playersTeam2: [],
  team1Id: '',
  team2Id: '',
  events: [],

  // Inicializar partido
  initializeMatch: (
    matchId: string,
    initialPlayerStats: Record<string, PlayerStat>,
    playersTeam1: {
      id: string
      name: string
      lastName: string
      position?: string | null
      avatar?: string | null
    }[],
    playersTeam2: {
      id: string
      name: string
      lastName: string
      position?: string | null
      avatar?: string | null
    }[],
    team1Id: string,
    team2Id: string
  ) => {
    set({
      matchId,
      timer: 0,
      isRunning: false,
      isHalfTime: false,
      isMatchEnded: false,
      team1Goals: 0,
      team2Goals: 0,
      playerStats: initialPlayerStats,
      playersTeam1,
      playersTeam2,
      team1Id,
      team2Id,
      events: [],
    })
  },

  // Iniciar partido
  startMatch: () => {
    set({ isRunning: true })
    toast.success('Match started!')
  },

  // Pausar partido (Half Time)
  pauseMatch: () => {
    const { timer } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    set({ isHalfTime: true, isRunning: false })

    // Agregar evento de Half Time
    get().addEvent({
      minute: currentMinute,
      eventType: 'half_time',
      teamId: get().team1Id, // Usar team1Id como valor por defecto
      teamName: 'Match Event',
      description: 'Half Time - Match Paused',
    })

    toast.success('Match paused - Half Time')
  },

  // Reanudar partido
  resumeMatch: () => {
    const { timer } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    set({ isHalfTime: false, isRunning: true, hasUsedHalfTime: true })

    // Agregar evento de Resume
    get().addEvent({
      minute: currentMinute,
      eventType: 'resume_match',
      teamId: get().team1Id, // Usar team1Id como valor por defecto
      teamName: 'Match Event',
      description: 'Match Resumed',
    })

    toast.success('Match resumed!')
  },

  // Terminar partido
  endMatch: () => {
    set({ isMatchEnded: true, isRunning: false })
    toast.success('Match ended!')
  },

  // Actualizar timer
  updateTimer: () => {
    const { isRunning, isHalfTime } = get()
    if (!isRunning || isHalfTime) return

    set((state) => {
      const newTime = state.timer + 1

      // Actualizar tiempo de jugadores activos
      const updatedPlayerStats = { ...state.playerStats }
      Object.keys(updatedPlayerStats).forEach((playerId) => {
        if (updatedPlayerStats[playerId].isPlaying) {
          updatedPlayerStats[playerId].timePlayed = newTime
        }
      })

      return {
        timer: newTime,
        playerStats: updatedPlayerStats,
      }
    })
  },

  // Agregar gol de jugador
  addGoal: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    const { timer, playerStats, team1Goals, team2Goals } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    // Verificar que el jugador existe en playerStats
    if (!playerStats[playerId]) {
      console.error(`Player ${playerId} not found in playerStats`)
      toast.error('Player not found')
      return
    }

    // Actualizar stats del jugador
    const updatedPlayerStats = { ...playerStats }
    updatedPlayerStats[playerId] = {
      ...updatedPlayerStats[playerId],
      goals: (updatedPlayerStats[playerId].goals || 0) + 1,
    }

    // Actualizar marcador del equipo
    const newTeam1Goals = team === 'team1' ? team1Goals + 1 : team1Goals
    const newTeam2Goals = team === 'team2' ? team2Goals + 1 : team2Goals

    set({
      playerStats: updatedPlayerStats,
      team1Goals: newTeam1Goals,
      team2Goals: newTeam2Goals,
    })

    // Buscar el jugador para obtener su avatar
    const allPlayers = [...get().playersTeam1, ...get().playersTeam2]
    const player = allPlayers.find((p) => p.id === playerId)

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'goal',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
      playerAvatar: player?.avatar || undefined,
      description: `${playerName} scored a goal`,
    })

    toast.success(`Goal! ${newTeam1Goals}-${newTeam2Goals}`)
  },

  // Agregar gol del equipo (jugadores no registrados)
  addTeamGoal: (team: 'team1' | 'team2', teamId: string, teamName: string) => {
    const { timer, team1Goals, team2Goals, playersTeam1, playersTeam2 } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    // Actualizar marcador del equipo
    const newTeam1Goals = team === 'team1' ? team1Goals + 1 : team1Goals
    const newTeam2Goals = team === 'team2' ? team2Goals + 1 : team2Goals

    set({
      team1Goals: newTeam1Goals,
      team2Goals: newTeam2Goals,
    })

    // Agregar evento del gol
    get().addEvent({
      minute: currentMinute,
      eventType: 'goal',
      teamId,
      teamName,
      description: `${teamName} scored a goal`,
    })

    // Buscar automáticamente el portero del equipo contrario y marcar goal_allowed
    const opposingTeam = team === 'team1' ? playersTeam2 : playersTeam1
    const goalkeeper = opposingTeam.find(
      (player) => player.position === 'goalkeeper'
    )

    if (goalkeeper) {
      // Marcar goal_allowed para el portero
      const updatedPlayerStats = { ...get().playerStats }
      if (updatedPlayerStats[goalkeeper.id]) {
        updatedPlayerStats[goalkeeper.id] = {
          ...updatedPlayerStats[goalkeeper.id],
          goalsAllowed:
            (updatedPlayerStats[goalkeeper.id].goalsAllowed || 0) + 1,
        }

        set({ playerStats: updatedPlayerStats })

        // Agregar evento de goal_allowed
        get().addEvent({
          minute: currentMinute,
          eventType: 'goal_allowed',
          playerId: goalkeeper.id,
          teamId: team === 'team1' ? get().team2Id : get().team1Id,
          teamName: team === 'team1' ? 'Team 2' : 'Team 1',
          playerName: `${goalkeeper.name} ${goalkeeper.lastName}`,
          description: `${goalkeeper.name} ${goalkeeper.lastName} allowed a goal`,
        })
      }
    }

    toast.success(`Team Goal! ${newTeam1Goals}-${newTeam2Goals}`)
  },

  // Verificar si un equipo tiene jugadores registrados
  hasRegisteredPlayers: (team: 'team1' | 'team2') => {
    const { playersTeam1, playersTeam2 } = get()
    const teamPlayers = team === 'team1' ? playersTeam1 : playersTeam2
    return teamPlayers.length > 0
  },

  // Agregar asistencia
  addAssist: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    const { timer, playerStats } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    // Verificar que el jugador existe en playerStats
    if (!playerStats[playerId]) {
      console.error(`Player ${playerId} not found in playerStats`)
      toast.error('Player not found')
      return
    }

    // Actualizar stats del jugador
    const updatedPlayerStats = { ...playerStats }
    updatedPlayerStats[playerId] = {
      ...updatedPlayerStats[playerId],
      assists: (updatedPlayerStats[playerId].assists || 0) + 1,
    }

    set({ playerStats: updatedPlayerStats })

    // Buscar el jugador para obtener su avatar
    const allPlayers = [...get().playersTeam1, ...get().playersTeam2]
    const player = allPlayers.find((p) => p.id === playerId)

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'assist',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
      playerAvatar: player?.avatar || undefined,
      description: `${playerName} provided an assist`,
    })

    toast.success('Assist recorded!')
  },

  // Agregar pase
  addPass: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    const { timer, playerStats } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    // Verificar que el jugador existe en playerStats
    if (!playerStats[playerId]) {
      console.error(`Player ${playerId} not found in playerStats`)
      toast.error('Player not found')
      return
    }

    // Actualizar stats del jugador
    const updatedPlayerStats = { ...playerStats }
    updatedPlayerStats[playerId] = {
      ...updatedPlayerStats[playerId],
      passesCompleted: (updatedPlayerStats[playerId].passesCompleted || 0) + 1,
    }

    set({ playerStats: updatedPlayerStats })

    // Buscar el jugador para obtener su avatar
    const allPlayers = [...get().playersTeam1, ...get().playersTeam2]
    const player = allPlayers.find((p) => p.id === playerId)

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'pass',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
      playerAvatar: player?.avatar || undefined,
      description: `${playerName} completed a pass`,
    })

    toast.success('Pass recorded!')
  },

  // Agregar gol salvado
  addGoalSaved: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    const { timer, playerStats } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    // Verificar que el jugador existe en playerStats
    if (!playerStats[playerId]) {
      console.error(`Player ${playerId} not found in playerStats`)
      toast.error('Player not found')
      return
    }

    // Actualizar stats del jugador
    const updatedPlayerStats = { ...playerStats }
    updatedPlayerStats[playerId] = {
      ...updatedPlayerStats[playerId],
      goalsSaved: (updatedPlayerStats[playerId].goalsSaved || 0) + 1,
    }

    set({ playerStats: updatedPlayerStats })

    // Buscar el jugador para obtener su avatar
    const allPlayers = [...get().playersTeam1, ...get().playersTeam2]
    const player = allPlayers.find((p) => p.id === playerId)

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'goal_saved',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
      playerAvatar: player?.avatar || undefined,
      description: `${playerName} saved a goal`,
    })

    toast.success('Goal saved!')
  },

  // Agregar gol permitido
  addGoalAllowed: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    const { timer, playerStats, team1Goals, team2Goals } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    // Verificar que el jugador existe en playerStats
    if (!playerStats[playerId]) {
      console.error(`Player ${playerId} not found in playerStats`)
      toast.error('Player not found')
      return
    }

    // Actualizar stats del jugador
    const updatedPlayerStats = { ...playerStats }
    updatedPlayerStats[playerId] = {
      ...updatedPlayerStats[playerId],
      goalsAllowed: (updatedPlayerStats[playerId].goalsAllowed || 0) + 1,
    }

    // Agregar gol al equipo contrario
    const newTeam1Goals = team === 'team1' ? team1Goals : team1Goals + 1
    const newTeam2Goals = team === 'team2' ? team2Goals : team2Goals + 1

    set({
      playerStats: updatedPlayerStats,
      team1Goals: newTeam1Goals,
      team2Goals: newTeam2Goals,
    })

    // Agregar evento de gol para el equipo contrario
    const opposingTeamId = team === 'team1' ? get().team2Id : get().team1Id
    const opposingTeamName = team === 'team1' ? 'Team 2' : 'Team 1'

    get().addEvent({
      minute: currentMinute,
      eventType: 'goal',
      teamId: opposingTeamId,
      teamName: opposingTeamName,
      description: `Goal scored against ${playerName}`,
    })

    // Buscar el jugador para obtener su avatar
    const allPlayers = [...get().playersTeam1, ...get().playersTeam2]
    const player = allPlayers.find((p) => p.id === playerId)

    // Agregar evento de goal_allowed para el portero
    get().addEvent({
      minute: currentMinute,
      eventType: 'goal_allowed',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
      playerAvatar: player?.avatar || undefined,
      description: `${playerName} allowed a goal`,
    })

    toast.success(`Goal allowed! ${newTeam1Goals}-${newTeam2Goals}`)
  },

  // Agregar evento
  addEvent: (event: Omit<MatchEvent, 'id'>) => {
    const newEvent: MatchEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    }

    set((state) => ({
      events: [...state.events, newEvent],
    }))
  },

  // Toggle jugador (entrar/salir)
  togglePlayer: (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    const { timer, playerStats } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    // Verificar que el jugador existe en playerStats
    if (!playerStats[playerId]) {
      console.error(`Player ${playerId} not found in playerStats`)
      toast.error('Player not found')
      return
    }

    const currentPlayer = playerStats[playerId]
    const newIsPlaying = !currentPlayer.isPlaying

    // Actualizar stats del jugador
    const updatedPlayerStats = { ...playerStats }
    updatedPlayerStats[playerId] = {
      ...updatedPlayerStats[playerId],
      isPlaying: newIsPlaying,
    }

    set({ playerStats: updatedPlayerStats })

    // Buscar el jugador para obtener su avatar
    const allPlayers = [...get().playersTeam1, ...get().playersTeam2]
    const player = allPlayers.find((p) => p.id === playerId)

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: newIsPlaying ? 'player_in' : 'player_out',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
      playerAvatar: player?.avatar || undefined,
      description: newIsPlaying
        ? `${playerName} entered the match`
        : `${playerName} left the match`,
    })

    toast.success(
      newIsPlaying
        ? `${playerName} is now playing`
        : `${playerName} is now on bench`
    )
  },

  // Guardar todo a la base de datos
  saveToDatabase: async () => {
    const { matchId, playerStats, events, team1Goals, team2Goals } = get()

    console.log('🔄 Iniciando saveToDatabase...')
    console.log('📊 MatchId:', matchId)
    console.log('📊 PlayerStats:', Object.keys(playerStats).length, 'players')
    console.log('📊 Events:', events.length, 'events')
    console.log('📊 Score:', team1Goals, '-', team2Goals)

    if (!matchId) {
      console.log('❌ No matchId found')
      toast.error('No match to save')
      return
    }

    try {
      console.log('📦 Importando funciones de BD...')
      // Importar las funciones de la BD
      const {
        updateLivePlayerStats,
        updateLiveMatchScore,
        createMatchEvent,
        endLiveMatch,
      } = await import('@/lib/actions/matches.action')

      // Guardar stats de jugadores en paralelo para reducir tiempo
      console.log('👥 Guardando stats de jugadores...')
      const playerUpdatePromises = Object.entries(playerStats).map(
        async ([playerId, stats]) => {
          console.log('📊 Guardando stats para jugador:', playerId)
          return updateLivePlayerStats({
            matchId,
            playerId,
            stats: {
              isPlaying: stats.isPlaying,
              timePlayed: stats.timePlayed,
              goals: stats.goals,
              assists: stats.assists,
              passesCompleted: stats.passesCompleted,
              goalsAllowed: stats.goalsAllowed,
              goalsSaved: stats.goalsSaved,
            },
          })
        }
      )

      // Guardar marcador
      console.log('⚽ Guardando marcador:', team1Goals, '-', team2Goals)
      const scoreUpdatePromise = updateLiveMatchScore({
        matchId,
        team1Goals,
        team2Goals,
      })

      // Ejecutar actualizaciones de jugadores y marcador en paralelo
      await Promise.all([...playerUpdatePromises, scoreUpdatePromise])

      // Guardar eventos en paralelo
      console.log('📝 Guardando eventos...')
      const eventPromises = events.map(async (event) => {
        console.log(
          '📊 Guardando evento:',
          event.eventType,
          'min',
          event.minute,
          'playerId:',
          event.playerId,
          'playerName:',
          event.playerName
        )
        return createMatchEvent({
          matchId,
          playerId: event.playerId,
          eventType: event.eventType,
          minute: event.minute,
          teamId: event.teamId,
          description: event.description,
        })
      })

      // Ejecutar guardado de eventos en paralelo
      await Promise.all(eventPromises)

      // Terminar partido en BD (esto transferirá los datos de live a permanentes)
      console.log('🏁 Terminando partido en BD...')
      await endLiveMatch(matchId)

      console.log('✅ Match guardado exitosamente!')
      toast.success('Match saved successfully!')
    } catch (error) {
      console.error('❌ Error saving match:', error)
      toast.error('Failed to save match')
    }
  },

  // Reset store
  reset: () => {
    set({
      matchId: null,
      timer: 0,
      isRunning: false,
      isHalfTime: false,
      isMatchEnded: false,
      hasUsedHalfTime: false,
      team1Goals: 0,
      team2Goals: 0,
      playerStats: {},
      playersTeam1: [],
      playersTeam2: [],
      team1Id: '',
      team2Id: '',
      events: [],
    })
  },
}))
