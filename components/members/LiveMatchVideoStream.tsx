'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVideoStream } from '@/hooks/useVideoStream'
import { userAuth } from '@/lib/actions/auth.action'
import { getActiveSessionByMatchIdAction } from '@/lib/actions/streaming-server.action'
import { Video, Mic, MicOff, Users, Square } from 'lucide-react'

interface LiveMatchVideoStreamProps {
  matchId: string
  matchTitle?: string
}

export default function LiveMatchVideoStream({
  matchId,
  matchTitle,
}: LiveMatchVideoStreamProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await userAuth()
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error('Error getting user:', error)
      }
    }
    getUser()
  }, [])

  // Obtener sesión activa para este match
  useEffect(() => {
    const getActiveSession = async () => {
      try {
        const result = await getActiveSessionByMatchIdAction(matchId)

        if (result.success && result.data) {
          setSessionId(result.data.id)
        }
      } catch (error) {
        console.error('Error getting active session:', error)
      }
    }

    if (matchId) {
      getActiveSession()
    }
  }, [matchId])

  // Usar el hook personalizado
  const {
    isWatching,
    isConnected,
    viewerCount,
    isAudioEnabled,
    videoRef,
    handleJoinStream,
    handleLeaveStream,
    toggleAudio,
  } = useVideoStream({ sessionId, user })

  if (!sessionId) {
    return (
      <Card className='p-6 rounded-none'>
        <div className='text-center'>
          <p className='text-muted-foreground'>
            No active stream for this match
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className='rounded-none'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold'>
              Live Stream - {matchTitle || 'Match'}
            </h3>
            <p className='text-sm text-muted-foreground'>
              Session: {sessionId.substring(0, 8)}...
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            <span className='text-sm'>{viewerCount} viewers</span>
          </div>
        </div>

        <div className='relative'>
          <video
            ref={videoRef}
            className='w-full h-64 bg-black rounded-none'
            autoPlay
            playsInline
            muted
          />

          {/* Live badge */}
          <div className='absolute top-2 right-2'>
            <Badge variant='destructive' className='flex items-center gap-1'>
              <div className='w-2 h-2 bg-white rounded-full animate-pulse' />
              LIVE
            </Badge>
          </div>

          {/* Audio toggle */}
          <Button
            variant='secondary'
            size='sm'
            className='absolute bottom-2 left-2'
            onClick={toggleAudio}
          >
            {isAudioEnabled ? (
              <Mic className='h-4 w-4' />
            ) : (
              <MicOff className='h-4 w-4' />
            )}
          </Button>
        </div>

        <div className='mt-4'>
          {!isWatching ? (
            <Button
              onClick={handleJoinStream}
              className='w-full rounded-none'
              disabled={!user}
            >
              <Video className='h-4 w-4 mr-2' />
              Join Stream
            </Button>
          ) : (
            <Button
              onClick={handleLeaveStream}
              variant='outline'
              className='w-full rounded-none'
            >
              <Square className='h-4 w-4 mr-2' />
              Leave Stream
            </Button>
          )}
        </div>

        <div className='mt-2 text-sm text-muted-foreground'>
          <p>Status: {isConnected ? 'Connected' : 'Connecting...'}</p>
          <p>Session ID: {sessionId}</p>
        </div>
      </div>
    </Card>
  )
}
