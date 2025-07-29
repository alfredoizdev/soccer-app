'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getActiveSessionByMatchIdAction } from '@/lib/actions/streaming-server.action'
import { userAuth } from '@/lib/actions/auth.action'
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
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

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

  // Buscar sesión activa para este match
  useEffect(() => {
    const checkActiveStream = async () => {
      try {
        const result = await getActiveSessionByMatchIdAction(matchId)
        if (result.success && result.data) {
          setSessionId(result.data.id)
        } else {
          setSessionId(null)
        }
      } catch (error) {
        console.error('Error checking active streams:', error)
        setSessionId(null)
      }
    }

    checkActiveStream()
    // Verificar cada 30 segundos
    const interval = setInterval(checkActiveStream, 30000)
    return () => clearInterval(interval)
  }, [matchId])

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
      toast.info('Stream has ended')
    }

    // WebRTC event listeners
    const handleWebRTCOffer = (data: {
      offer: RTCSessionDescriptionInit
      from: string
      to: string
    }) => {
      console.log('Received WebRTC offer:', data)
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
      console.log('Received WebRTC answer:', data)
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
      console.log('Received ICE candidate:', data)
      if (peerConnectionRef.current && data.from !== user?.id) {
        peerConnectionRef.current
          .addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(console.error)
      }
    }

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
  }, [socket, user?.id, sessionId])

  const handleJoinStream = async () => {
    if (!user || !sessionId) {
      toast.error('You must be logged in to watch streams')
      return
    }

    try {
      setIsWatching(true)

      console.log('Starting WebRTC connection...')

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
        console.log('Received remote track:', event.streams[0])
        if (videoRef.current && event.streams[0]) {
          console.log('Setting video srcObject...')
          videoRef.current.srcObject = event.streams[0]
          videoRef.current.play().catch(console.error)
        }
      }

      // Manejar cambios de conexión
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState)
        setIsConnected(peerConnection.connectionState === 'connected')
      }

      // Manejar ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate...')
          socket.emit('webrtc:ice_candidate', {
            candidate: event.candidate,
            from: user.id,
            to: 'broadcaster',
            sessionId,
          })
        }
      }

      // Unirse al stream
      console.log('Joining stream with sessionId:', sessionId)
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

  // Si no hay sesión activa, mostrar mensaje
  if (!sessionId) {
    return (
      <Card className='p-6 rounded-none'>
        <div className='text-center space-y-4'>
          <div className='w-full h-64 bg-gray-900 rounded-none flex items-center justify-center'>
            <div className='text-center text-gray-400'>
              <Play className='w-16 h-16 mx-auto mb-4' />
              <p>No active stream for this match</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className='p-6 rounded-none'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='text-xl font-bold'>
            Live Stream - {matchTitle || 'Match'}
          </h2>
          <p className='text-sm text-gray-600'>
            Session: {sessionId.slice(0, 8)}...
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Users className='w-4 h-4' />
          <span className='text-sm'>{viewerCount} viewers</span>
        </div>
      </div>

      {!isWatching ? (
        <div className='text-center space-y-4'>
          <div className='w-full h-64 bg-gray-900 rounded-none flex items-center justify-center'>
            <div className='text-center text-gray-400'>
              <Play className='w-16 h-16 mx-auto mb-4' />
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
              className='w-full h-64 bg-black rounded-none object-cover'
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
  )
}
