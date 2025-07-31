'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarTimes } from '@fortawesome/free-solid-svg-icons'
import {
  getEventLabel,
  getEventBorderColor,
  formatEventTime,
  getPlayerAvatar,
  sortEvents,
  type MatchEvent,
} from '@/lib/utils/matchEvents'
import { EventIcon } from '@/components/ui/EventIcon'

interface CompactTimelineProps {
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
  playersTeam1?: Array<{
    id: string
    name: string
    lastName: string
    avatar?: string | null
  }>
  playersTeam2?: Array<{
    id: string
    name: string
    lastName: string
    avatar?: string | null
  }>
  events?: Array<{
    id: string
    minute: number
    timestamp: number
    eventType: string
    playerId?: string
    playerName?: string
    teamName?: string
    description?: string
  }>
}

export default function CompactTimeline({
  playersTeam1 = [],
  playersTeam2 = [],
  events = [],
}: CompactTimelineProps) {
  // Ordenar eventos usando la función del hook
  const sortedEvents = sortEvents(events as MatchEvent[])

  return (
    <div className='w-full p-1 md:p-2'>
      {sortedEvents.length > 0 ? (
        <div className='space-y-1 md:space-y-2'>
          {sortedEvents.slice(0, 10).map((event, index) => (
            <div
              key={event.id}
              className={`flex items-center gap-1 md:gap-2 p-1 md:p-2 bg-gray-50 rounded-lg animate-fade-in ${getEventBorderColor(
                event.eventType as MatchEvent['eventType']
              )}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both',
              }}
            >
              {/* Tiempo */}
              <div className='text-xs font-bold text-gray-500 min-w-[16px] md:min-w-[20px]'>
                {formatEventTime(event.minute)}
              </div>

              {/* Icono del evento */}
              <EventIcon
                eventType={event.eventType as MatchEvent['eventType']}
                className='w-4 h-4 md:w-6 md:h-6'
              />

              {/* Avatar del jugador */}
              {event.playerName && (
                <Avatar className='w-4 h-4 md:w-6 md:h-6 flex-shrink-0'>
                  <AvatarImage
                    src={getPlayerAvatar(
                      event.playerId,
                      event.playerAvatar,
                      playersTeam1,
                      playersTeam2
                    )}
                    alt={event.playerName}
                  />
                  <AvatarFallback className='text-xs'>
                    {event.playerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Información del evento */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-1 md:gap-2'>
                  <span className='text-xs font-medium text-gray-900 truncate'>
                    {event.playerName}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {getEventLabel(event.eventType as MatchEvent['eventType'])}
                  </span>
                </div>
                {event.description && (
                  <p className='text-xs text-gray-600 truncate'>
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex items-center justify-center p-4 text-gray-500'>
          <FontAwesomeIcon icon={faCalendarTimes} className='w-4 h-4 mr-2' />
          <span className='text-sm'>No events yet</span>
        </div>
      )}
    </div>
  )
}
