'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Users, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface StreamingSession {
  id: string
  matchId: string
  broadcasterId: string
  title: string | null
  description: string | null
  startedAt: Date | null
  streamKey: string
}

interface ActiveStreamsClientProps {
  sessions: StreamingSession[]
}

export default function ActiveStreamsClient({
  sessions,
}: ActiveStreamsClientProps) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  if (sessions.length === 0) {
    return (
      <div className='text-center py-12'>
        <Video className='w-16 h-16 mx-auto text-gray-400 mb-4' />
        <h3 className='text-xl font-semibold text-gray-600 mb-2'>
          No Active Streams
        </h3>
        <p className='text-gray-500'>
          There are currently no live streams available.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {sessions.map((session) => (
          <Card
            key={session.id}
            className='p-6 hover:shadow-lg transition-shadow rounded-none'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold mb-2'>{session.title}</h3>
                {session.description && (
                  <p className='text-gray-600 text-sm mb-3'>
                    {session.description}
                  </p>
                )}
              </div>
              <Badge variant='destructive' className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                LIVE
              </Badge>
            </div>

            <div className='space-y-3 mb-4'>
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <Calendar className='w-4 h-4' />
                <span>
                  Started{' '}
                  {session.startedAt
                    ? formatDistanceToNow(new Date(session.startedAt), {
                        addSuffix: true,
                      })
                    : 'Unknown'}
                </span>
              </div>

              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <Users className='w-4 h-4' />
                <span>
                  Broadcaster ID: {session.broadcasterId.slice(0, 8)}...
                </span>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={() => setSelectedSession(session.id)}
                className='flex-1 rounded-none'
              >
                <Video className='w-4 h-4 mr-2' />
                Watch Stream
              </Button>

              <Button variant='outline' size='sm' className='rounded-none'>
                <Users className='w-4 h-4' />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for selected stream */}
      {selectedSession && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-none p-6 max-w-2xl w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold'>Watch Live Stream</h2>
              <Button
                variant='ghost'
                size='sm'
                className='rounded-none'
                onClick={() => setSelectedSession(null)}
              >
                ×
              </Button>
            </div>

            <div className='mb-4'>
              <p className='text-gray-600 mb-2'>
                Click the button below to join the live stream:
              </p>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={() => {
                  // Navigate to the stream viewer page
                  window.open(`/members/streams/${selectedSession}`, '_blank')
                  setSelectedSession(null)
                }}
                className='flex-1 rounded-none'
              >
                <Video className='w-4 h-4 mr-2' />
                Join Stream
              </Button>

              <Button
                variant='outline'
                className='rounded-none'
                onClick={() => setSelectedSession(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
