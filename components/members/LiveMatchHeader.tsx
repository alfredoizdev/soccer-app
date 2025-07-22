'use client'

import { Badge } from '@/components/ui/badge'
import { Play, Square } from 'lucide-react'

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

interface LiveMatchHeaderProps {
  match: Match
  isConnected: boolean
  matchStatus: 'not-started' | 'live' | 'ended'
}

export default function LiveMatchHeader({
  match,
  isConnected,
  matchStatus,
}: LiveMatchHeaderProps) {
  return (
    <div className='mb-6'>
      <div className='flex items-center flex-col sm:flex-row justify-between mb-4'>
        <h1 className='sm:text-2xl text-xl font-bold'>
          {match.team1} vs {match.team2}
        </h1>
        <div className='flex items-center gap-2'>
          <Badge
            variant={isConnected ? 'default' : 'secondary'}
            className='flex items-center gap-1'
          >
            {isConnected ? (
              <Play className='w-3 h-3' />
            ) : (
              <Square className='w-3 h-3' />
            )}
            {isConnected ? 'Live' : 'Disconnected'}
          </Badge>
          <Badge variant={matchStatus === 'live' ? 'default' : 'secondary'}>
            {matchStatus === 'live'
              ? 'Live'
              : matchStatus === 'ended'
              ? 'Ended'
              : 'Not Started'}
          </Badge>
        </div>
      </div>
    </div>
  )
}
