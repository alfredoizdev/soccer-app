import { EventProps } from 'react-big-calendar'
import Image from 'next/image'
import { abbreviateTeam } from '@/lib/utils/abbreviateTeam'

// Tipo para los eventos del calendario
export type MatchEvent = {
  title: string
  start: Date
  end: Date
  resource: {
    id: string
    team1: string
    team2: string
    team1Avatar?: string
    team2Avatar?: string
    location?: string
    status?: 'active' | 'inactive'
  }
}

export default function MatchCalendarEvent({ event }: EventProps<MatchEvent>) {
  const { team1, team2, team1Avatar, team2Avatar } = event.resource || {}

  return (
    <div className='flex items-center gap-2 p-1'>
      {team1Avatar && (
        <Image
          src={team1Avatar}
          alt={team1}
          width={24}
          height={24}
          className='rounded-full object-cover border'
        />
      )}
      <div className='flex flex-col items-center justify-center'>
        <span className='font-semibold text-xs'>{abbreviateTeam(team1)}</span>
        <span className='mx-1 text-xs text-muted-foreground'>vs</span>
        <span className='font-semibold text-xs'>{abbreviateTeam(team2)}</span>
      </div>
      {team2Avatar && (
        <Image
          src={team2Avatar}
          alt={team2}
          width={24}
          height={24}
          className='rounded-full object-cover border'
        />
      )}
    </div>
  )
}
