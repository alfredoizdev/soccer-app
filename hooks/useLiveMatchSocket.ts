import { useEffect, useState } from 'react'
import { socket } from '@/app/socket'

interface Player {
  id: string
  name: string
  lastName: string
  avatar?: string | null
  jerseyNumber?: number | null
  position?: string | null
  status?: string | null
  goals?: number
  assists?: number
  saves?: number
  goalsAllowed?: number
}

interface Match {
  id: string
  date: string | Date
  team1: string
  team2: string
  team1Id: string
  team2Id: string
  team1Goals: number
  team2Goals: number
  team1Avatar: string
  team2Avatar: string
}

interface UseLiveMatchSocketProps {
  match: Match
  playersTeam1: Player[]
  playersTeam2: Player[]
}

export function useLiveMatchSocket({
  match,
  playersTeam1,
  playersTeam2,
}: UseLiveMatchSocketProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [liveScore, setLiveScore] = useState({
    team1Goals: match.team1Goals || 0,
    team2Goals: match.team2Goals || 0,
  })
  const [matchStatus, setMatchStatus] = useState<
    'not-started' | 'live' | 'ended'
  >('not-started')
  const [livePlayersTeam1, setLivePlayersTeam1] = useState(playersTeam1)
  const [livePlayersTeam2, setLivePlayersTeam2] = useState(playersTeam2)

  useEffect(() => {
    if (
      (match.team1Goals > 0 || match.team2Goals > 0) &&
      matchStatus === 'not-started'
    ) {
      setMatchStatus('live')
    }
  }, [match.team1Goals, match.team2Goals, matchStatus])

  // Inicializar jugadores con estado 'up' por defecto
  useEffect(() => {
    setLivePlayersTeam1(
      playersTeam1.map((player) => ({ ...player, status: 'up' }))
    )
    setLivePlayersTeam2(
      playersTeam2.map((player) => ({ ...player, status: 'up' }))
    )
  }, [playersTeam1, playersTeam2])

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })
  }, [])

  useEffect(() => {
    // Forzar conexión si no está conectado
    if (!socket.connected) {
      socket.connect()
    }

    // Unirse al canal del partido inmediatamente
    socket.emit('join:match', { matchId: match.id })

    // Escuchar eventos del partido
    const handleMatchStart = () => {
      setMatchStatus('live')
    }

    const handleMatchGoal = (data: {
      matchId: string
      teamId: string
      teamName?: string
      playerId?: string
      playerName?: string
    }) => {
      // Actualizar el score en tiempo real
      if (data.teamId === match.team1Id) {
        setLiveScore((prev) => ({ ...prev, team1Goals: prev.team1Goals + 1 }))

        // Actualizar estadísticas del jugador que marcó el gol
        if (data.playerId) {
          setLivePlayersTeam1((prev) =>
            prev.map((player) =>
              player.id === data.playerId
                ? { ...player, goals: (player.goals || 0) + 1 }
                : player
            )
          )
        }
      } else if (data.teamId === match.team2Id) {
        setLiveScore((prev) => ({ ...prev, team2Goals: prev.team2Goals + 1 }))

        // Actualizar estadísticas del jugador que marcó el gol
        if (data.playerId) {
          setLivePlayersTeam2((prev) =>
            prev.map((player) =>
              player.id === data.playerId
                ? { ...player, goals: (player.goals || 0) + 1 }
                : player
            )
          )
        }
      }
    }

    const handleMatchAssist = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
    }) => {
      // Actualizar estadísticas de asistencia del jugador
      if (data.teamId === match.team1Id) {
        setLivePlayersTeam1((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, assists: (player.assists || 0) + 1 }
              : player
          )
        )
      } else if (data.teamId === match.team2Id) {
        setLivePlayersTeam2((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, assists: (player.assists || 0) + 1 }
              : player
          )
        )
      }
    }

    const handleMatchPass = () => {
      // Evento de pase recibido
    }

    const handleMatchGoalSaved = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
    }) => {
      // Actualizar estadísticas de parada del portero
      if (data.teamId === match.team1Id) {
        setLivePlayersTeam1((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, saves: (player.saves || 0) + 1 }
              : player
          )
        )
      } else if (data.teamId === match.team2Id) {
        setLivePlayersTeam2((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, saves: (player.saves || 0) + 1 }
              : player
          )
        )
      }
    }

    const handleMatchGoalAllowed = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
    }) => {
      // Solo actualizar estadísticas de gol permitido del portero, NO el marcador
      // El marcador ya se actualizó con el evento de gol anterior
      if (data.teamId === match.team1Id) {
        // Actualizar estadísticas de gol permitido del portero del equipo 1
        setLivePlayersTeam1((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, goalsAllowed: (player.goalsAllowed || 0) + 1 }
              : player
          )
        )
      } else if (data.teamId === match.team2Id) {
        // Actualizar estadísticas de gol permitido del portero del equipo 2
        setLivePlayersTeam2((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, goalsAllowed: (player.goalsAllowed || 0) + 1 }
              : player
          )
        )
      }
    }

    const handleMatchPlayerToggle = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      eventType: string
    }) => {
      // Evento de toggle de jugador recibido
      if (data.teamId === match.team1Id) {
        setLivePlayersTeam1((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, status: data.eventType }
              : player
          )
        )
      } else if (data.teamId === match.team2Id) {
        setLivePlayersTeam2((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, status: data.eventType }
              : player
          )
        )
      }
    }

    const handleMatchEnd = () => {
      setMatchStatus('ended')
    }

    const handleConnect = () => {
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleConnectError = () => {
      setIsConnected(false)
    }

    // Agregar listeners
    socket.on('match:start', handleMatchStart)
    socket.on('match:goal', handleMatchGoal)
    socket.on('match:assist', handleMatchAssist)
    socket.on('match:pass', handleMatchPass)
    socket.on('match:goal_saved', handleMatchGoalSaved)
    socket.on('match:goal_allowed', handleMatchGoalAllowed)
    socket.on('match:player_toggle', handleMatchPlayerToggle)
    socket.on('match:end', handleMatchEnd)
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)

    return () => {
      // Salir del canal del partido
      socket.emit('leave:match', { matchId: match.id })
      socket.off('match:start', handleMatchStart)
      socket.off('match:goal', handleMatchGoal)
      socket.off('match:assist', handleMatchAssist)
      socket.off('match:pass', handleMatchPass)
      socket.off('match:goal_saved', handleMatchGoalSaved)
      socket.off('match:goal_allowed', handleMatchGoalAllowed)
      socket.off('match:player_toggle', handleMatchPlayerToggle)
      socket.off('match:end', handleMatchEnd)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
    }
  }, [match.id, match.team1Id, match.team2Id])

  return {
    isConnected,
    liveScore,
    matchStatus,
    livePlayersTeam1,
    livePlayersTeam2,
  }
}
