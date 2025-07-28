'use client'

import LiveMatchHeader from '@/components/members/LiveMatchHeader'
import LiveMatchScoreCard from '@/components/members/LiveMatchScoreCard'
import LiveMatchTimeline from '@/components/members/LiveMatchTimeline'
import TeamsInfo from '@/components/members/TeamsInfo'
import { useLiveMatchSocket } from '@/hooks/useLiveMatchSocket'

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
  const { liveScore, matchStatus, livePlayersTeam1, livePlayersTeam2 } =
    useLiveMatchSocket({
      match,
      playersTeam1,
      playersTeam2,
    })

  return (
    <div className='max-w-screen-xl mx-auto px-2 lg:px-4 py-4'>
      <LiveMatchHeader match={match} matchStatus={matchStatus} />
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Timeline a la izquierda */}
        <div className='w-full lg:w-2/3 flex-shrink-0 flex items-start justify-center'>
          <div className='w-full'>
            <LiveMatchTimeline
              match={match}
              liveScore={liveScore}
              matchStatus={matchStatus}
            />
          </div>
        </div>
        {/* Panel derecho: Score y Lineup uno debajo del otro */}
        <div className='w-full lg:w-1/3 flex flex-col gap-4 max-h-[900px] lg:max-h-[calc(100vh-120px)]'>
          <div className='hidden lg:block'>
            <LiveMatchScoreCard match={match} liveScore={liveScore} />
          </div>
          <div className='flex-1 flex flex-col gap-4 overflow-y-auto'>
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
