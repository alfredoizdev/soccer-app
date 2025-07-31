'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Video, VideoOff, Clock, User, Users, Play } from 'lucide-react'
import { endStreamingSessionAction } from '@/lib/actions/streaming-server.action'
import { socket } from '@/app/socket'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import StreamBroadcaster from '@/components/admin/StreamBroadcaster'

interface Stream {
  id: string
  matchId: string
  broadcasterId: string
  title: string
  description: string
  streamKey: string
  isActive: boolean
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
}

interface Match {
  id: string
  date: Date
  team1: string
  team2: string
  team1Id: string
  team2Id: string
  team1Goals: number
  team2Goals: number
  team1Avatar: string
  team2Avatar: string
  duration: number | null
  status: 'active' | 'inactive'
  location: string | null
}

interface MatchStreamsClientProps {
  match: Match
  stream: Stream | null
  matchId: string
}

export default function MatchStreamsClient({
  match,
  stream,
  matchId,
}: MatchStreamsClientProps) {
  const [currentStream, setCurrentStream] = useState<Stream | null>(stream)
  const [isStopping, setIsStopping] = useState(false)

  const handleStopStream = async () => {
    if (!currentStream || isStopping) return

    setIsStopping(true)

    try {
      const formData = new FormData()
      formData.append('sessionId', currentStream.id)

      const result = await endStreamingSessionAction(formData)

      if (result.success) {
        // Emitir evento para detener el stream en tiempo real
        socket.emit('streaming:stop', {
          sessionId: currentStream.id,
        })

        // También emitir el evento de stop_by_match
        socket.emit('streaming:stop_by_match', {
          matchId: matchId,
        })

        setCurrentStream(null)
        toast.success('Stream stopped successfully')
      } else {
        toast.error(result.error || 'Failed to stop stream')
      }
    } catch (error) {
      console.error('Error stopping stream:', error)
      toast.error('Failed to stop stream')
    } finally {
      setIsStopping(false)
    }
  }

  if (!currentStream) {
    return (
      <div className='space-y-6'>
        <Card className='w-full'>
          <CardContent className='p-8'>
            <div className='text-center'>
              <VideoOff className='w-16 h-16 mx-auto text-gray-400 mb-4' />
              <h3 className='text-xl font-semibold text-gray-600 mb-2'>
                No Active Stream
              </h3>
              <p className='text-gray-500 mb-4'>
                There is no active stream for this match. Start streaming below.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* StreamBroadcaster Component */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Video className='w-5 h-5' />
              Start Streaming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreamBroadcaster
              matchId={matchId}
              matchTitle={`${match.team1} vs ${match.team2}`}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Información del match */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Match Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h3 className='font-semibold text-lg'>
                {match.team1} vs {match.team2}
              </h3>
              <p className='text-sm text-gray-600'>
                {new Date(match.date).toLocaleDateString()}
              </p>
            </div>
            <div className='text-right'>
              <Badge
                variant={match.status === 'active' ? 'default' : 'secondary'}
              >
                {match.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del stream */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Video className='w-5 h-5 text-red-500' />
              Active Stream
            </CardTitle>
            <Badge variant='secondary'>LIVE</Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div>
            <h4 className='font-semibold text-lg'>{currentStream.title}</h4>
            <p className='text-gray-600'>{currentStream.description}</p>
          </div>

          {/* Información del stream */}
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-gray-500' />
              <span className='text-gray-600'>Broadcaster ID:</span>
              <span className='font-mono text-xs'>
                {currentStream.broadcasterId}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4 text-gray-500' />
              <span className='text-gray-600'>Started:</span>
              <span>
                {currentStream.startedAt
                  ? formatDistanceToNow(new Date(currentStream.startedAt), {
                      addSuffix: true,
                    })
                  : formatDistanceToNow(new Date(currentStream.createdAt), {
                      addSuffix: true,
                    })}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Users className='w-4 h-4 text-gray-500' />
              <span className='text-gray-600'>Match ID:</span>
              <span className='font-mono text-xs'>{currentStream.matchId}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className='flex gap-2 pt-4'>
            <Button
              onClick={handleStopStream}
              variant='destructive'
              disabled={isStopping}
              className='flex items-center gap-2'
            >
              <VideoOff className='w-4 h-4' />
              {isStopping ? 'Stopping...' : 'Stop Stream'}
            </Button>

            <Button
              variant='outline'
              onClick={() => {
                // Copiar el stream key al clipboard
                navigator.clipboard.writeText(currentStream.streamKey)
                toast.success('Stream key copied to clipboard')
              }}
            >
              Copy Stream Key
            </Button>

            <Link href={`/admin/matches/live/${matchId}`}>
              <Button variant='outline'>
                <Play className='w-4 h-4 mr-2' />
                Go to Live Match
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
