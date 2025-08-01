'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { abbreviateTeam } from '@/lib/utils/abbreviateTeam'

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

interface LiveMatchScoreCardCompactProps {
  match: Match
  liveScore: {
    team1Goals: number
    team2Goals: number
  }
}

export default function LiveMatchScoreCardCompact({
  match,
  liveScore,
}: LiveMatchScoreCardCompactProps) {
  return (
    <Card className='mb-2 rounded-none'>
      <CardHeader>
        <CardTitle className='text-center'>Live Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center gap-8'>
          {/* Team 1 */}
          <div className='flex flex-col items-center'>
            <Avatar className='w-16 h-16 mb-3'>
              <AvatarImage
                src={match.team1Avatar || '/no-club.jpg'}
                alt={match.team1}
              />
              <AvatarFallback>{match.team1.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className='text-lg font-semibold text-center mb-2'>
              {abbreviateTeam(match.team1)}
            </h3>
            <div className='text-4xl font-bold text-blue-600'>
              <span style={{ color: '#6B7280' }}>{liveScore.team1Goals}</span>
            </div>
          </div>

          {/* VS */}
          <div className='text-2xl font-bold text-gray-400'>VS</div>

          {/* Team 2 */}
          <div className='flex flex-col items-center'>
            <Avatar className='w-16 h-16 mb-3'>
              <AvatarImage
                src={match.team2Avatar || '/no-club.jpg'}
                alt={match.team2}
              />
              <AvatarFallback>{match.team2.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className='text-lg font-semibold text-center mb-2'>
              {abbreviateTeam(match.team2)}
            </h3>
            <div className='text-4xl font-bold text-blue-600'>
              <span style={{ color: '#6B7280' }}>{liveScore.team2Goals}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
