'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  X,
  Users,
  Volume2,
  VolumeX,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Video,
} from 'lucide-react'

import { userAuth } from '@/lib/actions/auth.action'
import { socket } from '@/app/socket'
import { getMatchWithPlayers } from '@/lib/actions/matches.action'
import { getSessionByIdAction } from '@/lib/actions/streaming-server.action'
import { useLiveMatchSocket } from '@/hooks/useLiveMatchSocket'
import FullscreenSidebar from '@/components/members/FullscreenSidebar'

interface User {
  id: string
  name: string
  email: string
}

export default function FullscreenStreamPage() {
  const params = useParams()
  const sessionId = params?.id as string
  const [user, setUser] = useState<User | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [isJoining, setIsJoining] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [events, setEvents] = useState<
    Array<{
      id: string
      minute: number
      timestamp: number
      eventType: string
      playerId?: string
      playerName?: string
      teamName?: string
      description?: string
    }>
  >([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matchData, setMatchData] = useState<any>(null)

  // Obtener el minuto actual del partido
  const { currentMinute } = useLiveMatchSocket({
    match: matchData,
    playersTeam1: matchData?.playersTeam1 || [],
    playersTeam2: matchData?.playersTeam2 || [],
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const userData = await userAuth()
      setUser(userData)
    }
    getUser()
  }, [])

  // Cargar datos del partido
  useEffect(() => {
    const loadMatchData = async () => {
      try {
        // Obtener la sesión de streaming para obtener el matchId
        const sessionResult = await getSessionByIdAction(sessionId)
        if (!sessionResult.success || !sessionResult.data) {
          console.error('No se encontró la sesión de streaming')
          return
        }

        const matchId = sessionResult.data.matchId
        console.log('Loading match data for matchId:', matchId)

        const match = await getMatchWithPlayers(matchId)
        if (match) {
          setMatchData(match)
        }
      } catch (error) {
        console.error('Error loading match data:', error)
        // Si no se puede cargar, usar datos mock para testing
        setMatchData({
          id: 'mock-match-id',
          date: new Date(),
          team1: 'Team A',
          team2: 'Team B',
          team1Id: 'team1-id',
          team2Id: 'team2-id',
          team1Goals: 0,
          team2Goals: 0,
          team1Avatar: '/no-club.jpg',
          team2Avatar: '/no-club.jpg',
          playersTeam1: [],
          playersTeam2: [],
        })
      }
    }

    if (sessionId) {
      loadMatchData()
    }
  }, [sessionId])

  // Limpiar conexión cuando se cierre la ventana o se refresque
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('Window closing, cleaning up WebRTC connection')
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      socket.emit('streaming:leave', { sessionId, userId: user?.id })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('Page hidden, cleaning up WebRTC connection')
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close()
          peerConnectionRef.current = null
        }
        socket.emit('streaming:leave', { sessionId, userId: user?.id })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [sessionId, user?.id])

  // Manejar eventos del partido
  useEffect(() => {
    if (!matchData?.id) return

    console.log(
      'FullscreenStreamPage: Setting up match event listeners for match:',
      matchData.id
    )
    socket.emit('join:match', { matchId: matchData.id })

    const handleMatchGoal = (data: {
      matchId: string
      teamId: string
      teamName?: string
      playerId?: string
      playerName?: string
      minute?: number
    }) => {
      console.log('FullscreenStreamPage: Received goal event:', data)
      if (data.matchId === matchData.id) {
        const newEvent = {
          id: `goal-${Date.now()}`,
          minute: data.minute || currentMinute || 0,
          timestamp: Date.now(),
          eventType: 'goal',
          playerId: data.playerId,
          playerName: data.playerName,
          teamName: data.teamName || 'Unknown Team',
          description: `${data.playerName || 'Unknown player'} scored a goal`,
        }
        console.log('FullscreenStreamPage: Adding goal event:', newEvent)
        setEvents((prev) => {
          const newEvents = [newEvent, ...prev]
          console.log(
            'FullscreenStreamPage: Updated events count:',
            newEvents.length
          )
          return newEvents
        })
      }
    }

    const handleMatchAssist = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      minute?: number
    }) => {
      if (data.matchId === matchData.id) {
        const newEvent = {
          id: `assist-${Date.now()}`,
          minute: data.minute || currentMinute || 0,
          timestamp: Date.now(),
          eventType: 'assist',
          playerId: data.playerId,
          playerName: data.playerName,
          teamName: 'Unknown Team',
          description: `${data.playerName} provided an assist`,
        }
        setEvents((prev) => [newEvent, ...prev])
      }
    }

    const handleMatchGoalSaved = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      minute?: number
    }) => {
      if (data.matchId === matchData.id) {
        const newEvent = {
          id: `goal_saved-${Date.now()}`,
          minute: data.minute || currentMinute || 0,
          timestamp: Date.now(),
          eventType: 'goal_saved',
          playerId: data.playerId,
          playerName: data.playerName,
          teamName: 'Unknown Team',
          description: `${data.playerName} saved a goal`,
        }
        setEvents((prev) => [newEvent, ...prev])
      }
    }

    const handleMatchGoalAllowed = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      minute?: number
    }) => {
      if (data.matchId === matchData.id) {
        const newEvent = {
          id: `goal_allowed-${Date.now()}`,
          minute: data.minute || currentMinute || 0,
          timestamp: Date.now(),
          eventType: 'goal_allowed',
          playerId: data.playerId,
          playerName: data.playerName,
          teamName: 'Unknown Team',
          description: `${data.playerName} allowed a goal`,
        }
        setEvents((prev) => [newEvent, ...prev])
      }
    }

    const handleMatchPass = (data: {
      matchId: string
      teamId: string
      playerId: string
      playerName: string
      minute?: number
    }) => {
      if (data.matchId === matchData.id) {
        const newEvent = {
          id: `pass-${Date.now()}`,
          minute: data.minute || currentMinute || 0,
          timestamp: Date.now(),
          eventType: 'pass',
          playerId: data.playerId,
          playerName: data.playerName,
          teamName: 'Unknown Team',
          description: `${data.playerName} made a pass`,
        }
        setEvents((prev) => [newEvent, ...prev])
      }
    }

    const handleMatchHalfTime = (data: {
      matchId: string
      minute?: number
    }) => {
      if (data.matchId === matchData.id) {
        const newEvent = {
          id: `half_time-${Date.now()}`,
          minute: data.minute || currentMinute || 0,
          timestamp: Date.now(),
          eventType: 'half_time',
          description: 'Half time',
        }
        setEvents((prev) => [newEvent, ...prev])
      }
    }

    const handleMatchResume = (data: { matchId: string; minute?: number }) => {
      if (data.matchId === matchData.id) {
        const newEvent = {
          id: `resume_match-${Date.now()}`,
          minute: data.minute || currentMinute || 0,
          timestamp: Date.now(),
          eventType: 'resume_match',
          description: 'Match resumed',
        }
        setEvents((prev) => [newEvent, ...prev])
      }
    }

    socket.on('match:goal', handleMatchGoal)
    socket.on('match:assist', handleMatchAssist)
    socket.on('match:goal_saved', handleMatchGoalSaved)
    socket.on('match:goal_allowed', handleMatchGoalAllowed)
    socket.on('match:pass', handleMatchPass)
    socket.on('match:half_time', handleMatchHalfTime)
    socket.on('match:resume', handleMatchResume)

    return () => {
      console.log('FullscreenStreamPage: Cleaning up match event listeners')
      socket.emit('leave:match', { matchId: matchData.id })
      socket.off('match:goal', handleMatchGoal)
      socket.off('match:assist', handleMatchAssist)
      socket.off('match:goal_saved', handleMatchGoalSaved)
      socket.off('match:goal_allowed', handleMatchGoalAllowed)
      socket.off('match:pass', handleMatchPass)
      socket.off('match:half_time', handleMatchHalfTime)
      socket.off('match:resume', handleMatchResume)
    }
  }, [matchData?.id, currentMinute])

  // Verificar si ya está viendo el stream cuando se carga la página
  useEffect(() => {
    if (user && sessionId) {
      // Verificar si ya hay una conexión WebRTC activa
      const checkIfAlreadyWatching = () => {
        // Si hay un video con srcObject, significa que ya está viendo
        if (videoRef.current && videoRef.current.srcObject) {
          console.log('Already watching stream, setting isWatching to true')
          setIsWatching(true)
        }
      }

      // Verificar después de un pequeño delay para que el DOM esté listo
      setTimeout(checkIfAlreadyWatching, 100)
    }
  }, [user, sessionId])

  useEffect(() => {
    const handleViewerJoined = () => setViewerCount((v) => v + 1)
    const handleViewerLeft = () => setViewerCount((v) => Math.max(0, v - 1))
    const handleStreamingStopped = (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setIsWatching(false)
        setViewerCount(0)
        toast.info('Stream has ended')
      }
    }
    const handleStopByMatch = () => {
      setIsWatching(false)
      setViewerCount(0)
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      toast.info('Stream ended due to match completion')
    }
    // Unirse al room de streaming inmediatamente para escuchar eventos
    socket.emit('streaming:join', {
      sessionId,
      userId: user?.id,
    })
    const handleStreamingStarted = (data: {
      sessionId: string
      broadcasterId: string
    }) => {
      console.log('Stream started:', data)
      toast.success('Stream is now live!')
    }

    socket.on('streaming:viewer_joined', handleViewerJoined)
    socket.on('streaming:viewer_left', handleViewerLeft)
    socket.on('streaming:stopped', handleStreamingStopped)
    socket.on('streaming:stop_by_match', handleStopByMatch)
    socket.on('streaming:started', handleStreamingStarted)
    return () => {
      socket.off('streaming:viewer_joined', handleViewerJoined)
      socket.off('streaming:viewer_left', handleViewerLeft)
      socket.off('streaming:stopped', handleStreamingStopped)
      socket.off('streaming:stop_by_match', handleStopByMatch)
      socket.off('streaming:started', handleStreamingStarted)
    }
  }, [sessionId, user?.id])

  const handleJoinStream = async () => {
    if (!user) {
      toast.error('You must be logged in to watch streams')
      return
    }
    console.log(
      'Starting handleJoinStream with sessionId:',
      sessionId,
      'userId:',
      user.id
    )
    setIsJoining(true)

    // Limpiar cualquier conexión anterior
    if (peerConnectionRef.current) {
      console.log('Cleaning up previous connection')
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Limpiar el video
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Generar un ID único para esta conexión
    const connectionId = `${user.id}-${Date.now()}`
    console.log('Generated connection ID:', connectionId)
    try {
      setIsWatching(true)
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
        // Configuración para mejor calidad de video
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      })
      peerConnectionRef.current = peerConnection
      peerConnection.ontrack = (event) => {
        console.log('WebRTC track received:', event)
        console.log('Streams available:', event.streams.length)
        console.log('Track kind:', event.track.kind)

        if (videoRef.current && event.streams[0]) {
          console.log('Setting video srcObject')
          videoRef.current.srcObject = event.streams[0]

          // Configurar mejor calidad de video
          if (videoRef.current.videoWidth > 0) {
            videoRef.current.style.imageRendering = 'crisp-edges'
            videoRef.current.style.objectFit = 'cover'
          }

          setTimeout(() => {
            console.log('Attempting to play video')
            videoRef.current?.play().catch((error) => {
              console.error('Error playing video:', error)
            })
          }, 100)
        } else {
          console.log('No video element or streams available')
          console.log('Video ref exists:', !!videoRef.current)
          console.log('Streams length:', event.streams.length)
        }
      }
      // Agregar listener para cambios de estado de conexión
      peerConnection.onconnectionstatechange = () => {
        console.log(
          'WebRTC connection state changed:',
          peerConnection.connectionState
        )
        if (peerConnection.connectionState === 'connected') {
          console.log('WebRTC connection established successfully')
          setIsJoining(false)
          // Si se conecta exitosamente, no mostrar el error del timeout
          setIsWatching(true)
          // Cancelar el timeout si existe
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
        } else if (peerConnection.connectionState === 'failed') {
          console.error('WebRTC connection failed')
          setIsJoining(false)
          setIsWatching(false)
        } else if (peerConnection.connectionState === 'disconnected') {
          console.log('WebRTC connection disconnected')
          setIsWatching(false)
        }
      }

      // Agregar listener para ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState)
      }

      // Agregar listener para ICE gathering state
      peerConnection.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', peerConnection.iceGatheringState)
      }
      // WebRTC event listeners
      const handleWebRTCOffer = (data: {
        offer: RTCSessionDescriptionInit
        from: string
        to: string
        matchId?: string
      }) => {
        console.log('Received WebRTC offer from:', data.from)
        console.log('Offer data:', data.offer)
        if (peerConnectionRef.current) {
          console.log('Setting remote description...')
          peerConnectionRef.current
            .setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(() => {
              console.log('Creating answer...')
              return peerConnectionRef.current!.createAnswer()
            })
            .then((answer) => {
              console.log('Setting local description...')
              return peerConnectionRef.current!.setLocalDescription(answer)
            })
            .then(() => {
              console.log('Sending WebRTC answer to broadcaster')
              socket.emit('webrtc:answer', {
                answer: peerConnectionRef.current!.localDescription,
                from: user?.id,
                to: data.from,
                sessionId,
                matchId: data.matchId || matchData?.id,
              })
            })
            .catch((error) => {
              console.error('Error handling WebRTC offer:', error)
            })
        } else {
          console.log('No peer connection available to handle offer')
        }
      }
      const handleWebRTCAnswer = (data: {
        answer: RTCSessionDescriptionInit
        from: string
        to: string
      }) => {
        if (peerConnectionRef.current && data.from !== user?.id) {
          console.log('Handling WebRTC answer in fullscreen')
          peerConnectionRef.current
            .setRemoteDescription(new RTCSessionDescription(data.answer))
            .catch((error) => {
              console.error('Error handling WebRTC answer:', error)
            })
        }
      }
      const handleWebRTCIceCandidate = (data: {
        candidate: RTCIceCandidateInit
        from: string
        to: string
        matchId?: string
      }) => {
        console.log('Received ICE candidate from:', data.from)
        if (peerConnectionRef.current) {
          peerConnectionRef.current
            .addIceCandidate(new RTCIceCandidate(data.candidate))
            .catch((error) => {
              console.error('Error handling WebRTC ICE candidate:', error)
            })
        }
      }
      // Agregar event listeners de WebRTC
      console.log('Adding WebRTC event listeners')
      socket.on('webrtc:offer', handleWebRTCOffer)
      socket.on('webrtc:answer', handleWebRTCAnswer)
      socket.on('webrtc:ice_candidate', handleWebRTCIceCandidate)

      // Agregar listener para viewer_joined
      socket.on(
        'streaming:viewer_joined',
        (data: {
          viewerId: string
          sessionId: string
          connectionId?: string
        }) => {
          console.log('Viewer: Received streaming:viewer_joined event:', data)
        }
      )

      console.log(
        'Viewer: Emitting streaming:join with sessionId:',
        sessionId,
        'userId:',
        user.id,
        'connectionId:',
        connectionId
      )
      socket.emit('streaming:join', {
        sessionId,
        userId: user.id,
        connectionId,
      })
      toast.success('Joined stream successfully')

      // Agregar listener para verificar si hay broadcaster activo
      socket.on(
        'streaming:started',
        (data: { sessionId: string; broadcasterId: string }) => {
          console.log('Stream started event received:', data)
          toast.success('Broadcaster is now live!')
        }
      )
      // Timeout para quitar loading si no se conecta en 10 segundos
      timeoutRef.current = setTimeout(() => {
        setIsJoining(false)
        if (
          !isWatching &&
          peerConnectionRef.current?.connectionState !== 'connected'
        ) {
          toast.error('No active broadcaster found for this stream')
        }
      }, 10000)
    } catch {
      toast.error('Failed to join stream')
      setIsWatching(false)
      setIsJoining(false)
    }
  }

  const handleLeaveStream = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    // Limpiar event listeners de WebRTC
    socket.off('webrtc:offer')
    socket.off('webrtc:answer')
    socket.off('webrtc:ice_candidate')
    // Cancelar timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    socket.emit('streaming:leave', { sessionId, userId: user?.id })
    setIsWatching(false)
    setIsJoining(false)
    toast.info('Left stream')
  }

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsAudioEnabled(!videoRef.current.muted)
    }
  }

  const handleClose = () => {
    console.log('handleClose called')
    // Cerrar la conexión WebRTC si existe
    if (peerConnectionRef.current) {
      console.log('Closing WebRTC connection')
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    // Limpiar event listeners de WebRTC
    console.log('Cleaning WebRTC event listeners')
    socket.off('webrtc:offer')
    socket.off('webrtc:answer')
    socket.off('webrtc:ice_candidate')
    // Salir del stream
    console.log('Leaving stream')
    socket.emit('streaming:leave', { sessionId, userId: user?.id })
    // Limpiar el video
    if (videoRef.current) {
      console.log('Clearing video srcObject')
      videoRef.current.srcObject = null
    }
    console.log('Attempting to close window')
    window.close()
    setTimeout(() => {
      console.log('Showing manual close message')
      toast.info('Please close this tab manually')
    }, 300)
  }

  return (
    <div className='fixed inset-0 bg-black flex flex-col md:flex-row z-50'>
      {/* Video principal */}
      <div
        className={`flex-1 relative transition-all duration-300 ${
          isSidebarOpen ? 'mr-0 md:mr-0' : ''
        }`}
      >
        {/* Botones de control en la esquina superior derecha */}
        <div className='absolute top-4 right-4 flex items-center gap-2 z-50'>
          {/* Botón de audio */}
          <button
            onClick={toggleAudio}
            className='bg-gray-200/80 hover:bg-gray-300/90 rounded-full p-2 text-gray-800 shadow-lg'
            title={isAudioEnabled ? 'Mute audio' : 'Unmute audio'}
          >
            {isAudioEnabled ? (
              <Volume2 className='w-5 h-5' />
            ) : (
              <VolumeX className='w-5 h-5' />
            )}
          </button>

          {/* Botón Join/Leave */}
          {isWatching ? (
            <button
              onClick={handleLeaveStream}
              className='bg-red-500 hover:bg-red-600 rounded-full p-2 text-white shadow-lg'
              title='Leave stream'
            >
              <Square className='w-5 h-5' />
            </button>
          ) : (
            <button
              onClick={handleJoinStream}
              disabled={isJoining}
              className='bg-blue-600 hover:bg-blue-700 rounded-full p-2 text-white shadow-lg disabled:opacity-50'
              title='Join stream'
            >
              {isJoining ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <Video className='w-5 h-5' />
              )}
            </button>
          )}

          {/* Botón toggle sidebar - solo visible en móvil */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='md:hidden bg-gray-200/80 hover:bg-gray-300/90 rounded-full p-2 text-gray-800 shadow-lg'
            title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {isSidebarOpen ? (
              <ChevronRight className='w-6 h-6' />
            ) : (
              <ChevronUp className='w-6 h-6' />
            )}
          </button>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            onMouseDown={(e) => {
              console.log('Close button clicked')
              e.preventDefault()
              handleClose()
            }}
            className='bg-gray-200/80 hover:bg-gray-300/90 rounded-full p-2 text-gray-800 shadow-lg'
            title='Close fullscreen'
          >
            <X className='w-6 h-6' />
          </button>

          {/* Botón toggle sidebar - solo visible en desktop */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='hidden md:block bg-gray-200/80 hover:bg-gray-300/90 rounded-full p-2 text-gray-800 shadow-lg'
            title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {isSidebarOpen ? (
              <ChevronRight className='w-6 h-6' />
            ) : (
              <ChevronLeft className='w-6 h-6' />
            )}
          </button>
        </div>

        {/* Badge LIVE y viewers */}
        <div className='absolute top-4 left-4 flex items-center gap-2 md:gap-3 z-50'>
          <div className='flex items-center gap-1 md:gap-2 bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm'>
            <div className='w-1.5 md:w-2 h-1.5 md:h-2 bg-white rounded-full animate-pulse'></div>
            LIVE
          </div>
          <div className='hidden md:flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full'>
            <Users className='w-4 h-4 text-white' />
            <span className='text-white text-sm'>{viewerCount} viewers</span>
          </div>
        </div>

        {/* Video */}
        <div className='w-full h-full flex items-center justify-center relative'>
          <video
            ref={videoRef}
            className='w-full h-full object-cover bg-black'
            autoPlay
            playsInline
            muted
            // Configuración para mejor calidad
            style={{
              imageRendering: 'crisp-edges',
              objectFit: 'cover',
            }}
          />

          {/* Debug info - solo en móvil */}
          <div className='absolute top-4 left-4 text-white text-xs bg-black/50 px-2 py-1 rounded md:hidden z-50'>
            isWatching: {isWatching ? 'true' : 'false'}, isJoining:{' '}
            {isJoining ? 'true' : 'false'}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ${
          isSidebarOpen
            ? 'w-full md:w-80 h-1/2 md:h-full flex-shrink-0'
            : 'w-0 h-0 md:h-full flex-shrink-0'
        }`}
      >
        <div className='h-full flex flex-col'>
          {isSidebarOpen && matchData && (
            <FullscreenSidebar
              match={matchData}
              playersTeam1={matchData.playersTeam1 || []}
              playersTeam2={matchData.playersTeam2 || []}
              events={events}
            />
          )}
        </div>
      </div>
    </div>
  )
}
