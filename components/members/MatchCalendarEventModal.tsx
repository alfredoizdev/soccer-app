import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MatchEvent } from './MatchCalendarEvent'
import { formatTime, formatShortDate } from '@/lib/utils/formatDate'
import { abbreviateTeam } from '@/lib/utils/abbreviateTeam'

interface MatchCalendarEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: MatchEvent | null
}

export default function MatchCalendarEventModal({
  open,
  onOpenChange,
  event,
}: MatchCalendarEventModalProps) {
  const router = useRouter()
  if (!event) return null
  const { team1, team2, team1Avatar, team2Avatar, id } = event.resource || {}
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Match Details</DialogTitle>
        </DialogHeader>
        <div className='flex items-center justify-center gap-4 my-2'>
          <div className='flex flex-col items-center'>
            {team1Avatar && (
              <Image
                src={team1Avatar}
                alt={team1}
                width={64}
                height={64}
                className='rounded-full object-cover border'
              />
            )}
            <span className='font-bold text-xs mt-1'>
              {abbreviateTeam(team1)}
            </span>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-xs text-muted-foreground'>vs</span>
          </div>
          <div className='flex flex-col items-center'>
            {team2Avatar && (
              <Image
                src={team2Avatar}
                alt={team2}
                width={64}
                height={64}
                className='rounded-full object-cover border'
              />
            )}
            <span className='font-bold text-xs mt-1'>
              {abbreviateTeam(team2)}
            </span>
          </div>
        </div>
        <div className='text-center text-sm mb-2'>
          <span>
            {formatShortDate(event.start)} · {formatTime(event.start)}
          </span>
        </div>
        <DialogFooter>
          <button
            className='bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition'
            onClick={() => router.push(`/members/matches/live/${id}`)}
          >
            View match
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
