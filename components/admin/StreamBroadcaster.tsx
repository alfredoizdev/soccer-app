'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useWebRTC } from '@/hooks/useWebRTC'
import {
  createStreamingSessionAction,
  endStreamingSessionAction,
} from '@/lib/actions/streaming-server.action'
import { userAuth } from '@/lib/actions/auth.action'
import { toast } from 'sonner'
import { Video, VideoOff, Mic, MicOff, Settings, Users } from 'lucide-react'
import { socket } from '@/app/socket'

interface StreamBroadcasterProps {
  matchId: string
  matchTitle?: string
}

export default function StreamBroadcaster({
  matchId,
  matchTitle,
}: StreamBroadcasterProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [title, setTitle] = useState(matchTitle || '')
  const [description, setDescription] = useState('')
  const [viewerCount, setViewerCount] = useState(0)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Obtener usuario actual usando server action
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)

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

  const { localStream, isConnected, startStream, stopStream, error } =
    useWebRTC({
      sessionId: sessionId || '',
      userId: user?.id || '',
      isBroadcaster: true,
    })

  // Mostrar stream local en el video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Escuchar cambios en el número de espectadores
  useEffect(() => {
    const handleViewerJoined = () => {
      setViewerCount((prev) => prev + 1)
    }

    const handleViewerLeft = () => {
      setViewerCount((prev) => Math.max(0, prev - 1))
    }

    socket.on('streaming:viewer_joined', handleViewerJoined)
    socket.on('streaming:viewer_left', handleViewerLeft)

    return () => {
      socket.off('streaming:viewer_joined', handleViewerJoined)
      socket.off('streaming:viewer_left', handleViewerLeft)
    }
  }, [socket])

  const handleStartStream = async () => {
    if (!user) {
      toast.error('You must be logged in to start streaming')
      return
    }

    if (!title.trim()) {
      toast.error('Please enter a stream title')
      return
    }

    try {
      // Crear sesión de streaming usando server action
      const formData = new FormData()
      formData.append('matchId', matchId)
      formData.append('broadcasterId', user.id)
      formData.append('title', title.trim())
      formData.append('description', description.trim())

      const result = await createStreamingSessionAction(formData)

      if (result.success && 'data' in result && result.data) {
        const newSessionId = result.data.id
        setSessionId(newSessionId)

        // Iniciar transmisión WebRTC con el sessionId correcto
        await startStream(newSessionId)
        setIsStreaming(true)

        toast.success('Stream started successfully')
      } else {
        toast.error('Failed to create streaming session')
      }
    } catch (err) {
      console.error('Error starting stream:', err)
      toast.error('Failed to start stream')
    }
  }

  const handleStopStream = async () => {
    try {
      // Detener transmisión WebRTC
      stopStream()

      // Finalizar sesión de streaming
      if (sessionId) {
        const formData = new FormData()
        formData.append('sessionId', sessionId)

        const result = await endStreamingSessionAction(formData)

        if (!result.success) {
          console.error('Failed to end streaming session:', result.error)
          toast.error('Failed to end streaming session')
          return
        }
      }

      setIsStreaming(false)
      setSessionId(null)
      setViewerCount(0)

      toast.success('Stream stopped successfully')
    } catch (err) {
      console.error('Error stopping stream:', err)
      toast.error('Failed to stop stream')
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  if (error) {
    return (
      <Card className='p-6'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold'>Live Stream</h2>
          <div className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            <span className='text-sm'>{viewerCount} viewers</span>
          </div>
        </div>

        {!isStreaming ? (
          <div className='space-y-4'>
            <div>
              <Label htmlFor='title'>Stream Title</Label>
              <Input
                id='title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter stream title'
                className='mt-1'
              />
            </div>

            <div>
              <Label htmlFor='description'>Description</Label>
              <textarea
                id='description'
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
                placeholder='Enter stream description'
                className='mt-1 w-full p-2 border border-gray-300 rounded-md resize-none'
                rows={3}
              />
            </div>

            <Button
              onClick={handleStartStream}
              className='w-full'
              disabled={!user}
            >
              <Video className='w-4 h-4 mr-2' />
              Start Stream
            </Button>
            {!user && (
              <p className='text-sm text-gray-500'>Loading user data...</p>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='relative'>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className='w-full h-64 bg-black rounded-lg object-cover'
              />

              {/* Overlay controls */}
              <div className='absolute bottom-4 left-4 flex gap-2'>
                <Button
                  size='sm'
                  variant={isAudioEnabled ? 'default' : 'destructive'}
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? (
                    <Mic className='w-4 h-4' />
                  ) : (
                    <MicOff className='w-4 h-4' />
                  )}
                </Button>

                <Button
                  size='sm'
                  variant={isVideoEnabled ? 'default' : 'destructive'}
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? (
                    <Video className='w-4 h-4' />
                  ) : (
                    <VideoOff className='w-4 h-4' />
                  )}
                </Button>
              </div>

              {/* Status indicator */}
              <div className='absolute top-4 right-4'>
                <div className='flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded text-sm'>
                  <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                  LIVE
                </div>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={handleStopStream}
                variant='destructive'
                className='flex-1'
              >
                <VideoOff className='w-4 h-4 mr-2' />
                Stop Stream
              </Button>

              <Button variant='outline' size='sm'>
                <Settings className='w-4 h-4' />
              </Button>
            </div>

            <div className='text-sm text-gray-600'>
              <p>
                <strong>Status:</strong>{' '}
                {isConnected ? 'Connected' : 'Connecting...'}
              </p>
              <p>
                <strong>Session ID:</strong> {sessionId}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
