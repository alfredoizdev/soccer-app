'use client'

import LiveMatchHeader from '@/components/members/LiveMatchHeader'
import LiveMatchScoreCard from '@/components/members/LiveMatchScoreCard'
import LiveMatchScoreCardCompact from '@/components/members/LiveMatchScoreCardCompact'
import LiveMatchTimeline from '@/components/members/LiveMatchTimeline'
import TeamsInfo from '@/components/members/TeamsInfo'
import LiveMatchVideoStream from '@/components/members/LiveMatchVideoStream'
import { useLiveMatchSocket } from '@/hooks/useLiveMatchSocket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Trophy } from 'lucide-react'
import Link from 'next/link'

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

interface LiveMatchViewerProps {
  match: Match
  playersTeam1: Player[]
  playersTeam2: Player[]
}

export default function LiveMatchViewer({
  match,
  playersTeam1,
  playersTeam2,
}: LiveMatchViewerProps) {
  const {
    liveScore,
    matchStatus,
    livePlayersTeam1,
    livePlayersTeam2,
    currentMinute,
  } = useLiveMatchSocket({
    match,
    playersTeam1,
    playersTeam2,
  })

  // Si el partido terminó, mostrar la card de fin de partido
  if (matchStatus === 'ended') {
    return (
      <div className='max-w-screen-xl mx-auto px-2 lg:px-4 py-4'>
        <Card className='w-full max-w-2xl mx-auto'>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4'>
              <Trophy className='w-16 h-16 text-yellow-500' />
            </div>
            <CardTitle className='text-2xl font-bold text-gray-800'>
              Match Ended
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <div className='mb-6'>
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                {match.team1} vs {match.team2}
              </h3>
              <div className='text-3xl font-bold text-gray-800'>
                {liveScore.team1Goals} - {liveScore.team2Goals}
              </div>
            </div>

            <p className='text-gray-600 mb-6'>
              This match has ended. View detailed statistics, player
              performance, and match timeline in the match history.
            </p>

            <div className='flex flex-row gap-3 justify-center'>
              <Link href={`/members/matches/history/${match.id}/timeline`}>
                <Button className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4' />
                  History
                </Button>
              </Link>
              <Link href='/members/matches/history'>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Trophy className='w-4 h-4' />
                  All Matches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='max-w-screen-xl mx-auto px-2 lg:px-4 py-4'>
      {/* Score Card arriba del video stream */}

      <LiveMatchHeader match={match} matchStatus={matchStatus} />

      <div className='mb-4'>
        <LiveMatchScoreCard
          match={match}
          liveScore={liveScore}
          matchStatus={matchStatus}
          currentMinute={currentMinute}
        />
      </div>

      {/* Video Stream Section - Fixed at top */}
      <div className='mb-6'>
        <LiveMatchVideoStream
          matchId={match.id}
          matchTitle={`${match.team1} vs ${match.team2}`}
        />
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Timeline a la izquierda con scroll independiente */}
        <div className='w-full lg:w-2/3 flex-shrink-0'>
          <div className='w-full max-h-[calc(100vh-450px)] overflow-y-auto pr-2'>
            <LiveMatchTimeline match={match} matchStatus={matchStatus} />
          </div>
        </div>
        {/* Panel derecho: Score y Lineup uno debajo del otro */}
        <div className='w-full lg:w-1/3 flex flex-col gap-4'>
          <div className='hidden lg:block'>
            <LiveMatchScoreCardCompact match={match} liveScore={liveScore} />
          </div>
          <div className='flex-1 flex flex-col gap-4'>
            <TeamsInfo
              teamName={match.team1}
              teamAvatar={match.team1Avatar}
              players={livePlayersTeam1}
            />
            <TeamsInfo
              teamName={match.team2}
              teamAvatar={match.team2Avatar}
              players={livePlayersTeam2}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
