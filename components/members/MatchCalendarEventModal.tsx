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
import { Avatar } from '@/components/ui/avatar'
import { MapPin, Calendar, Clock } from 'lucide-react'
import GoogleMap from './GoogleMap'
import Image from 'next/image'

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
  const { team1, team2, team1Avatar, team2Avatar, id, status, location } =
    event.resource || {}
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

        {/* Teams with Avatars */}
        <div className='flex items-center justify-center gap-6 my-4'>
          <div className='flex flex-col items-center'>
            <Avatar className='w-12 h-12 mb-2'>
              <Image
                width={48}
                height={48}
                src={team1Avatar || '/no-profile.webp'}
                alt={team1}
                className='w-full h-full object-cover'
              />
            </Avatar>
            <span className='font-bold text-sm text-center'>
              {abbreviateTeam(team1)}
            </span>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-lg font-bold text-muted-foreground'>VS</span>
          </div>
          <div className='flex flex-col items-center'>
            <Avatar className='w-12 h-12 mb-2'>
              <Image
                width={48}
                height={48}
                src={team2Avatar || '/no-profile.webp'}
                alt={team2}
                className='w-full h-full object-cover'
              />
            </Avatar>
            <span className='font-bold text-sm text-center'>
              {abbreviateTeam(team2)}
            </span>
          </div>
        </div>

        {/* Date and Time */}
        <div className='flex items-center justify-center gap-2 text-sm text-gray-600 mb-3'>
          <Calendar className='w-4 h-4' />
          <span>{formatShortDate(event.start)}</span>
          <Clock className='w-4 h-4' />
          <span>{formatTime(event.start)}</span>
        </div>

        {/* Location */}
        {location && (
          <div className='mb-4'>
            <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
              <MapPin className='w-4 h-4' />
              <span className='font-medium'>Location</span>
            </div>
            <div className='bg-gray-50 p-3 rounded-none'>
              <p className='font-medium text-sm'>{location}</p>
            </div>
            <div className='mt-3'>
              <GoogleMap location={location} height='200px' />
            </div>
          </div>
        )}

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
