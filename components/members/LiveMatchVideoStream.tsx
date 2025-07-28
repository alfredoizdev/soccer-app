'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useWebRTC } from '@/hooks/useWebRTC'
import { userAuth } from '@/lib/actions/auth.action'
import { getActiveSessionByMatchIdAction } from '@/lib/actions/streaming-server.action'
import { toast } from 'sonner'
import { Play, Square, Volume2, VolumeX, Users } from 'lucide-react'
import { socket } from '@/app/socket'

interface LiveMatchVideoStreamProps {
  matchId: string
  matchTitle?: string
}

export default function LiveMatchVideoStream({
  matchId,
  matchTitle,
}: LiveMatchVideoStreamProps) {
  const [isWatching, setIsWatching] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [isWaitingForStream, setIsWaitingForStream] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Obtener usuario actual
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const userData = await userAuth()
      setUser(userData)
    }
    getUser()
  }, [])

  // Buscar sesión activa para este match
  useEffect(() => {
    const checkActiveStream = async () => {
      try {
        const result = await getActiveSessionByMatchIdAction(matchId)
        if (result.success && result.data) {
          setActiveSessionId(result.data.id)
        } else {
          setActiveSessionId(null)
        }
      } catch (error) {
        console.error('Error checking active streams:', error)
        setActiveSessionId(null)
      }
    }

    checkActiveStream()
    // Verificar cada 30 segundos
    const interval = setInterval(checkActiveStream, 30000)
    return () => clearInterval(interval)
  }, [matchId])

  const { remoteStreams, isConnected, joinStream, leaveStream, error } =
    useWebRTC({
      sessionId: activeSessionId || '',
      userId: user?.id || '',
      isBroadcaster: false,
    })

  // Debug logging
  useEffect(() => {
    console.log('=== LiveMatchVideoStream Debug ===')
    console.log('Match ID:', matchId)
    console.log('Active session ID changed:', activeSessionId)
    console.log('User ID:', user?.id)
    console.log('Is connected:', isConnected)
    console.log('Remote streams count:', remoteStreams.size)
    console.log('Is waiting for stream:', isWaitingForStream)
    console.log('Is watching:', isWatching)
    console.log('================================')
  }, [
    activeSessionId,
    user?.id,
    isConnected,
    remoteStreams.size,
    isWaitingForStream,
    isWatching,
    matchId,
  ])

  // Mostrar stream remoto en el video element
  useEffect(() => {
    console.log('Remote streams changed:', remoteStreams.size, 'streams')
    if (videoRef.current && remoteStreams.size > 0) {
      // Tomar el primer stream remoto disponible
      const firstStream = Array.from(remoteStreams.values())[0]
      console.log('Setting video srcObject with stream:', firstStream)
      videoRef.current.srcObject = firstStream
      setIsWaitingForStream(false)
    }
  }, [remoteStreams])

  // Escuchar cambios en el número de espectadores
  useEffect(() => {
    const handleViewerJoined = () => {
      setViewerCount((prev) => prev + 1)
    }

    const handleViewerLeft = () => {
      setViewerCount((prev) => Math.max(0, prev - 1))
    }

    const handleStreamingStarted = () => {
      setIsWatching(true)
    }

    const handleStreamingStopped = () => {
      setIsWatching(false)
      setViewerCount(0)
      setActiveSessionId(null)
      toast.info('Stream has ended')
    }

    socket.on('streaming:viewer_joined', handleViewerJoined)
    socket.on('streaming:viewer_left', handleViewerLeft)
    socket.on('streaming:started', handleStreamingStarted)
    socket.on('streaming:stopped', handleStreamingStopped)

    return () => {
      socket.off('streaming:viewer_joined', handleViewerJoined)
      socket.off('streaming:viewer_left', handleViewerLeft)
      socket.off('streaming:started', handleStreamingStarted)
      socket.off('streaming:stopped', handleStreamingStopped)
    }
  }, [])

  const handleJoinStream = async () => {
    if (!user) {
      toast.error('You must be logged in to watch streams')
      return
    }

    if (!activeSessionId) {
      toast.error('No active stream available for this match')
      return
    }

    try {
      setIsWaitingForStream(true)
      console.log('Joining stream with sessionId:', activeSessionId)
      await joinStream()
      console.log('Join stream completed, waiting for remote streams...')
      toast.success('Joined stream successfully')
    } catch (error) {
      console.error('Error joining stream:', error)
      toast.error('Failed to join stream')
      setIsWaitingForStream(false)
    }
  }

  const handleLeaveStream = () => {
    leaveStream()
    setIsWatching(false)
    setIsWaitingForStream(false)
    toast.info('Left stream')
  }

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsAudioEnabled(!videoRef.current.muted)
    }
  }

  if (error) {
    return (
      <Card className='p-4 rounded-none'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className='rounded-none'
          >
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className='p-4 rounded-none'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-lg font-semibold'>
            Live Stream - {matchTitle || 'Match'}
          </h3>
          {activeSessionId && (
            <p className='text-sm text-gray-600'>
              Session: {activeSessionId.slice(0, 8)}...
            </p>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Users className='w-4 h-4' />
          <span className='text-sm'>{viewerCount} viewers</span>
        </div>
      </div>

      {!activeSessionId ? (
        <div className='text-center space-y-4'>
          <div className='w-full h-48 bg-gray-900 rounded-none flex items-center justify-center'>
            <div className='text-center text-gray-400'>
              <Play className='w-12 h-12 mx-auto mb-4' />
              <p>No active stream for this match</p>
            </div>
          </div>
        </div>
      ) : !isWatching ? (
        <div className='text-center space-y-4'>
          <div className='w-full h-48 bg-gray-900 rounded-none flex items-center justify-center'>
            <div className='text-center text-gray-400'>
              <Play className='w-12 h-12 mx-auto mb-4' />
              <p>Stream available - Click to join</p>
            </div>
          </div>

          <Button
            onClick={handleJoinStream}
            className='w-full rounded-none'
            disabled={!user}
          >
            <Play className='w-4 h-4 mr-2' />
            Join Stream
          </Button>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='relative'>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className='w-full h-48 bg-black rounded-none object-cover'
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(console.error)
                }
              }}
              onError={(e) => {
                console.error('Video error:', e)
              }}
            />

            {isWaitingForStream && (
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                <div className='text-white text-center'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2'></div>
                  <p>Waiting for stream...</p>
                </div>
              </div>
            )}

            {/* Overlay controls */}
            <div className='absolute bottom-2 left-2 flex gap-2'>
              <Button
                size='sm'
                variant={isAudioEnabled ? 'default' : 'destructive'}
                className='rounded-none'
                onClick={toggleAudio}
              >
                {isAudioEnabled ? (
                  <Volume2 className='w-3 h-3' />
                ) : (
                  <VolumeX className='w-3 h-3' />
                )}
              </Button>
            </div>

            {/* Status indicator */}
            <div className='absolute top-2 right-2'>
              <div className='flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-none text-xs'>
                <div className='w-1.5 h-1.5 bg-white rounded-full animate-pulse'></div>
                LIVE
              </div>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={handleLeaveStream}
              variant='outline'
              size='sm'
              className='flex-1 rounded-none'
            >
              <Square className='w-3 h-3 mr-1' />
              Leave Stream
            </Button>
          </div>

          <div className='text-xs text-gray-600'>
            <p>
              <strong>Status:</strong>{' '}
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
