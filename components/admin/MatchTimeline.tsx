'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Circle, UserX, AlertTriangle, Zap, Clock, Users } from 'lucide-react'
import Image from 'next/image'

export type MatchEvent = {
  id: string
  minute: number
  eventType:
    | 'goal'
    | 'assist'
    | 'yellow_card'
    | 'red_card'
    | 'substitution'
    | 'injury'
  playerName?: string
  teamName: string
  teamAvatar?: string
  description?: string
}

interface MatchTimelineProps {
  events: MatchEvent[]
  currentMinute?: number
  team1Name: string
  team2Name: string
  team1Avatar?: string
  team2Avatar?: string
}

const getEventIcon = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return <Circle className='w-4 h-4 text-green-600' />
    case 'assist':
      return <Zap className='w-4 h-4 text-blue-600' />
    case 'yellow_card':
      return <AlertTriangle className='w-4 h-4 text-yellow-600' />
    case 'red_card':
      return <AlertTriangle className='w-4 h-4 text-red-600' />
    case 'substitution':
      return <Users className='w-4 h-4 text-purple-600' />
    case 'injury':
      return <UserX className='w-4 h-4 text-orange-600' />
    default:
      return <Clock className='w-4 h-4 text-gray-600' />
  }
}

const getEventColor = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return 'bg-green-50 border-green-200'
    case 'assist':
      return 'bg-blue-50 border-blue-200'
    case 'yellow_card':
      return 'bg-yellow-50 border-yellow-200'
    case 'red_card':
      return 'bg-red-50 border-red-200'
    case 'substitution':
      return 'bg-purple-50 border-purple-200'
    case 'injury':
      return 'bg-orange-50 border-orange-200'
    default:
      return 'bg-gray-50 border-gray-200'
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
    default:
      return 'Event'
  }
}

export default function MatchTimeline({
  events,
  currentMinute = 0,
  team1Name,
  team2Name,
  team1Avatar,
  team2Avatar,
}: MatchTimelineProps) {
  // Ordenar eventos por minuto
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute)

  // Calcular el progreso del partido
  const progress = Math.min((currentMinute / 90) * 100, 100)

  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <CardTitle className='text-lg sm:text-xl'>Match Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Teams Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 sm:w-10 sm:h-10'>
              <Image
                src={team1Avatar || '/no-club.jpg'}
                alt={team1Name}
                width={40}
                height={40}
                className='w-full h-full object-cover rounded-full'
              />
            </div>
            <span className='text-sm sm:text-base font-medium'>
              {team1Name}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 sm:w-10 sm:h-10'>
              <Image
                src={team2Avatar || '/no-club.jpg'}
                alt={team2Name}
                width={40}
                height={40}
                className='w-full h-full object-cover rounded-full'
              />
            </div>
            <span className='text-sm sm:text-base font-medium'>
              {team2Name}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className='relative'>
          {/* Timeline Line */}
          <div className='absolute left-1/2 transform -translate-x-1/2 w-full h-1 bg-gray-200 rounded-full'>
            <div
              className='h-full bg-purple-600 rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current Time Marker */}
          <div
            className='absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-lg z-10'
            style={{ left: `${progress}%` }}
          >
            <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap'>
              {currentMinute}&apos;
            </div>
          </div>

          {/* Time Labels */}
          <div className='flex justify-between text-xs text-gray-500 mb-4'>
            <span>0&apos;</span>
            <span>45&apos;</span>
            <span>90&apos;</span>
          </div>

          {/* Events */}
          <div className='relative space-y-4'>
            {sortedEvents.map((event, index) => {
              const eventPosition = (event.minute / 90) * 100
              const isLeft = index % 2 === 0

              return (
                <div
                  key={event.id}
                  className={`absolute top-0 transform -translate-y-1/2 ${
                    isLeft ? 'left-0' : 'right-0'
                  }`}
                  style={{
                    left: isLeft ? `${Math.min(eventPosition, 45)}%` : 'auto',
                    right: !isLeft
                      ? `${Math.min(100 - eventPosition, 45)}%`
                      : 'auto',
                  }}
                >
                  <div
                    className={`flex items-center space-x-2 p-2 rounded-lg border ${getEventColor(
                      event.eventType
                    )} max-w-xs`}
                  >
                    {getEventIcon(event.eventType)}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <Badge variant='secondary' className='text-xs'>
                          {event.minute}&apos;
                        </Badge>
                        <span className='text-xs font-medium text-gray-600'>
                          {getEventLabel(event.eventType)}
                        </span>
                      </div>
                      {event.playerName && (
                        <div className='text-xs text-gray-700 font-medium truncate'>
                          {event.playerName}
                        </div>
                      )}
                      <div className='flex items-center space-x-1 mt-1'>
                        <div className='w-4 h-4'>
                          <Image
                            src={event.teamAvatar || '/no-club.jpg'}
                            alt={event.teamName}
                            width={16}
                            height={16}
                            className='w-full h-full object-cover rounded-full'
                          />
                        </div>
                        <span className='text-xs text-gray-600 truncate'>
                          {event.teamName}
                        </span>
                      </div>
                      {event.description && (
                        <div className='text-xs text-gray-500 mt-1'>
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {sortedEvents.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <Clock className='w-8 h-8 mx-auto mb-2 text-gray-400' />
              <p className='text-sm'>No events recorded yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
