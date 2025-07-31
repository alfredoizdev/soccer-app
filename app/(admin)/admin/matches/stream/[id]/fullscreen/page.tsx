'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { X, Video, Play, Square, Mic, MicOff, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { userAuth } from '@/lib/actions/auth.action'
import { getMatchWithPlayers } from '@/lib/actions/matches.action'
import {
  createStreamingSessionAction,
  endStreamingSessionAction,
} from '@/lib/actions/streaming-server.action'
import { socket } from '@/app/socket'

interface User {
  id: string
  name: string
  email: string
}

interface MatchData {
  id: string
  team1: string
  team2: string
  team1Avatar?: string
  team2Avatar?: string
}

export default function FullscreenStreamPage() {
  console.log('FullscreenStreamPage: Component loaded')
  const params = useParams()
  const matchId = params?.id as string
  console.log('FullscreenStreamPage: matchId:', matchId)

  const [user, setUser] = useState<User | null>(null)
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const userData = await userAuth()
      setUser(userData)
    }
    getUser()
  }, [])

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        const match = await getMatchWithPlayers(matchId)
        if (match) {
          setMatchData(match)
          setStreamTitle(`${match.team1} vs ${match.team2}`)
          setStreamDescription('Live soccer match streaming')
        }
      } catch (error) {
        console.error('Error loading match data:', error)
        toast.error('Error loading match data')
      }
    }
    loadMatchData()
  }, [matchId])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment', // Usar cámara trasera si está disponible
        },
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        toast.success('Camera started')
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Could not access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        toast(audioTrack.enabled ? 'Audio enabled' : 'Audio disabled')
      }
    }
  }

  const handleStartStream = async () => {
    console.log('FullscreenStreamPage: handleStartStream called')
    console.log('User:', user)
    console.log('MatchData:', matchData)
    console.log('StreamRef:', !!streamRef.current)

    if (!user || !matchData || !streamRef.current) {
      console.log('FullscreenStreamPage: Missing required data for streaming')
      toast.error('Camera not active or user data not available')
      return
    }

    setIsLoading(true)
    try {
      console.log('FullscreenStreamPage: Creating streaming session...')
      const formData = new FormData()
      formData.append('matchId', matchId)
      formData.append('broadcasterId', user.id)
      formData.append('title', streamTitle)
      formData.append('description', streamDescription)

      const result = await createStreamingSessionAction(formData)
      console.log('FullscreenStreamPage: Session creation result:', result)

      if (result.success && result.data) {
        console.log(
          'FullscreenStreamPage: Session created successfully, sessionId:',
          result.data.id
        )
        setSessionId(result.data.id)
        setIsStreaming(true)
        toast.success('🎥 Live stream started!')

        // Iniciar WebRTC para transmitir
        console.log('FullscreenStreamPage: Starting WebRTC stream...')
        await startWebRTCStream(result.data.id)

        // Emitir evento de streaming iniciado
        console.log('FullscreenStreamPage: Emitting streaming:start event')
        socket?.emit('streaming:start', {
          sessionId: result.data.id,
          userId: user.id,
        })

        // Unirse a la sala de streaming para recibir eventos de viewers
        console.log('FullscreenStreamPage: Joining streaming room')
        socket?.emit('streaming:join', {
          sessionId: result.data.id,
          userId: user.id,
        })

        // Agregar event listener para cuando un viewer se une
        socket?.on(
          'streaming:viewer_joined',
          (data: {
            viewerId: string
            sessionId: string
            connectionId?: string
          }) => {
            console.log('FullscreenStreamPage: Viewer joined:', data)
            console.log(
              'FullscreenStreamPage: Creating WebRTC offer for new viewer'
            )

            if (peerConnectionRef.current && streamRef.current) {
              peerConnectionRef.current
                .createOffer()
                .then((offer) => {
                  console.log(
                    'FullscreenStreamPage: Offer created, setting local description'
                  )
                  return peerConnectionRef.current!.setLocalDescription(offer)
                })
                .then(() => {
                  console.log(
                    'FullscreenStreamPage: Sending WebRTC offer to viewer'
                  )
                  socket?.emit('webrtc:offer', {
                    offer: peerConnectionRef.current!.localDescription,
                    from: user?.id,
                    to: 'viewer',
                    sessionId: result.data.id,
                    matchId,
                  })
                })
                .catch((error) => {
                  console.error(
                    'FullscreenStreamPage: Error creating WebRTC offer:',
                    error
                  )
                })
            } else {
              console.log(
                'FullscreenStreamPage: Cannot create offer - peer connection or stream not available'
              )
              console.log(
                'Peer connection exists:',
                !!peerConnectionRef.current
              )
              console.log('Stream exists:', !!streamRef.current)
            }
          }
        )
      } else {
        console.log('FullscreenStreamPage: Failed to create session')
        toast.error('Failed to start stream')
      }
    } catch (error) {
      console.error('FullscreenStreamPage: Error starting stream:', error)
      toast.error('Error starting stream')
    } finally {
      setIsLoading(false)
    }
  }

  const startWebRTCStream = async (sessionId: string) => {
    if (!streamRef.current) return

    try {
      console.log('FullscreenStreamPage: Creating WebRTC peer connection')
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      })

      // Agregar tracks del stream
      streamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, streamRef.current!)
      })

      peerConnectionRef.current = peerConnection

      // Agregar event listeners para WebRTC
      console.log('FullscreenStreamPage: Adding WebRTC event listeners')

      // Manejar ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('FullscreenStreamPage: Sending ICE candidate')
          socket?.emit('webrtc:ice_candidate', {
            candidate: event.candidate,
            from: user?.id,
            to: 'viewer',
            sessionId,
            matchId,
          })
        }
      }

      // Manejar cambios de conexión
      peerConnection.onconnectionstatechange = () => {
        console.log(
          'FullscreenStreamPage: Connection state changed:',
          peerConnection.connectionState
        )
      }

      // Manejar respuestas WebRTC
      socket?.on(
        'webrtc:answer',
        (data: {
          answer: RTCSessionDescriptionInit
          from: string
          to: string
          matchId?: string
        }) => {
          console.log('FullscreenStreamPage: Received WebRTC answer')
          if (peerConnectionRef.current && data.from !== user?.id) {
            peerConnectionRef.current
              .setRemoteDescription(new RTCSessionDescription(data.answer))
              .catch(console.error)
          }
        }
      )

      // Manejar ICE candidates del viewer
      socket?.on(
        'webrtc:ice_candidate',
        (data: {
          candidate: RTCIceCandidateInit
          from: string
          to: string
          matchId?: string
        }) => {
          console.log(
            'FullscreenStreamPage: Received ICE candidate from viewer'
          )
          if (peerConnectionRef.current && data.from !== user?.id) {
            peerConnectionRef.current
              .addIceCandidate(new RTCIceCandidate(data.candidate))
              .catch(console.error)
          }
        }
      )

      console.log('FullscreenStreamPage: WebRTC setup complete')
    } catch (error) {
      console.error(
        'FullscreenStreamPage: Error starting WebRTC stream:',
        error
      )
      toast.error('Failed to establish WebRTC connection')
    }
  }

  const handleStopStream = async () => {
    if (!sessionId) {
      toast.error('No active stream session')
      return
    }

    setIsLoading(true)
    try {
      // Cerrar WebRTC
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }

      const formData = new FormData()
      formData.append('sessionId', sessionId)

      const result = await endStreamingSessionAction(formData)

      if (result.success) {
        setIsStreaming(false)
        setSessionId(null)
        toast.success('⏹️ Stream ended')

        // Emitir evento de streaming detenido
        socket?.emit('streaming-stopped', { sessionId })
      } else {
        toast.error('Failed to end stream')
      }
    } catch (error) {
      console.error('Error ending stream:', error)
      toast.error('Error ending stream')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isStreaming) {
      toast.error('Please stop the stream before closing')
      return
    }
    stopCamera()
    window.close()
  }

  useEffect(() => {
    // Iniciar cámara automáticamente al cargar la página
    startCamera()

    return () => {
      stopCamera()
    }
  }, [])

  if (!matchData) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-white text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p>Loading match data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 bg-black'>
      {/* Video Preview */}
      <div className='relative w-full h-full'>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className='w-full h-full object-cover'
        />

        {/* Overlay con información del match */}
        <div className='absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleClose}
                className='text-white hover:bg-white/20'
              >
                <X className='w-5 h-5' />
              </Button>
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>{matchData.team1}</span>
                <span className='text-gray-300'>VS</span>
                <span className='font-semibold'>{matchData.team2}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de cámara - más altos */}
        <div className='absolute top-20 right-4 flex flex-col gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleAudio}
            className='bg-red-400/80 text-white hover:bg-red-500/80 w-12 h-12 rounded-full'
          >
            {isAudioEnabled ? (
              <Mic className='w-5 h-5' />
            ) : (
              <MicOff className='w-5 h-5' />
            )}
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={startCamera}
            className='bg-red-400/80 text-white hover:bg-red-500/80 w-12 h-12 rounded-full'
          >
            <RotateCcw className='w-5 h-5' />
          </Button>
        </div>

        {/* Controles principales - más altos */}
        <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2'>
          <div className='flex items-center justify-center'>
            {!isStreaming ? (
              <Button
                onClick={handleStartStream}
                disabled={isLoading || !isCameraActive}
                className='h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600'
              >
                {isLoading ? (
                  <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                ) : (
                  <Play className='w-10 h-10 ml-1' />
                )}
              </Button>
            ) : (
              <Button
                onClick={handleStopStream}
                disabled={isLoading}
                className='h-20 w-20 rounded-full bg-gray-600 hover:bg-gray-700'
              >
                {isLoading ? (
                  <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                ) : (
                  <Square className='w-10 h-10' />
                )}
              </Button>
            )}
          </div>

          <div className='text-center mt-4'>
            <p className='text-sm text-gray-300'>
              {isStreaming ? 'Tap to stop streaming' : 'Tap to start streaming'}
            </p>
            {isStreaming && (
              <div className='mt-2'>
                <div className='inline-flex items-center gap-2 px-3 py-1 bg-red-500/80 rounded-full'>
                  <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                  <span className='text-xs text-white font-medium'>LIVE</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de estado de cámara */}
        {!isCameraActive && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/80'>
            <div className='text-center'>
              <Video className='w-16 h-16 mx-auto mb-4 text-gray-400' />
              <p className='text-white text-lg'>Camera not available</p>
              <p className='text-gray-400 text-sm'>
                Please check camera permissions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
