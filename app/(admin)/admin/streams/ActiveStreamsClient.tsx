'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Video, VideoOff, Clock, User, Users, Square } from 'lucide-react'
import { endStreamingSessionAction } from '@/lib/actions/streaming-server.action'
import { socket } from '@/app/socket'
import { formatDistanceToNow } from 'date-fns'

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

interface ActiveStreamsClientProps {
  streams: Stream[]
}

export default function ActiveStreamsClient({
  streams,
}: ActiveStreamsClientProps) {
  const [activeStreams, setActiveStreams] = useState<Stream[]>(streams)
  const [stoppingStreams, setStoppingStreams] = useState<Set<string>>(new Set())

  const handleStopStream = async (streamId: string) => {
    if (stoppingStreams.has(streamId)) return

    setStoppingStreams((prev) => new Set(prev).add(streamId))

    try {
      const formData = new FormData()
      formData.append('sessionId', streamId)

      const result = await endStreamingSessionAction(formData)

      if (result.success) {
        // Emitir evento para detener el stream en tiempo real
        socket.emit('streaming:stop', {
          sessionId: streamId,
        })

        // También emitir el evento de stop_by_match para asegurar que se detenga
        const stream = activeStreams.find((s) => s.id === streamId)
        if (stream) {
          console.log(
            'Emitting streaming:stop_by_match for matchId:',
            stream.matchId
          )
          socket.emit('streaming:stop_by_match', {
            matchId: stream.matchId,
          })
        }

        // Remover el stream de la lista
        setActiveStreams((prev) =>
          prev.filter((stream) => stream.id !== streamId)
        )
        toast.success('Stream stopped successfully')
      } else {
        toast.error(result.error || 'Failed to stop stream')
      }
    } catch (error) {
      console.error('Error stopping stream:', error)
      toast.error('Failed to stop stream')
    } finally {
      setStoppingStreams((prev) => {
        const newSet = new Set(prev)
        newSet.delete(streamId)
        return newSet
      })
    }
  }

  const handleStopAllStreams = async () => {
    if (activeStreams.length === 0) return

    setStoppingStreams(new Set(activeStreams.map((s) => s.id)))

    try {
      // Detener todos los streams
      await Promise.all(
        activeStreams.map(async (stream) => {
          const formData = new FormData()
          formData.append('sessionId', stream.id)
          await endStreamingSessionAction(formData)

          // Emitir evento para cada stream
          socket.emit('streaming:stop', {
            sessionId: stream.id,
          })

          // También emitir el evento de stop_by_match
          socket.emit('streaming:stop_by_match', {
            matchId: stream.matchId,
          })
        })
      )

      setActiveStreams([])
      toast.success('All streams stopped successfully')
    } catch (error) {
      console.error('Error stopping all streams:', error)
      toast.error('Failed to stop all streams')
    } finally {
      setStoppingStreams(new Set())
    }
  }

  if (activeStreams.length === 0) {
    return (
      <Card className='w-full'>
        <CardContent className='p-8'>
          <div className='text-center'>
            <VideoOff className='w-16 h-16 mx-auto text-gray-400 mb-4' />
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>
              No Active Streams
            </h3>
            <p className='text-gray-500'>
              There are currently no active streaming sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header con estadísticas */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>
            Active Streams ({activeStreams.length})
          </h2>
          <p className='text-sm text-gray-600'>
            Manage and monitor active streaming sessions
          </p>
        </div>

        <Button
          onClick={handleStopAllStreams}
          variant='destructive'
          disabled={stoppingStreams.size > 0}
          className='flex items-center gap-2'
        >
          <Square className='w-4 h-4' />
          Stop All Streams
        </Button>
      </div>

      {/* Lista de streams */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {activeStreams.map((stream) => (
          <Card key={stream.id} className='relative'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <Video className='w-5 h-5 text-red-500' />
                    {stream.title}
                  </CardTitle>
                  <p className='text-sm text-gray-600 mt-1'>
                    {stream.description}
                  </p>
                </div>
                <Badge variant='secondary' className='ml-2'>
                  LIVE
                </Badge>
              </div>
            </CardHeader>

            <CardContent className='space-y-4'>
              {/* Información del stream */}
              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-gray-500' />
                  <span className='text-gray-600'>Broadcaster ID:</span>
                  <span className='font-mono text-xs'>
                    {stream.broadcasterId}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-gray-500' />
                  <span className='text-gray-600'>Started:</span>
                  <span>
                    {stream.startedAt
                      ? formatDistanceToNow(new Date(stream.startedAt), {
                          addSuffix: true,
                        })
                      : formatDistanceToNow(new Date(stream.createdAt), {
                          addSuffix: true,
                        })}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Users className='w-4 h-4 text-gray-500' />
                  <span className='text-gray-600'>Match ID:</span>
                  <span className='font-mono text-xs'>{stream.matchId}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className='flex gap-2'>
                <Button
                  onClick={() => handleStopStream(stream.id)}
                  variant='destructive'
                  size='sm'
                  disabled={stoppingStreams.has(stream.id)}
                  className='w-full'
                >
                  <VideoOff className='w-4 h-4 mr-2' />
                  {stoppingStreams.has(stream.id)
                    ? 'Stopping...'
                    : 'Stop Stream'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
