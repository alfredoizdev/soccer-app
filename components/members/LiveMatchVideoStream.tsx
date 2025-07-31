'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getActiveSessionByMatchIdAction } from '@/lib/actions/streaming-server.action'
import { Video } from 'lucide-react'
import { toast } from 'sonner'
import { socket } from '@/app/socket'

interface LiveMatchVideoStreamProps {
  matchId: string
  matchTitle?: string
}

export default function LiveMatchVideoStream({
  matchId,
}: LiveMatchVideoStreamProps) {
  const [sessionId, setSessionId] = useState<string>('')

  // Obtener sesión activa para este match
  useEffect(() => {
    const getActiveSession = async () => {
      try {
        console.log('Checking for active session for matchId:', matchId)
        const result = await getActiveSessionByMatchIdAction(matchId)

        if (result.success && result.data) {
          console.log('Found active session:', result.data.id)
          setSessionId(result.data.id)
        } else {
          console.log('No active session found for matchId:', matchId)
          setSessionId('')
        }
      } catch (error) {
        console.error('Error getting active session:', error)
        setSessionId('')
      }
    }

    if (matchId) {
      getActiveSession()
      // Polling cada 5 segundos para verificar si hay un stream activo
      const interval = setInterval(getActiveSession, 5000)
      return () => clearInterval(interval)
    }
  }, [matchId])

  // Escuchar eventos de streaming para actualizar el estado
  useEffect(() => {
    const handleStreamingStopped = (data: { sessionId: string }) => {
      console.log('Streaming stopped event:', data)
      if (data.sessionId === sessionId) {
        setSessionId('')
        toast.info('Stream has ended')
      }
    }

    const handleStreamingStarted = (data: { sessionId: string }) => {
      console.log('Streaming started event:', data)
      // Cuando se inicia un stream, verificar si hay un stream activo para este match
      const checkForActiveStream = async () => {
        try {
          console.log(
            'Checking for active session after streaming started for matchId:',
            matchId
          )
          const result = await getActiveSessionByMatchIdAction(matchId)
          if (result.success && result.data) {
            console.log(
              'Found active session after streaming started:',
              result.data.id
            )
            setSessionId(result.data.id)
            toast.success('Stream has started!')
          }
        } catch (error) {
          console.error(
            'Error checking for active session after streaming started:',
            error
          )
        }
      }
      checkForActiveStream()
    }

    socket.on('streaming:stopped', handleStreamingStopped)
    socket.on('streaming:started', handleStreamingStarted)

    return () => {
      socket.off('streaming:stopped', handleStreamingStopped)
      socket.off('streaming:started', handleStreamingStarted)
    }
  }, [sessionId, matchId])

  if (!sessionId) {
    return (
      <Card className='p-6 rounded-none'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            No active stream for this match
          </p>
          <Button
            onClick={async () => {
              try {
                console.log(
                  'Manual check for active session for matchId:',
                  matchId
                )
                const result = await getActiveSessionByMatchIdAction(matchId)
                if (result.success && result.data) {
                  console.log(
                    'Found active session on manual check:',
                    result.data.id
                  )
                  setSessionId(result.data.id)
                  toast.success('Stream found!')
                } else {
                  console.log(
                    'No active session found on manual check for matchId:',
                    matchId
                  )
                  toast.info('No active stream found')
                }
              } catch (error) {
                console.error('Error checking for active session:', error)
                toast.error('Error checking for stream')
              }
            }}
            variant='destructive'
            className='rounded-none'
          >
            <Video className='h-4 w-4 mr-2' />
            Check for Stream
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className='rounded-none w-full'>
      <div className='p-4 w-full'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold'>Live Stream</h3>
          </div>
          <div className='flex items-center gap-2'>
            {/* Botón para abrir fullscreen */}
            <a
              href={`/members/streams/${sessionId}/fullscreen`}
              target='_blank'
              rel='noopener noreferrer'
              title='Open fullscreen stream'
              className='ml-2 p-1 rounded hover:bg-muted transition-colors'
            >
              <Video className='h-5 w-5' />
            </a>
          </div>
        </div>

        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            Stream is active! Click the button above to watch in fullscreen.
          </p>
          <a
            href={`/members/streams/${sessionId}/fullscreen`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button className='w-full rounded-none'>
              <Video className='h-4 w-4 mr-2' />
              Watch Stream
            </Button>
          </a>
        </div>
      </div>
    </Card>
  )
}
