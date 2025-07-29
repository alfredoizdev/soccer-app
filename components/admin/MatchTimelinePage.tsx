'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFutbol } from '@fortawesome/free-regular-svg-icons'
import {
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
  faFlag,
  faInfo,
} from '@fortawesome/free-solid-svg-icons'
import { RefreshCw, ThumbsUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Image from 'next/image'
import Link from 'next/link'
import MatchVideoSection from '@/components/members/MatchVideoSection'

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

interface MatchTimelinePageProps {
  events: MatchEvent[]
  team1Name: string
  team2Name: string
  team1Avatar?: string
  team2Avatar?: string
  team1Id?: string
  team2Id?: string
  matchId: string
  team1Goals: number
  team2Goals: number
  duration?: number
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

export default function MatchTimelinePage({
  events,
  team1Name,
  team2Name,
  team1Avatar,
  team2Avatar,
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
    <div className='w-full mx-auto p-1 sm:p-4 fade-in duration-300 mt-[30px] sm:mt-[0px]'>
      {/* Header con botón de regreso */}
      <div className='mb-4 sm:mb-6 flex justify-between items-center w-full mx-auto'>
        <Link
          href={
            typeof window !== 'undefined' &&
            window.location.pathname.includes('/admin/')
              ? `/admin/matches/history/${matchId}`
              : `/members/matches/history`
          }
          className='inline-flex bg-gray-800 rounded-md p-2 items-center text-white mb-2 sm:mb-4 text-sm'
        >
          <FontAwesomeIcon icon={faArrowLeft} className='w-4 h-4 mr-2' />
          Back
        </Link>
        <h2 className='text-2xl sm:text-3xl font-bold mb-2'>Match Timeline</h2>
        <p className='text-sm sm:text-base text-gray-600'>Timeline of Events</p>
      </div>

      {/* Score Section con Card blanca */}
      <div className='p-2 sm:p-4 mb-5'>
        <Card className='border-2 border-gray-200 shadow-sm rounded-none'>
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

      {/* Video Section */}
      <MatchVideoSection
        matchId={matchId}
        team1Name={team1Name}
        team2Name={team2Name}
      />

      {/* Timeline Section - Nuevo diseño */}
      <div className='bg-white p-6 sm:p-5 mb-5'>
        <div className='p-1 sm:p-4'>
          {sortedEvents.length > 0 ? (
            <div className='relative max-h-[500px] overflow-y-auto'>
              {/* Línea vertical del timeline */}
              <div className='absolute left-12 top-0 bottom-0 w-0.5 bg-gray-300'></div>

              {/* Events */}
              <div className='space-y-6 pr-4 pt-8'>
                {sortedEvents.map((event) => {
                  return (
                    <div key={event.id} className='relative'>
                      {/* Círculo del timeline con icono */}
                      <div className='absolute left-12 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center z-10'>
                        <div className='w-10 h-10 flex items-center justify-center'>
                          {getEventIcon(event.eventType)}
                        </div>
                      </div>

                      {/* Marcador de tiempo */}
                      <div className='absolute left-2 top-0 transform -translate-y-1/2 text-md font-bold text-gray-500'>
                        {event.minute}&apos;
                      </div>

                      {/* Tarjeta del evento */}
                      <div
                        className={`ml-20 border-l-2 border-gray-300 ${getEventBorderColor(
                          event.eventType
                        )}`}
                      >
                        <div className='bg-white rounded-none shadow-lg border border-gray-100 overflow-hidden'>
                          {/* Barra de color lateral */}
                          {/* <div
                            className={`w-1 h-full ${getEventColor(
                              event.eventType
                            )} absolute left-0 top-0`}
                          ></div> */}

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
                                <h3 className='font-bold text-gray-800 text-lg mb-1'>
                                  {getEventLabel(event.eventType)}
                                </h3>

                                {/* Descripción del evento */}
                                <p className='text-sm text-gray-600 mb-2'>
                                  {event.description ||
                                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit Ut enim ad minim veniam, quis nostrud exerci.'}
                                </p>

                                {/* Información del jugador si existe */}
                                {event.playerName && (
                                  <div className='flex items-center space-x-2 mb-2'>
                                    <Avatar className='w-6 h-6'>
                                      <AvatarImage
                                        src={
                                          event.playerAvatar ||
                                          '/no-profile.webp'
                                        }
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
