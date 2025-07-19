'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFutbol } from '@fortawesome/free-regular-svg-icons'
import {
  faSocks,
  faArrowLeft,
  faCheck,
  faExclamationTriangle,
  faExchange,
  faUserInjured,
  faCalendarTimes,
  faShield,
  faUserPlus,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'
import { RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Image from 'next/image'
import Link from 'next/link'

export type MatchEvent = {
  id: string
  minute: number
  timestamp?: number // Agregar timestamp para ordenamiento correcto
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
  playerId?: string // Agregar playerId para navegación
  playerName?: string
  playerAvatar?: string
  teamName: string
  teamAvatar?: string
  description?: string
  teamId?: string // Agregar teamId para posicionamiento
}

interface MatchTimelinePageProps {
  events: MatchEvent[]
  team1Name: string
  team2Name: string
  team1Avatar?: string
  team2Avatar?: string
  team1Id?: string // Agregar team1Id para posicionamiento
  team2Id?: string // Agregar team2Id para posicionamiento
  matchId: string
  team1Goals: number
  team2Goals: number
  duration?: number
}

const getEventIcon = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return (
        <FontAwesomeIcon icon={faFutbol} className='w-4 h-4 text-green-500' />
      )
    case 'assist':
      return (
        <FontAwesomeIcon icon={faSocks} className='w-4 h-4 text-blue-500' />
      )
    case 'yellow_card':
      return (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className='w-4 h-4 text-yellow-500'
        />
      )
    case 'red_card':
      return (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className='w-4 h-4 text-red-500'
        />
      )
    case 'substitution':
      return (
        <FontAwesomeIcon
          icon={faExchange}
          className='w-4 h-4 text-purple-500'
        />
      )
    case 'injury':
      return (
        <FontAwesomeIcon
          icon={faUserInjured}
          className='w-4 h-4 text-orange-500'
        />
      )
    case 'pass':
      return (
        <FontAwesomeIcon icon={faCheck} className='w-4 h-4 text-gray-500' />
      )
    case 'goal_saved':
      return (
        <FontAwesomeIcon icon={faShield} className='w-4 h-4 text-green-600' />
      )
    case 'goal_allowed':
      return (
        <FontAwesomeIcon icon={faShield} className='w-4 h-4 text-red-600' />
      )
    case 'player_in':
      return (
        <FontAwesomeIcon icon={faUserPlus} className='w-4 h-4 text-green-600' />
      )
    case 'player_out':
      return <RefreshCw className='w-4 h-4 text-red-600' />
    case 'half_time':
      return (
        <FontAwesomeIcon icon={faPause} className='w-4 h-4 text-orange-500' />
      )
    case 'resume_match':
      return (
        <FontAwesomeIcon icon={faPlay} className='w-4 h-4 text-green-500' />
      )
  }
}

const getEventLabel = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return 'Goal'
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
  }
}

export default function MatchTimelinePage({
  events,
  team1Name,
  team2Name,
  team1Avatar,
  team2Avatar,
  team1Id,
  team2Id,
  matchId,
  team1Goals,
  team2Goals,
  duration,
}: MatchTimelinePageProps) {
  // Ordenar eventos por minuto y timestamp para orden lógico
  const sortedEvents = [...events].sort((a, b) => {
    // Primero por minuto (ascendente)
    if (a.minute !== b.minute) {
      return a.minute - b.minute
    }
    // Si mismo minuto, por timestamp (ascendente) para mantener orden cronológico
    const timestampA = a.timestamp || 0
    const timestampB = b.timestamp || 0
    return timestampA - timestampB
  })

  return (
    <div className='w-full mx-auto p-2 sm:p-4 fade-in duration-300'>
      {/* Header con botón de regreso */}
      <div className='mb-4 sm:mb-6 flex justify-between items-center w-full mx-auto'>
        <Link
          href={`/admin/matches/history/${matchId}`}
          className='inline-flex bg-gray-800 rounded-md p-2 items-center text-white mb-2 sm:mb-4 text-sm'
        >
          <FontAwesomeIcon icon={faArrowLeft} className='w-4 h-4 mr-2' />
          Back
        </Link>
        <h2 className='text-2xl sm:text-3xl font-bold mb-2'>Match Timeline</h2>
        <p className='text-sm sm:text-base text-gray-600'>Timeline of Events</p>
      </div>

      {/* Score Section con Card blanca */}
      <div className='p-4'>
        <Card className='border-2 border-gray-200 shadow-sm'>
          <CardHeader className='text-center pb-3'>
            <CardTitle className='text-lg text-gray-700'>Match Score</CardTitle>
          </CardHeader>
          <CardContent className='pb-6'>
            <div className='flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 lg:space-x-12'>
              {/* Equipo 1 */}
              <div className='text-center flex-1'>
                <div className='w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-3 mx-auto'>
                  <Image
                    src={team1Avatar || '/no-club.jpg'}
                    alt={team1Name}
                    width={96}
                    height={96}
                    className='w-full h-full object-cover rounded-full border-4 border-white shadow-sm'
                  />
                </div>
                <h3 className='font-bold text-sm sm:text-base md:text-lg text-gray-800'>
                  {team1Name}
                </h3>
              </div>

              {/* Marcador central */}
              <div className='flex flex-col items-center'>
                <div className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2'>
                  {team1Goals} : {team2Goals}
                </div>
                <div className='text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 sm:px-4 py-1 sm:py-2 rounded-full'>
                  Final Score
                </div>
                {duration && (
                  <div className='text-xs sm:text-sm text-gray-500 px-3 sm:px-4 py-1 sm:py-2 rounded-full mt-2'>
                    Duration: {Math.floor(duration / 60)}:
                    {(duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              {/* Equipo 2 */}
              <div className='text-center flex-1'>
                <div className='w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-3 mx-auto'>
                  <Image
                    src={team2Avatar || '/no-club.jpg'}
                    alt={team2Name}
                    width={96}
                    height={96}
                    className='w-full h-full object-cover rounded-full border-4 border-white shadow-sm'
                  />
                </div>
                <h3 className='font-bold text-sm sm:text-base md:text-lg text-gray-800'>
                  {team2Name}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Section */}
      <div className='bg-white p-5'>
        {/* Timeline */}
        <div className='p-4'>
          {sortedEvents.length > 0 ? (
            <div className='relative'>
              {/* Línea vertical central */}
              <div className='absolute left-1/2 top-0 bottom-0 w-1 bg-green-500 transform -translate-x-1/2'></div>

              {/* Events */}
              <div className='space-y-6'>
                {sortedEvents.map((event) => {
                  // Eventos especiales que van en el medio de la línea
                  const isSpecialEvent =
                    event.eventType === 'half_time' ||
                    event.eventType === 'resume_match'

                  if (isSpecialEvent) {
                    return (
                      <div key={event.id} className='relative'>
                        {/* Minute marker on timeline */}
                        <div className='absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10'>
                          {event.minute}&apos;
                        </div>

                        {/* Special event content - centered */}
                        <div className='flex justify-center'>
                          <div
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
                              event.eventType === 'half_time'
                                ? 'bg-orange-100 border-2 border-orange-300'
                                : 'bg-green-100 border-2 border-green-300'
                            }`}
                          >
                            {getEventIcon(event.eventType)}
                            <div className='flex items-center space-x-2'>
                              <span
                                className={`text-sm font-semibold ${
                                  event.eventType === 'half_time'
                                    ? 'text-orange-700'
                                    : 'text-green-700'
                                }`}
                              >
                                {event.eventType === 'half_time'
                                  ? 'Half Time'
                                  : 'Resume Match'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Usar teamId para posicionamiento más preciso
                  const isTeam1 = event.teamId === team1Id
                  const isTeam2 = event.teamId === team2Id
                  // Eventos del team1 van a la izquierda, team2 a la derecha
                  // team1 es Houstonias FC (izquierda), team2 es Ingoude FC (derecha)
                  const isLeft = isTeam2
                  // Si no hay teamId o no coincide con ninguno, usar posición por defecto
                  const defaultToLeft = !isTeam1 && !isTeam2

                  return (
                    <div key={event.id} className='relative'>
                      {/* Minute marker on timeline */}
                      <div className='absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10'>
                        {event.minute}&apos;
                      </div>

                      {/* Event content */}
                      <div
                        className={`flex items-center ${
                          isLeft || defaultToLeft
                            ? 'justify-end pr-2'
                            : 'justify-start pl-2'
                        }`}
                      >
                        <div
                          className={`flex items-center space-x-4 max-w-xs ${
                            isLeft || defaultToLeft
                              ? 'flex-row-reverse'
                              : 'flex-row'
                          }`}
                        >
                          {/* Player Avatar with Event Icon */}
                          {event.playerName && event.playerId && (
                            <div className='relative flex-shrink-0 mr-3'>
                              <Link
                                href={`/admin/players/${event.playerId}`}
                                className='cursor-pointer hover:opacity-80 transition-opacity'
                              >
                                <Avatar className='w-10 h-10'>
                                  <AvatarImage
                                    src={
                                      event.playerAvatar || '/no-profile.webp'
                                    }
                                    alt={event.playerName}
                                    onError={(e) => {
                                      e.currentTarget.src = '/no-profile.webp'
                                    }}
                                  />
                                  <AvatarFallback className='text-xs'>
                                    {event.playerName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className='absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 flex items-center justify-center'>
                                <div className='w-4 h-4 flex items-center justify-center'>
                                  {getEventIcon(event.eventType)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Event Icon (if no player) */}
                          {!event.playerName && (
                            <div className='flex-shrink-0 mr-3'>
                              <div className='w-8 h-8 flex items-center justify-center'>
                                {getEventIcon(event.eventType)}
                              </div>
                            </div>
                          )}

                          <div
                            className={`text-sm ${
                              isLeft ? 'text-right' : 'text-left'
                            }`}
                          >
                            <div className='font-semibold text-gray-800 mb-1'>
                              {event.playerName || 'Unknown Player'}
                            </div>
                            <div className='text-xs text-gray-500 mb-1'>
                              {getEventLabel(event.eventType)}
                            </div>
                            {event.description && (
                              <div className='text-xs text-gray-400'>
                                {event.description}
                              </div>
                            )}
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
                No Events Recorded
              </h3>
              <p className='text-sm text-gray-400 max-w-md mx-auto'>
                No events have been recorded for this match yet. Events like
                goals, assists, cards, and substitutions will appear here when
                they occur.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
