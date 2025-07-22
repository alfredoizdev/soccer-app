'use client'

import { Badge } from '@/components/ui/badge'

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
  matchStatus: 'not-started' | 'live' | 'ended'
}

export default function LiveMatchHeader({
  match,
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
            variant={matchStatus === 'live' ? 'default' : 'secondary'}
            className={
              matchStatus === 'live'
                ? 'animate-pulse bg-red-600 text-white border-none'
                : ''
            }
          >
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
