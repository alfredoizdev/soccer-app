'use client'

import React from 'react'
import { getEventIconData } from '@/lib/utils/matchEvents'

export type EventIconProps = {
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
  className?: string
}

export const EventIcon = ({
  eventType,
  className = 'w-4 h-4',
}: EventIconProps) => {
  const iconData = getEventIconData(eventType)

  return (
    <div
      className={`${className} ${iconData.color} rounded-full flex items-center justify-center`}
    >
      <span className='text-xs font-bold text-white'>{iconData.text}</span>
    </div>
  )
}
