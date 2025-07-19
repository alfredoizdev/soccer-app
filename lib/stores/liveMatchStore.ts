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
  description?: string
}

interface LiveMatchStore {
  // Estado del partido
  matchId: string | null
  timer: number
  isRunning: boolean
  isHalfTime: boolean
  isMatchEnded: boolean

  // Marcador
  team1Goals: number
  team2Goals: number

  // Jugadores y sus stats
  playerStats: Record<string, PlayerStat>

  // Eventos del partido
  events: MatchEvent[]

  // Acciones
  initializeMatch: (
    matchId: string,
    initialPlayerStats: Record<string, PlayerStat>
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
  team1Goals: 0,
  team2Goals: 0,
  playerStats: {},
  events: [],

  // Inicializar partido
  initializeMatch: (
    matchId: string,
    initialPlayerStats: Record<string, PlayerStat>
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
      teamId: '',
      teamName: '',
      description: 'Half Time - Match Paused',
    })

    toast.success('Match paused - Half Time')
  },

  // Reanudar partido
  resumeMatch: () => {
    const { timer } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    set({ isHalfTime: false, isRunning: true })

    // Agregar evento de Resume
    get().addEvent({
      minute: currentMinute,
      eventType: 'resume_match',
      teamId: '',
      teamName: '',
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

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'goal',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
      description: `${playerName} scored a goal`,
    })

    toast.success(`Goal! ${newTeam1Goals}-${newTeam2Goals}`)
  },

  // Agregar gol del equipo (jugadores no registrados)
  addTeamGoal: (team: 'team1' | 'team2', teamId: string, teamName: string) => {
    const { timer, team1Goals, team2Goals } = get()
    const currentMinute = Math.max(1, Math.floor(timer / 60))

    // Actualizar marcador del equipo
    const newTeam1Goals = team === 'team1' ? team1Goals + 1 : team1Goals
    const newTeam2Goals = team === 'team2' ? team2Goals + 1 : team2Goals

    set({
      team1Goals: newTeam1Goals,
      team2Goals: newTeam2Goals,
    })

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'goal',
      teamId,
      teamName,
      description: `${teamName} scored a goal`,
    })

    toast.success(`Team Goal! ${newTeam1Goals}-${newTeam2Goals}`)
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

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'assist',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
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

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'pass',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
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

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'goal_saved',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
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
      goalsAllowed: (updatedPlayerStats[playerId].goalsAllowed || 0) + 1,
    }

    set({ playerStats: updatedPlayerStats })

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: 'goal_allowed',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
      description: `${playerName} allowed a goal`,
    })

    toast.success('Goal allowed recorded!')
  },

  // Agregar evento
  addEvent: (event: Omit<MatchEvent, 'id'>) => {
    const newEvent: MatchEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random()}`,
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

    // Agregar evento
    get().addEvent({
      minute: currentMinute,
      eventType: newIsPlaying ? 'player_in' : 'player_out',
      playerId,
      teamId,
      teamName: team === 'team1' ? 'Team 1' : 'Team 2',
      playerName,
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

    if (!matchId) {
      toast.error('No match to save')
      return
    }

    try {
      // Importar las funciones de la BD
      const {
        updateLivePlayerStats,
        updateLiveMatchScore,
        createMatchEvent,
        endLiveMatch,
      } = await import('@/lib/actions/matches.action')

      // Guardar stats de jugadores
      for (const [playerId, stats] of Object.entries(playerStats)) {
        await updateLivePlayerStats({
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

      // Guardar marcador
      await updateLiveMatchScore({
        matchId,
        team1Goals,
        team2Goals,
      })

      // Guardar eventos
      for (const event of events) {
        if (
          event.eventType !== 'half_time' &&
          event.eventType !== 'resume_match'
        ) {
          await createMatchEvent({
            matchId,
            playerId: event.playerId,
            eventType: event.eventType,
            minute: event.minute,
            teamId: event.teamId,
            description: event.description,
          })
        }
      }

      // Terminar partido en BD
      await endLiveMatch(matchId)

      toast.success('Match saved successfully!')
    } catch (error) {
      console.error('Error saving match:', error)
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
      team1Goals: 0,
      team2Goals: 0,
      playerStats: {},
      events: [],
    })
  },
}))
