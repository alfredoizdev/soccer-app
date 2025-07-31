'use client'

import FullscreenScoreCard from './FullscreenScoreCard'
import CompactTimeline from './CompactTimeline'
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

interface FullscreenSidebarProps {
  match: Match
  playersTeam1: Player[]
  playersTeam2: Player[]
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

export default function FullscreenSidebar({
  match,
  playersTeam1,
  playersTeam2,
  events = [],
}: FullscreenSidebarProps) {
  const { liveScore, matchStatus, currentMinute } = useLiveMatchSocket({
    match,
    playersTeam1,
    playersTeam2,
  })

  console.log('FullscreenSidebar: Received events count:', events.length)

  return (
    <div className='h-full flex flex-col bg-white'>
      {/* Score Card */}
      <FullscreenScoreCard
        match={match}
        liveScore={liveScore}
        matchStatus={matchStatus}
        currentMinute={currentMinute}
      />

      {/* Timeline */}
      <div className='flex-1 overflow-y-auto'>
        <CompactTimeline
          match={match}
          matchStatus={matchStatus}
          playersTeam1={playersTeam1}
          playersTeam2={playersTeam2}
          events={events}
        />
      </div>
    </div>
  )
}
