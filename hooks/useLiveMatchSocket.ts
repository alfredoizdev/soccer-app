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
  status?: string | null
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

  // Función para obtener el score desde localStorage o usar el inicial
  const getInitialScore = () => {
    // Si match es null o undefined, retornar valores por defecto
    if (!match) {
      return {
        team1Goals: 0,
        team2Goals: 0,
      }
    }

    if (typeof window === 'undefined') {
      return {
        team1Goals: match.team1Goals || 0,
        team2Goals: match.team2Goals || 0,
      }
    }

    const savedScore = localStorage.getItem(`match-score-${match.id}`)
    if (savedScore) {
      return JSON.parse(savedScore)
    }

    return {
      team1Goals: match.team1Goals || 0,
      team2Goals: match.team2Goals || 0,
    }
  }

  const [liveScore, setLiveScore] = useState(getInitialScore)
  const [matchStatus, setMatchStatus] = useState<
    'not-started' | 'live' | 'ended'
  >('not-started')
  const [livePlayersTeam1, setLivePlayersTeam1] = useState(playersTeam1)
  const [livePlayersTeam2, setLivePlayersTeam2] = useState(playersTeam2)
  const [currentMinute, setCurrentMinute] = useState(0)

  // Función para actualizar el score y guardarlo en localStorage
  const updateScore = (
    updater: (prev: { team1Goals: number; team2Goals: number }) => {
      team1Goals: number
      team2Goals: number
    }
  ) => {
    setLiveScore((prev: { team1Goals: number; team2Goals: number }) => {
      const newScore = updater(prev)
      if (typeof window !== 'undefined' && match) {
        localStorage.setItem(
          `match-score-${match.id}`,
          JSON.stringify(newScore)
        )
      }
      return newScore
    })
  }

  useEffect(() => {
    // Si match es null, no hacer nada
    if (!match) return

    // Si el partido ya está en estado 'live' (por ejemplo, si hay un campo status en match)
    // o si hay goles, marcar como live
    if (
      match.status === 'live' ||
      matchStatus === 'live' ||
      match.team1Goals > 0 ||
      match.team2Goals > 0
    ) {
      setMatchStatus('live')
    }
  }, [match?.status, match?.team1Goals, match?.team2Goals, matchStatus])

  // Inicializar jugadores con estado 'up' por defecto
  useEffect(() => {
    setLivePlayersTeam1(
      playersTeam1.map((player) => ({
        ...player,
        status: 'up',
        goals: player.goals || undefined,
        assists: player.assists || undefined,
        saves: player.saves || undefined,
        goalsAllowed: player.goalsAllowed || undefined,
      }))
    )
    setLivePlayersTeam2(
      playersTeam2.map((player) => ({
        ...player,
        status: 'up',
        goals: player.goals || undefined,
        assists: player.assists || undefined,
        saves: player.saves || undefined,
        goalsAllowed: player.goalsAllowed || undefined,
      }))
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
    // Si match es null, no hacer nada
    if (!match) return

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
      // Verificar que match existe y que el evento es para este partido
      if (!match || data.matchId !== match.id) {
        return
      }

      // Actualizar el score en tiempo real
      if (data.teamId === match.team1Id) {
        updateScore((prev) => ({ ...prev, team1Goals: prev.team1Goals + 1 }))

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
        updateScore((prev) => ({ ...prev, team2Goals: prev.team2Goals + 1 }))

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
      // Verificar que match existe y que el evento es para este partido
      if (!match || data.matchId !== match.id) {
        return
      }

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
      // Verificar que match existe y que el evento es para este partido
      if (!match || data.matchId !== match.id) {
        return
      }

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
      console.log('useLiveMatchSocket: Received goal_allowed event:', data)
      // Verificar que match existe y que el evento es para este partido
      if (!match || data.matchId !== match.id) {
        console.log('useLiveMatchSocket: Event not for this match')
        return
      }

      // Solo actualizar estadísticas de gol permitido del portero
      if (data.teamId === match.team1Id) {
        setLivePlayersTeam1((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, goalsAllowed: (player.goalsAllowed || 0) + 1 }
              : player
          )
        )
        // Workaround: Si el marcador NO subió por 'match:goal', súbelo aquí
        updateScore((prev) => {
          // Si el marcador ya subió, no hacer nada
          if (prev.team2Goals > (match?.team2Goals || 0)) return prev
          return { ...prev, team2Goals: prev.team2Goals + 1 }
        })
      } else if (data.teamId === match.team2Id) {
        setLivePlayersTeam2((prev) =>
          prev.map((player) =>
            player.id === data.playerId
              ? { ...player, goalsAllowed: (player.goalsAllowed || 0) + 1 }
              : player
          )
        )
        updateScore((prev) => {
          if (prev.team1Goals > (match?.team1Goals || 0)) return prev
          return { ...prev, team1Goals: prev.team1Goals + 1 }
        })
      }
    }

    const handleMatchPlayerToggle = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      eventType: string
    }) => {
      // Verificar que match existe y que el evento es para este partido
      if (!match || data.matchId !== match.id) {
        return
      }

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
      // Salir del canal del partido solo si match existe
      if (match) {
        socket.emit('leave:match', { matchId: match.id })
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id, match?.team1Id, match?.team2Id])

  // Forzar estado 'live' si recibimos cualquier evento de partido relevante
  useEffect(() => {
    if (matchStatus === 'ended') return
    // Si el socket está conectado y recibimos cualquier evento, forzar 'live'
    const forceLive = () => {
      setMatchStatus((prev) => (prev !== 'ended' ? 'live' : prev))
    }
    socket.on('match:start', forceLive)
    socket.on('match:goal', forceLive)
    socket.on('match:assist', forceLive)
    socket.on('match:goal_saved', forceLive)
    socket.on('match:goal_allowed', forceLive)
    socket.on('match:player_toggle', forceLive)
    // Limpieza
    return () => {
      socket.off('match:start', forceLive)
      socket.off('match:goal', forceLive)
      socket.off('match:assist', forceLive)
      socket.off('match:goal_saved', forceLive)
      socket.off('match:goal_allowed', forceLive)
      socket.off('match:player_toggle', forceLive)
    }
  }, [matchStatus])

  // Forzar 'live' si el socket está conectado, el partido no está terminado y el marcador está 0-0
  useEffect(() => {
    if (
      isConnected &&
      matchStatus !== 'ended' &&
      liveScore.team1Goals === 0 &&
      liveScore.team2Goals === 0
    ) {
      // Pequeño delay para dar tiempo a la conexión y evitar parpadeos
      const timeout = setTimeout(() => {
        setMatchStatus((prev) => (prev !== 'ended' ? 'live' : prev))
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isConnected, matchStatus, liveScore.team1Goals, liveScore.team2Goals])

  // Incrementar el minuto cada 10 segundos cuando el partido esté en vivo (para testing)
  useEffect(() => {
    if (matchStatus !== 'live') return

    const interval = setInterval(() => {
      setCurrentMinute((prev) => prev + 1)
    }, 10000) // 10 segundos para testing (cambiar a 60000 para producción)

    return () => clearInterval(interval)
  }, [matchStatus])

  return {
    isConnected,
    liveScore,
    matchStatus,
    livePlayersTeam1,
    livePlayersTeam2,
    currentMinute,
  }
}
