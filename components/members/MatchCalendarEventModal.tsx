import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
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
  const { team1, team2, id, status } = event.resource || {}
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[calc(100vw-2rem)] sm:max-w-md px-4 sm:px-8 rounded-none'>
        <DialogHeader>
          <DialogTitle>Match Details</DialogTitle>
          {status === 'inactive' && (
            <div className='flex justify-center mt-2'>
              <Badge
                variant='secondary'
                className='bg-yellow-100 text-yellow-800 border-yellow-200'
              >
                🏁 Match Completed
              </Badge>
            </div>
          )}
        </DialogHeader>
        <div className='flex items-center justify-center gap-4 my-2'>
          <div className='flex flex-col items-center'>
            <span className='font-bold text-xs mt-1'>
              {abbreviateTeam(team1)}
            </span>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-xs text-muted-foreground'>vs</span>
          </div>
          <div className='flex flex-col items-center'>
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
            className='bg-black text-white px-4 py-2 rounded-none hover:bg-gray-900 transition'
            onClick={() => {
              if (status === 'inactive') {
                router.push(`/members/matches/history/${id}/timeline`)
              } else {
                router.push(`/members/matches/live/${id}`)
              }
            }}
          >
            {status === 'inactive' ? 'See History' : 'View Match'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
