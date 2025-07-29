'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { userAuth } from '@/lib/actions/auth.action'
import { toast } from 'sonner'
import { Play, Square, Volume2, VolumeX, Users } from 'lucide-react'
import { socket } from '@/app/socket'

interface StreamViewerProps {
  sessionId: string
  streamTitle?: string
  broadcasterName?: string
  initialIsActive: boolean
}

export default function StreamViewer({
  sessionId,
  streamTitle,
  broadcasterName,
  initialIsActive,
}: StreamViewerProps) {
  const [isWatching, setIsWatching] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isStreamActive, setIsStreamActive] = useState(initialIsActive)

  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

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

  // Escuchar eventos de streaming
  useEffect(() => {
    const handleViewerJoined = () => {
      setViewerCount((prev) => prev + 1)
    }

    const handleViewerLeft = () => {
      setViewerCount((prev) => Math.max(0, prev - 1))
    }

    const handleStreamingStarted = (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setIsStreamActive(true)
        toast.success('Stream has started!')
      }
    }

    const handleStreamingStopped = (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setIsStreamActive(false)
        setIsWatching(false)
        setViewerCount(0)
        toast.info('Stream has ended')
      }
    }

    // WebRTC event listeners
    const handleWebRTCOffer = (data: {
      offer: RTCSessionDescriptionInit
      from: string
      to: string
    }) => {
      if (peerConnectionRef.current && data.from !== user?.id) {
        peerConnectionRef.current
          .setRemoteDescription(new RTCSessionDescription(data.offer))
          .then(() => {
            return peerConnectionRef.current!.createAnswer()
          })
          .then((answer) => {
            return peerConnectionRef.current!.setLocalDescription(answer)
          })
          .then(() => {
            socket.emit('webrtc:answer', {
              answer: peerConnectionRef.current!.localDescription,
              from: user?.id,
              to: data.from,
              sessionId,
            })
          })
          .catch(console.error)
      }
    }

    const handleWebRTCAnswer = (data: {
      answer: RTCSessionDescriptionInit
      from: string
      to: string
    }) => {
      if (peerConnectionRef.current && data.from !== user?.id) {
        peerConnectionRef.current
          .setRemoteDescription(new RTCSessionDescription(data.answer))
          .catch(console.error)
      }
    }

    const handleWebRTCIceCandidate = (data: {
      candidate: RTCIceCandidateInit
      from: string
      to: string
    }) => {
      if (peerConnectionRef.current && data.from !== user?.id) {
        peerConnectionRef.current
          .addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(console.error)
      }
    }

    // Unirse al room de streaming inmediatamente para escuchar eventos
    socket.emit('streaming:join', {
      sessionId,
      userId: user?.id,
    })

    socket.on('streaming:viewer_joined', handleViewerJoined)
    socket.on('streaming:viewer_left', handleViewerLeft)
    socket.on('streaming:started', handleStreamingStarted)
    socket.on('streaming:stopped', handleStreamingStopped)
    socket.on('webrtc:offer', handleWebRTCOffer)
    socket.on('webrtc:answer', handleWebRTCAnswer)
    socket.on('webrtc:ice_candidate', handleWebRTCIceCandidate)

    return () => {
      socket.off('streaming:viewer_joined', handleViewerJoined)
      socket.off('streaming:viewer_left', handleViewerLeft)
      socket.off('streaming:started', handleStreamingStarted)
      socket.off('streaming:stopped', handleStreamingStopped)
      socket.off('webrtc:offer', handleWebRTCOffer)
      socket.off('webrtc:answer', handleWebRTCAnswer)
      socket.off('webrtc:ice_candidate', handleWebRTCIceCandidate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user?.id, sessionId])

  const handleJoinStream = async () => {
    if (!user) {
      toast.error('You must be logged in to watch streams')
      return
    }

    try {
      setIsWatching(true)

      // Crear conexión WebRTC
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      })

      peerConnectionRef.current = peerConnection

      // Manejar tracks remotos
      peerConnection.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0]
          // Usar un timeout para evitar conflictos de reproducción
          setTimeout(() => {
            if (videoRef.current && videoRef.current.srcObject) {
              videoRef.current.play().catch((error) => {
                // Ignorar errores de AbortError ya que son normales durante la carga
                if (error.name !== 'AbortError') {
                  console.error('Error playing video:', error)
                }
              })
            }
          }, 100)
        }
      }

      // Manejar cambios de conexión
      peerConnection.onconnectionstatechange = () => {
        setIsConnected(peerConnection.connectionState === 'connected')
      }

      // Unirse al stream
      socket.emit('streaming:join', {
        sessionId,
        userId: user.id,
      })

      toast.success('Joined stream successfully')
    } catch (err) {
      console.error('Error joining stream:', err)
      toast.error('Failed to join stream')
      setIsWatching(false)
    }
  }

  const handleLeaveStream = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    socket.emit('streaming:leave', {
      sessionId,
      userId: user?.id,
    })

    setIsWatching(false)
    setIsConnected(false)
    toast.info('Left stream')
  }

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsAudioEnabled(!videoRef.current.muted)
    }
  }

  return (
    <div className='space-y-6'>
      <Card className='p-6 rounded-none'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-2xl font-bold'>
              {streamTitle || 'Live Stream'}
            </h2>
            {broadcasterName && (
              <p className='text-gray-600'>by {broadcasterName}</p>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            <span className='text-sm'>{viewerCount} viewers</span>
          </div>
        </div>

        {!isStreamActive ? (
          <div className='text-center space-y-4'>
            <div className='w-full h-64 bg-gray-900 rounded-none flex items-center justify-center'>
              <div className='text-center text-gray-400'>
                <Play className='w-16 h-16 mx-auto mb-4' />
                <p>No active stream for this match</p>
                <p className='text-sm mt-2'>
                  Waiting for broadcaster to start...
                </p>
              </div>
            </div>

            <div className='text-sm text-gray-500'>
              <p>
                This stream will automatically start when the broadcaster begins
                streaming.
              </p>
            </div>
          </div>
        ) : !isWatching ? (
          <div className='text-center space-y-4'>
            <div className='w-full h-64 bg-gray-900 rounded-none flex items-center justify-center'>
              <div className='text-center text-gray-400'>
                <Play className='w-16 h-16 mx-auto mb-4' />
                <p>Stream is active!</p>
                <p className='text-sm mt-2'>Click to join the stream</p>
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
                className='w-full h-64 bg-black rounded-none object-cover'
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch((error) => {
                      if (error.name !== 'AbortError') {
                        console.error('Error playing video:', error)
                      }
                    })
                  }
                }}
                onError={(e) => {
                  console.error('Video error:', e)
                }}
              />

              {/* Overlay controls */}
              <div className='absolute bottom-4 left-4 flex gap-2'>
                <Button
                  size='sm'
                  variant={isAudioEnabled ? 'default' : 'destructive'}
                  className='rounded-none'
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? (
                    <Volume2 className='w-4 h-4' />
                  ) : (
                    <VolumeX className='w-4 h-4' />
                  )}
                </Button>
              </div>

              {/* Status indicator */}
              <div className='absolute top-4 right-4'>
                <div className='flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-none text-sm'>
                  <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                  LIVE
                </div>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={handleLeaveStream}
                variant='outline'
                className='flex-1 rounded-none'
              >
                <Square className='w-4 h-4 mr-2' />
                Leave Stream
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
