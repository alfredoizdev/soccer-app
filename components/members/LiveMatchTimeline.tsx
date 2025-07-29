'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFutbol } from '@fortawesome/free-regular-svg-icons'
import {
  faCheck,
  faExclamationTriangle,
  faExchange,
  faUserInjured,
  faCalendarTimes,
  faShield,
  faUserPlus,
  faPause,
  faPlay,
  faFlag,
  faInfo,
} from '@fortawesome/free-solid-svg-icons'
import { RefreshCw, ThumbsUp } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { socket } from '@/app/socket'

export type MatchEvent = {
  id: string
  minute: number
  timestamp?: number
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
    | 'corner'
  playerId?: string
  playerName?: string
  playerAvatar?: string
  teamName: string
  teamAvatar?: string
  description?: string
  teamId?: string
  comment?: string
  commentAuthor?: string
  highFives?: number
}

interface LiveMatchTimelineProps {
  match: {
    id: string
    team1: string
    team2: string
    team1Id: string
    team2Id: string
    team1Goals: number
    team2Goals: number
    team1Avatar: string
    team2Avatar: string
  }
  matchStatus: 'not-started' | 'live' | 'ended'
}

const getEventIcon = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return (
        <FontAwesomeIcon icon={faFutbol} className='w-10 h-10 text-white' />
      )
    case 'assist':
      return <FontAwesomeIcon icon={faInfo} className='w-10 h-10 text-white' />
    case 'yellow_card':
      return (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className='w-10 h-10 text-white'
        />
      )
    case 'red_card':
      return (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className='w-10 h-10 text-white'
        />
      )
    case 'substitution':
      return (
        <FontAwesomeIcon icon={faExchange} className='w-10 h-10 text-white' />
      )
    case 'injury':
      return (
        <FontAwesomeIcon
          icon={faUserInjured}
          className='w-10 h-10 text-white'
        />
      )
    case 'pass':
      return <FontAwesomeIcon icon={faCheck} className='w-10 h-10 text-white' />
    case 'goal_saved':
      return (
        <FontAwesomeIcon icon={faShield} className='w-10 h-10 text-white' />
      )
    case 'goal_allowed':
      return (
        <FontAwesomeIcon icon={faShield} className='w-10 h-10 text-white' />
      )
    case 'player_in':
      return (
        <FontAwesomeIcon icon={faUserPlus} className='w-10 h-10 text-white' />
      )
    case 'player_out':
      return <RefreshCw className='w-5 h-5 text-white' />
    case 'half_time':
      return <FontAwesomeIcon icon={faPause} className='w-10 h-10 text-white' />
    case 'resume_match':
      return <FontAwesomeIcon icon={faPlay} className='w-10 h-10 text-white' />
    case 'corner':
      return <FontAwesomeIcon icon={faFlag} className='w-10 h-10 text-white' />
  }
}

const getEventLabel = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return 'GOAL!!!!!'
    case 'assist':
      return 'Assist'
    case 'yellow_card':
      return 'Yellow Card'
    case 'red_card':
      return 'Red Card'
    case 'substitution':
      return 'Substitution'
    case 'injury':
      return 'Injury'
    case 'pass':
      return 'Pass'
    case 'goal_saved':
      return 'Goal Saved'
    case 'goal_allowed':
      return 'Goal Allowed'
    case 'player_in':
      return 'Player In'
    case 'player_out':
      return 'Player Out'
    case 'half_time':
      return 'Half Time'
    case 'resume_match':
      return 'Match Resumed'
    case 'corner':
      return 'Corner'
  }
}

const getEventColor = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return 'bg-red-500'
    case 'assist':
      return 'bg-yellow-500'
    case 'yellow_card':
      return 'bg-yellow-500'
    case 'red_card':
      return 'bg-red-500'
    case 'substitution':
      return 'bg-purple-500'
    case 'injury':
      return 'bg-orange-500'
    case 'pass':
      return 'bg-gray-500'
    case 'goal_saved':
      return 'bg-green-600'
    case 'goal_allowed':
      return 'bg-red-600'
    case 'player_in':
      return 'bg-green-600'
    case 'player_out':
      return 'bg-red-600'
    case 'half_time':
      return 'bg-orange-500'
    case 'resume_match':
      return 'bg-green-500'
    case 'corner':
      return 'bg-red-500'
  }
}

const getEventBorderColor = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return 'border-l-2 border-red-500'
    case 'assist':
      return 'border-l-2 border-yellow-500'
    case 'yellow_card':
      return 'border-l-2 border-yellow-500'
    case 'red_card':
      return 'border-l-2 border-red-500'
    case 'substitution':
      return 'border-l-2 border-purple-500'
    case 'injury':
      return 'border-l-2 border-orange-500'
    case 'pass':
      return 'border-l-2 border-gray-500'
    case 'goal_saved':
      return 'border-l-2 border-green-600'
    case 'goal_allowed':
      return 'border-l-2 border-red-600'
    case 'player_in':
      return 'border-l-2 border-green-600'
    case 'player_out':
      return 'border-l-2 border-red-600'
    case 'half_time':
      return 'border-l-2 border-orange-500'
    case 'resume_match':
      return 'border-l-2 border-green-500'
    case 'corner':
      return 'border-l-2 border-red-500'
  }
}

export default function LiveMatchTimeline({
  match,
  matchStatus,
}: LiveMatchTimelineProps) {
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [currentMinute, setCurrentMinute] = useState(0)
  const [playersData, setPlayersData] = useState<
    Record<string, { name: string; avatar?: string }>
  >({})
  const [matchStartTime, setMatchStartTime] = useState<number | null>(null)

  // Función para formatear el tiempo correctamente
  const formatEventTime = (minute: number) => {
    return `${minute}'`
  }

  // Función para obtener el avatar del jugador
  const getPlayerAvatar = (playerId?: string, playerAvatar?: string) => {
    if (playerAvatar) return playerAvatar

    // Si no hay avatar específico, usar el avatar por defecto
    return '/no-profile.webp'
  }

  // Función para obtener datos de jugador
  const getPlayerData = (playerId?: string) => {
    if (!playerId) return null
    return playersData[playerId] || null
  }

  // Cargar datos de jugadores al montar el componente
  useEffect(() => {
    const loadPlayersData = async () => {
      try {
        const response = await fetch(`/api/players/match/${match.id}`)
        if (response.ok) {
          const data = await response.json()
          const playersMap: Record<string, { name: string; avatar?: string }> =
            {}
          data.players.forEach(
            (player: {
              id: string
              name: string
              lastName: string
              avatar?: string
            }) => {
              playersMap[player.id] = {
                name: `${player.name} ${player.lastName}`,
                avatar: player.avatar,
              }
            }
          )
          setPlayersData(playersMap)
        }
      } catch (error) {
        console.error('Error loading players data:', error)
      }
    }

    loadPlayersData()
  }, [match.id])

  useEffect(() => {
    // Unirse al canal del partido
    socket.emit('join:match', { matchId: match.id })

    const handleMatchGoal = (data: {
      matchId: string
      teamId: string
      teamName?: string
      playerId?: string
      playerName?: string
      minute?: number
    }) => {
      if (data.matchId !== match.id) return

      // Establecer el tiempo de inicio del partido solo si es el primer evento
      if (matchStartTime === null) {
        setMatchStartTime(Date.now())
      }

      const playerData = getPlayerData(data.playerId)
      const newEvent: MatchEvent = {
        id: `goal-${Date.now()}`,
        minute: data.minute || currentMinute,
        timestamp: Date.now(),
        eventType: 'goal',
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatar: playerData?.avatar,
        teamName:
          data.teamName ||
          (data.teamId === match.team1Id ? match.team1 : match.team2),
        teamAvatar:
          data.teamId === match.team1Id ? match.team1Avatar : match.team2Avatar,
        teamId: data.teamId,
        description: `${data.playerName || 'Player'} scored a goal!`,
      }

      setEvents((prev) => [...prev, newEvent])
    }

    const handleMatchAssist = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      minute?: number
    }) => {
      if (data.matchId !== match.id) return

      // Establecer el tiempo de inicio del partido solo si es el primer evento
      if (matchStartTime === null) {
        setMatchStartTime(Date.now())
      }

      const playerData = getPlayerData(data.playerId)
      const newEvent: MatchEvent = {
        id: `assist-${Date.now()}`,
        minute: data.minute || currentMinute,
        timestamp: Date.now(),
        eventType: 'assist',
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatar: playerData?.avatar,
        teamName: data.teamId === match.team1Id ? match.team1 : match.team2,
        teamAvatar:
          data.teamId === match.team1Id ? match.team1Avatar : match.team2Avatar,
        teamId: data.teamId,
        description: `${data.playerName} provided an assist!`,
      }

      setEvents((prev) => [...prev, newEvent])
    }

    const handleMatchGoalSaved = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      minute?: number
    }) => {
      if (data.matchId !== match.id) return

      // Establecer el tiempo de inicio del partido solo si es el primer evento
      if (matchStartTime === null) {
        setMatchStartTime(Date.now())
      }

      const playerData = getPlayerData(data.playerId)
      const newEvent: MatchEvent = {
        id: `save-${Date.now()}`,
        minute: data.minute || currentMinute,
        timestamp: Date.now(),
        eventType: 'goal_saved',
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatar: playerData?.avatar,
        teamName: data.teamId === match.team1Id ? match.team1 : match.team2,
        teamAvatar:
          data.teamId === match.team1Id ? match.team1Avatar : match.team2Avatar,
        teamId: data.teamId,
        description: `${data.playerName} saved a goal!`,
      }

      setEvents((prev) => [...prev, newEvent])
    }

    const handleMatchGoalAllowed = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      minute?: number
    }) => {
      if (data.matchId !== match.id) return

      // Establecer el tiempo de inicio del partido solo si es el primer evento
      if (matchStartTime === null) {
        setMatchStartTime(Date.now())
      }

      const playerData = getPlayerData(data.playerId)
      const newEvent: MatchEvent = {
        id: `allowed-${Date.now()}`,
        minute: data.minute || currentMinute,
        timestamp: Date.now(),
        eventType: 'goal_allowed',
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatar: playerData?.avatar,
        teamName: data.teamId === match.team1Id ? match.team1 : match.team2,
        teamAvatar:
          data.teamId === match.team1Id ? match.team1Avatar : match.team2Avatar,
        teamId: data.teamId,
        description: `${data.playerName} allowed a goal.`,
      }

      setEvents((prev) => [...prev, newEvent])
    }

    const handleMatchPlayerToggle = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      eventType: string
      minute?: number
    }) => {
      if (data.matchId !== match.id) return

      // Establecer el tiempo de inicio del partido solo si es el primer evento
      if (matchStartTime === null) {
        setMatchStartTime(Date.now())
      }

      const eventType = data.eventType === 'in' ? 'player_in' : 'player_out'
      const description =
        data.eventType === 'in'
          ? `${data.playerName} entered the field`
          : `${data.playerName} left the field`

      const playerData = getPlayerData(data.playerId)
      const newEvent: MatchEvent = {
        id: `toggle-${Date.now()}`,
        minute: data.minute || currentMinute,
        timestamp: Date.now(),
        eventType: eventType as MatchEvent['eventType'],
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatar: playerData?.avatar,
        teamName: data.teamId === match.team1Id ? match.team1 : match.team2,
        teamAvatar:
          data.teamId === match.team1Id ? match.team1Avatar : match.team2Avatar,
        teamId: data.teamId,
        description,
      }

      setEvents((prev) => [...prev, newEvent])
    }

    const handleMatchPass = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      minute?: number
    }) => {
      if (data.matchId !== match.id) return

      // Establecer el tiempo de inicio del partido solo si es el primer evento
      if (matchStartTime === null) {
        setMatchStartTime(Date.now())
      }

      const playerData = getPlayerData(data.playerId)
      const newEvent: MatchEvent = {
        id: `pass-${Date.now()}`,
        minute: data.minute || currentMinute,
        timestamp: Date.now(),
        eventType: 'pass',
        playerId: data.playerId,
        playerName: data.playerName,
        playerAvatar: playerData?.avatar,
        teamName: data.teamId === match.team1Id ? match.team1 : match.team2,
        teamAvatar:
          data.teamId === match.team1Id ? match.team1Avatar : match.team2Avatar,
        teamId: data.teamId,
        description: `${data.playerName} made a pass.`,
      }

      setEvents((prev) => [...prev, newEvent])
    }

    const handleMatchHalfTime = (data: {
      matchId: string
      minute?: number
    }) => {
      console.log('Received match:half_time event:', data)
      console.log('Current match.id:', match.id)

      if (data.matchId !== match.id) {
        console.log('Match ID mismatch, ignoring event')
        return
      }

      console.log('Processing half_time event')

      // Establecer el tiempo de inicio del partido solo si es el primer evento
      if (matchStartTime === null) {
        setMatchStartTime(Date.now())
      }

      const newEvent: MatchEvent = {
        id: `half_time-${Date.now()}`,
        minute: data.minute || currentMinute,
        timestamp: Date.now(),
        eventType: 'half_time',
        teamName: 'Match',
        description: 'Half time break.',
      }

      console.log('Creating half_time event:', newEvent)
      setEvents((prev) => [...prev, newEvent])
    }

    const handleMatchResume = (data: { matchId: string; minute?: number }) => {
      console.log('Received match:resume event:', data)
      console.log('Current match.id:', match.id)

      if (data.matchId !== match.id) {
        console.log('Match ID mismatch, ignoring event')
        return
      }

      console.log('Processing resume event')

      // Establecer el tiempo de inicio del partido solo si es el primer evento
      if (matchStartTime === null) {
        setMatchStartTime(Date.now())
      }

      const newEvent: MatchEvent = {
        id: `resume-${Date.now()}`,
        minute: data.minute || currentMinute,
        timestamp: Date.now(),
        eventType: 'resume_match',
        teamName: 'Match',
        description: 'Match resumed after break.',
      }

      console.log('Creating resume event:', newEvent)
      setEvents((prev) => [...prev, newEvent])
    }

    // Agregar listeners
    socket.on('match:goal', handleMatchGoal)
    socket.on('match:assist', handleMatchAssist)
    socket.on('match:goal_saved', handleMatchGoalSaved)
    socket.on('match:goal_allowed', handleMatchGoalAllowed)
    socket.on('match:player_toggle', handleMatchPlayerToggle)
    socket.on('match:pass', handleMatchPass)
    socket.on('match:half_time', handleMatchHalfTime)
    socket.on('match:resume', handleMatchResume)

    // Simular el paso del tiempo cada minuto
    const timeInterval = setInterval(() => {
      if (matchStatus === 'live') {
        setCurrentMinute((prev) => prev + 1)
      }
    }, 60000) // 1 minuto

    return () => {
      socket.emit('leave:match', { matchId: match.id })
      socket.off('match:goal', handleMatchGoal)
      socket.off('match:assist', handleMatchAssist)
      socket.off('match:goal_saved', handleMatchGoalSaved)
      socket.off('match:goal_allowed', handleMatchGoalAllowed)
      socket.off('match:player_toggle', handleMatchPlayerToggle)
      socket.off('match:pass', handleMatchPass)
      socket.off('match:half_time', handleMatchHalfTime)
      socket.off('match:resume', handleMatchResume)
      clearInterval(timeInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    match.id,
    match.team1Id,
    match.team2Id,
    match.team1,
    match.team2,
    match.team1Avatar,
    match.team2Avatar,
    matchStatus,
    currentMinute,
  ])

  // Ordenar eventos por minuto y timestamp para mostrar más recientes arriba
  const sortedEvents = [...events].sort((a, b) => {
    // Primero por minuto (descendente)
    if (a.minute !== b.minute) {
      return b.minute - a.minute
    }
    // Si mismo minuto, por timestamp (descendente) para mantener orden cronológico inverso
    const timestampA = a.timestamp || 0
    const timestampB = b.timestamp || 0
    return timestampB - timestampA
  })

  return (
    <div className='w-full mx-auto p-1 sm:p-4 fade-in duration-300'>
      {/* Header con botón de regreso */}
      <div className='mb-4 sm:mb-6 flex justify-between items-center w-full mx-auto'>
        <h2 className='text-2xl sm:text-3xl font-bold mb-2'>
          Live Match Timeline
        </h2>
        <p className='text-sm sm:text-base text-gray-600'>
          {matchStatus === 'live' ? 'Live Updates' : 'Match Timeline'}
        </p>
      </div>

      {/* Timeline Section */}
      <div className='bg-white p-6 sm:p-5 mb-5'>
        <div className='p-1 sm:p-4'>
          {sortedEvents.length > 0 ? (
            <div className='relative'>
              {/* Línea vertical del timeline */}
              <div className='absolute left-12 top-0 bottom-0 w-0.5 bg-gray-300'></div>

              {/* Events */}
              <div className='space-y-6'>
                {sortedEvents.map((event, index) => {
                  const isLatestEvent = index === 0
                  return (
                    <div
                      key={event.id}
                      className={`relative animate-slide-in-left ${
                        isLatestEvent ? 'animate-bounce-in' : ''
                      }`}
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        animationFillMode: 'both',
                      }}
                    >
                      {/* Círculo del timeline con icono */}
                      <div className='absolute left-12 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center z-10'>
                        <div className='w-10 h-10 flex items-center justify-center'>
                          {getEventIcon(event.eventType)}
                        </div>
                      </div>

                      {/* Marcador de tiempo */}
                      <div className='absolute left-2 top-0 transform -translate-y-1/2 text-md font-bold text-gray-500'>
                        <span className='mr-4'>
                          {formatEventTime(event.minute)}
                        </span>
                      </div>

                      {/* Tarjeta del evento */}
                      <div
                        className={`ml-20 border-l-2 border-gray-300 ${getEventBorderColor(
                          event.eventType
                        )}`}
                      >
                        <div
                          className={`bg-white rounded-none shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 ${
                            isLatestEvent
                              ? 'border-blue-300 shadow-blue-100'
                              : 'border-gray-100'
                          }`}
                        >
                          <div className='p-4 pl-6'>
                            <div className='flex items-start space-x-3'>
                              {/* Icono del evento */}
                              <div
                                className={`w-8 h-8 ${getEventColor(
                                  event.eventType
                                )} rounded-lg flex items-center justify-center flex-shrink-0`}
                              >
                                {getEventIcon(event.eventType)}
                              </div>

                              {/* Contenido del evento */}
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <h3 className='font-bold text-gray-800 text-lg'>
                                    {getEventLabel(event.eventType)}
                                  </h3>
                                  {isLatestEvent && (
                                    <span
                                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse'
                                      style={{ animationDuration: '1s' }}
                                    >
                                      NEW
                                    </span>
                                  )}
                                </div>

                                {/* Descripción del evento */}
                                <p className='text-sm text-gray-600 mb-2'>
                                  {event.description}
                                </p>

                                {/* Información del jugador si existe */}
                                {event.playerName && (
                                  <div className='flex items-center space-x-2 mb-2'>
                                    <Avatar className='w-6 h-6'>
                                      <AvatarImage
                                        src={getPlayerAvatar(
                                          event.playerId,
                                          event.playerAvatar
                                        )}
                                        alt={event.playerName}
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            '/no-profile.webp'
                                        }}
                                      />
                                      <AvatarFallback className='text-xs'>
                                        {event.playerName
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className='text-sm text-gray-700 font-medium'>
                                      {event.playerName}
                                    </span>
                                  </div>
                                )}

                                {/* Comentario si existe */}
                                {event.comment && (
                                  <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                                    <p className='text-sm text-gray-700 italic mb-1'>
                                      &quot;{event.comment}&quot;
                                    </p>
                                    {event.commentAuthor && (
                                      <p className='text-xs text-gray-500'>
                                        - {event.commentAuthor}
                                      </p>
                                    )}
                                    {event.highFives && event.highFives > 0 && (
                                      <div className='flex items-center space-x-1 mt-2'>
                                        <ThumbsUp className='w-3 h-3 text-blue-500' />
                                        <span className='text-xs text-gray-500'>
                                          {event.highFives} people High-Fived
                                          this comment
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className='text-center py-16 text-gray-500'>
              <div className='mb-4'>
                <FontAwesomeIcon
                  icon={faCalendarTimes}
                  className='w-16 h-16 mx-auto text-gray-300'
                />
              </div>
              <h3 className='text-lg font-medium text-gray-600 mb-2'>
                {matchStatus === 'live'
                  ? 'Waiting for Events'
                  : 'No Events Recorded'}
              </h3>
              <p className='text-sm text-gray-400 max-w-md mx-auto'>
                {matchStatus === 'live'
                  ? 'Events like goals, assists, cards, and substitutions will appear here as they occur during the match.'
                  : 'No events have been recorded for this match yet. Events like goals, assists, cards, and substitutions will appear here when they occur.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
