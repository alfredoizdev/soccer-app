'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createStreamingSessionAction,
  endStreamingSessionAction,
} from '@/lib/actions/streaming-server.action'
import { userAuth } from '@/lib/actions/auth.action'
import { toast } from 'sonner'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  Users,
  Play,
  Square,
  AlertCircle,
} from 'lucide-react'
import { socket } from '@/app/socket'
import { useGlobalStore } from '@/lib/stores/globalStore'

interface StreamBroadcasterProps {
  matchId: string
  matchTitle?: string
}

export default function StreamBroadcaster({
  matchId,
  matchTitle,
}: StreamBroadcasterProps) {
  console.log('StreamBroadcaster: Component loaded with matchId:', matchId)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [title, setTitle] = useState(matchTitle || '')
  const [description, setDescription] = useState('')
  const [viewerCount, setViewerCount] = useState(0)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Obtener usuario actual usando server action
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)

  // Global store para el stream
  const {
    setActiveStream,
    clearActiveStream,
    isActive: globalStreamActive,
  } = useGlobalStore()

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

  // Mostrar stream local en el video element
  useEffect(() => {
    if (videoRef.current && localStreamRef.current) {
      videoRef.current.srcObject = localStreamRef.current
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStreamRef.current])

  const stopStream = useCallback(() => {
    console.log('stopStream called - stopping all tracks and connections')

    // Detener tracks locales
    if (localStreamRef.current) {
      console.log('Stopping local stream tracks')
      localStreamRef.current.getTracks().forEach((track) => {
        console.log('Stopping track:', track.kind)
        track.stop()
      })
      localStreamRef.current = null
    }

    // Limpiar video element
    if (videoRef.current) {
      console.log('Clearing video element')
      videoRef.current.srcObject = null
    }

    // Cerrar conexión WebRTC
    if (peerConnectionRef.current) {
      console.log('Closing WebRTC connection')
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Detener broadcasting
    if (sessionId) {
      console.log('Emitting streaming:stop to server')
      socket.emit('streaming:stop', {
        sessionId,
        userId: user?.id,
      })
    }

    setIsConnected(false)
    console.log('Stream stopped completely')
  }, [sessionId, user?.id])

  const handleStopStream = useCallback(async () => {
    console.log('handleStopStream called')
    try {
      setIsLoading(true)
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

      // Limpiar store global
      clearActiveStream()

      toast.success('Stream stopped successfully')
    } catch (err) {
      console.error('Error stopping stream:', err)
      toast.error('Failed to stop stream')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, clearActiveStream, stopStream])

  // Unirse al room del match para escuchar eventos de finalización
  useEffect(() => {
    socket.emit('join:match', { matchId })

    return () => {
      socket.emit('leave:match', { matchId })
    }
  }, [matchId])

  // Escuchar cambios en el número de espectadores
  useEffect(() => {
    const handleViewerJoined = () => {
      console.log('Broadcaster: Received viewer_joined event')
      console.log('Viewer joined, creating WebRTC offer')
      setViewerCount((prev) => prev + 1)

      // Enviar oferta WebRTC al nuevo viewer
      if (peerConnectionRef.current && localStreamRef.current) {
        console.log('Creating WebRTC offer for new viewer')
        peerConnectionRef.current
          .createOffer()
          .then((offer) => {
            console.log('Offer created, setting local description')
            return peerConnectionRef.current!.setLocalDescription(offer)
          })
          .then(() => {
            console.log('Sending WebRTC offer to viewer')
            socket.emit('webrtc:offer', {
              offer: peerConnectionRef.current!.localDescription,
              from: user?.id,
              to: 'viewer',
              sessionId,
              matchId,
            })
          })
          .catch((error) => {
            console.error('Error creating WebRTC offer:', error)
          })
      } else {
        console.log(
          'Cannot create offer - peer connection or local stream not available'
        )
        console.log('Peer connection exists:', !!peerConnectionRef.current)
        console.log('Local stream exists:', !!localStreamRef.current)
      }
    }

    const handleViewerLeft = () => {
      console.log('Broadcaster: Received streaming:viewer_left event')
      setViewerCount((prev) => Math.max(0, prev - 1))
    }

    const handleStopByMatch = (data: { matchId: string }) => {
      console.log('Received streaming:stop_by_match event:', data)
      console.log(
        'Current matchId:',
        matchId,
        'isStreaming:',
        isStreaming,
        'sessionId:',
        sessionId
      )
      console.log('Match IDs match?', data.matchId === matchId)

      if (data.matchId === matchId && isStreaming && sessionId) {
        console.log('Stopping stream due to external stop event')
        handleStopStream()
      } else {
        console.log('Not stopping stream - conditions not met')
        console.log('Match ID match:', data.matchId === matchId)
        console.log('Is streaming:', isStreaming)
        console.log('Has sessionId:', !!sessionId)
      }
    }

    const handleStreamingStopped = (data: { sessionId: string }) => {
      console.log('Received streaming:stopped event:', data)
      if (data.sessionId === sessionId && isStreaming) {
        console.log('Stopping stream due to external stop event')
        handleStopStream()
      }
    }

    // WebRTC event listeners
    const handleWebRTCAnswer = (data: {
      answer: RTCSessionDescriptionInit
      from: string
      to: string
      matchId?: string
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
      matchId?: string
    }) => {
      if (peerConnectionRef.current && data.from !== user?.id) {
        peerConnectionRef.current
          .addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(console.error)
      }
    }

    socket.on('streaming:viewer_joined', handleViewerJoined)
    socket.on('streaming:viewer_left', handleViewerLeft)
    socket.on('streaming:stop_by_match', handleStopByMatch)
    socket.on('streaming:stopped', handleStreamingStopped)
    socket.on('webrtc:answer', handleWebRTCAnswer)
    socket.on('webrtc:ice_candidate', handleWebRTCIceCandidate)

    return () => {
      socket.off('streaming:viewer_joined', handleViewerJoined)
      socket.off('streaming:viewer_left', handleViewerLeft)
      socket.off('streaming:stop_by_match', handleStopByMatch)
      socket.off('streaming:stopped', handleStreamingStopped)
      socket.off('webrtc:answer', handleWebRTCAnswer)
      socket.off('webrtc:ice_candidate', handleWebRTCIceCandidate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, matchId, isStreaming, sessionId, user?.id, handleStopStream])

  // Cleanup effect para detener el stream cuando el componente se desmonte
  useEffect(() => {
    // Capturar las referencias actuales para usar en el cleanup
    const currentLocalStream = localStreamRef.current
    const currentVideoRef = videoRef.current
    const currentPeerConnection = peerConnectionRef.current

    return () => {
      // Solo detener el stream si el usuario está navegando FUERA del admin
      // No detener si está navegando dentro del admin (matches, players, etc.)
      const isNavigatingWithinAdmin =
        window.location.pathname.startsWith('/admin')

      if (isStreaming && sessionId && !isNavigatingWithinAdmin) {
        console.log(
          'Cleaning up stream on component unmount - navigating outside admin'
        )

        // Detener transmisión WebRTC
        if (currentLocalStream) {
          currentLocalStream.getTracks().forEach((track) => track.stop())
          localStreamRef.current = null
        }

        // Limpiar video element
        if (currentVideoRef) {
          currentVideoRef.srcObject = null
        }

        // Cerrar conexión WebRTC
        if (currentPeerConnection) {
          currentPeerConnection.close()
          peerConnectionRef.current = null
        }

        // Detener broadcasting en el socket
        if (sessionId) {
          socket.emit('streaming:stop', {
            sessionId,
            userId: user?.id,
          })
        }

        // Finalizar sesión de streaming en la base de datos
        if (sessionId) {
          const formData = new FormData()
          formData.append('sessionId', sessionId)
          endStreamingSessionAction(formData).catch((error) => {
            console.error('Error ending streaming session on cleanup:', error)
          })
        }
      } else if (isStreaming && sessionId && isNavigatingWithinAdmin) {
        console.log('Stream continues running - navigating within admin area')
      }
    }
  }, [isStreaming, sessionId, user?.id])

  // Manejar beforeunload para cuando el usuario cierre la pestaña o navegue fuera
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isStreaming && sessionId) {
        console.log('Cleaning up stream on page unload')

        // Detener transmisión WebRTC
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop())
        }

        // Limpiar video element
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }

        // Cerrar conexión WebRTC
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close()
        }

        // Detener broadcasting en el socket
        if (sessionId) {
          socket.emit('streaming:stop', {
            sessionId,
            userId: user?.id,
          })
        }

        // Mostrar mensaje de confirmación (opcional)
        event.preventDefault()
        return 'You have an active stream. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isStreaming, sessionId, user?.id])

  const handleStartStream = async () => {
    console.log('handleStartStream: Button clicked')
    if (!user) {
      toast.error('You must be logged in to start streaming')
      return
    }

    if (!title.trim()) {
      toast.error('Please enter a stream title')
      return
    }

    try {
      setIsLoading(true)
      console.log('handleStartStream: Creating streaming session...')
      // Crear sesión de streaming usando server action
      const formData = new FormData()
      formData.append('matchId', matchId)
      formData.append('broadcasterId', user.id)
      formData.append('title', title.trim())
      formData.append('description', description.trim())

      const result = await createStreamingSessionAction(formData)
      console.log('handleStartStream: Session creation result:', result)

      if (result.success && 'data' in result && result.data) {
        const newSessionId = result.data.id
        console.log('handleStartStream: New sessionId:', newSessionId)
        setSessionId(newSessionId)

        // Iniciar transmisión WebRTC
        console.log('handleStartStream: Starting WebRTC stream...')
        await startStream(newSessionId)
        setIsStreaming(true)

        // Actualizar store global
        setActiveStream({
          sessionId: newSessionId,
          matchId,
          matchTitle: title.trim(),
        })

        toast.success('Stream started successfully')
      } else {
        toast.error('Failed to create streaming session')
      }
    } catch (err) {
      console.error('Error starting stream:', err)
      toast.error('Failed to start stream')
    } finally {
      setIsLoading(false)
    }
  }

  const startStream = async (sessionId: string) => {
    try {
      // Obtener acceso a cámara y micrófono con mejor calidad
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 24 },
          aspectRatio: { ideal: 16 / 9 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      localStreamRef.current = stream

      // Crear conexión WebRTC con mejor configuración
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
        // Configuración para mejor calidad
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      })

      peerConnectionRef.current = peerConnection

      // Agregar tracks locales con mejor configuración
      stream.getTracks().forEach((track) => {
        if (track.kind === 'video') {
          // Configurar mejor calidad para video
          const videoTrack = track as MediaStreamTrack
          const capabilities = videoTrack.getCapabilities()
          if (capabilities && capabilities.width && capabilities.height) {
            videoTrack
              .applyConstraints({
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 },
                frameRate: { ideal: 30, min: 24 },
              })
              .catch(console.error)
          }
        }
        peerConnection.addTrack(track, stream)
      })

      // Manejar cambios de conexión
      peerConnection.onconnectionstatechange = () => {
        setIsConnected(peerConnection.connectionState === 'connected')
      }

      // Manejar ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc:ice_candidate', {
            candidate: event.candidate,
            from: user?.id,
            to: 'viewer',
            sessionId,
            matchId,
          })
        }
      }

      // Iniciar broadcasting
      socket.emit('streaming:start', {
        sessionId,
        userId: user?.id,
      })

      // Unirse a la sala de streaming para recibir eventos de viewers
      socket.emit('streaming:join', {
        sessionId,
        userId: user?.id,
      })
      console.log('Broadcaster: Started stream with sessionId:', sessionId)
      console.log(
        'Broadcaster: Joined streaming room:',
        `streaming:${sessionId}`
      )
    } catch (err) {
      console.error('Error starting stream:', err)
      throw err
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  return (
    <div className='space-y-6 w-full'>
      <Card className='p-6 w-full'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Live Stream</h2>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Users className='w-5 h-5' />
              <span className='text-sm font-medium'>{viewerCount} viewers</span>
            </div>
            {globalStreamActive && (
              <div className='flex items-center gap-2 text-green-500'>
                <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                <span className='text-sm font-medium'>Active</span>
              </div>
            )}
          </div>
        </div>

        {!isStreaming ? (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='title' className='text-sm font-medium'>
                  Stream Title
                </Label>
                <Input
                  id='title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Enter stream title'
                  className='mt-2'
                />
              </div>

              <div>
                <Label htmlFor='description' className='text-sm font-medium'>
                  Description
                </Label>
                <textarea
                  id='description'
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  placeholder='Enter stream description'
                  className='mt-2 w-full p-3 border border-gray-300 rounded-md resize-none'
                  rows={3}
                />
              </div>
            </div>

            <div className='flex items-center gap-4 p-4 bg-blue-50 rounded-lg'>
              <AlertCircle className='w-5 h-5 text-blue-500' />
              <div className='text-sm text-blue-700'>
                <p className='font-medium'>Stream Setup</p>
                <p>
                  Make sure your camera and microphone are ready before starting
                  the stream.
                </p>
              </div>
            </div>

            <Button
              onClick={handleStartStream}
              className='w-full h-12 text-lg font-medium'
              disabled={!user || isLoading}
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Starting Stream...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Play className='w-5 h-5' />
                  Start Stream
                </div>
              )}
            </Button>
            {!user && (
              <p className='text-sm text-gray-500 text-center'>
                Loading user data...
              </p>
            )}
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='relative w-full'>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className='w-full h-96 md:h-[500px] lg:h-[600px] bg-black rounded-lg object-cover'
              />

              {/* Overlay controls */}
              <div className='absolute bottom-4 left-4 flex gap-2'>
                <Button
                  size='sm'
                  variant={isAudioEnabled ? 'default' : 'destructive'}
                  onClick={toggleAudio}
                  className='bg-black/50 hover:bg-black/70 text-white border-0'
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
                  className='bg-black/50 hover:bg-black/70 text-white border-0'
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
                <div className='flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
                  <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                  LIVE
                </div>
              </div>
            </div>

            <div className='flex gap-4'>
              <Button
                onClick={handleStopStream}
                variant='destructive'
                className='flex-1 h-12 text-lg font-medium'
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Stopping...
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <Square className='w-5 h-5' />
                    Stop Stream
                  </div>
                )}
              </Button>

              <Button variant='outline' size='sm' className='h-12'>
                <Settings className='w-4 h-4' />
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='font-medium'>Status</p>
                <p className='text-gray-600'>
                  {isConnected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='font-medium'>Session ID</p>
                <p className='text-gray-600 font-mono text-xs'>{sessionId}</p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='font-medium'>Viewers</p>
                <p className='text-gray-600'>{viewerCount} watching</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
