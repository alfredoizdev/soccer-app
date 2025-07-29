import { EventProps } from 'react-big-calendar'
import { abbreviateTeam } from '@/lib/utils/abbreviateTeam'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFutbol } from '@fortawesome/free-solid-svg-icons'

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
    location?: string | null
    address?: string
    status?: 'active' | 'inactive'
    notes?: string | null
  }
}

export default function MatchCalendarEvent({ event }: EventProps<MatchEvent>) {
  const { team1, team2 } = event.resource || {}

  return (
    <div className='flex items-center gap-2 p-1'>
      <FontAwesomeIcon icon={faFutbol} className='w-4 h-4' />
      <div className='flex gap-2 items-center justify-center'>
        <span className='font-semibold text-xs'>{abbreviateTeam(team1)}</span>
        <span className='mx-1 text-xs text-muted-foreground'>vs</span>
        <span className='font-semibold text-xs'>{abbreviateTeam(team2)}</span>
      </div>
    </div>
  )
}
