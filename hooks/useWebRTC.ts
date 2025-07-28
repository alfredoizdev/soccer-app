import { useEffect, useRef, useState, useCallback } from 'react'
import { socket } from '@/app/socket'

interface WebRTCConfig {
  sessionId: string
  userId: string
  isBroadcaster?: boolean
}

interface WebRTCHookReturn {
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  isConnected: boolean
  startStream: (customSessionId?: string) => Promise<void>
  stopStream: () => void
  joinStream: () => Promise<void>
  leaveStream: () => void
  error: string | null
}

export function useWebRTC({
  sessionId,
  userId,
  isBroadcaster = false,
}: WebRTCConfig): WebRTCHookReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  )
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)

  // Debug logging para inicialización
  console.log('useWebRTC initialized with:', {
    sessionId,
    userId,
    isBroadcaster,
    hasSessionId: !!sessionId,
    sessionIdLength: sessionId?.length || 0,
  })

  // Configuración de WebRTC
  const createPeerConnection = useCallback(
    (peerId: string) => {
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      }

      const peerConnection = new RTCPeerConnection(configuration)
      peerConnections.current.set(peerId, peerConnection)

      // Manejar candidatos ICE
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc:ice_candidate', {
            sessionId,
            candidate: event.candidate,
            from: userId,
            to: peerId,
          })
        }
      }

      // Manejar cambios de conexión
      peerConnection.onconnectionstatechange = () => {
        console.log(
          `Connection state for ${peerId}:`,
          peerConnection.connectionState
        )
      }

      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          `ICE connection state for ${peerId}:`,
          peerConnection.iceConnectionState
        )
      }

      peerConnection.onsignalingstatechange = () => {
        console.log(
          `Signaling state for ${peerId}:`,
          peerConnection.signalingState
        )
      }

      // Manejar streams remotos
      peerConnection.ontrack = (event) => {
        console.log(`Received track from ${peerId}:`, event.streams[0])
        setRemoteStreams((prev) => {
          const newMap = new Map(prev)
          newMap.set(peerId, event.streams[0])
          return newMap
        })
      }

      return peerConnection
    },
    [sessionId, userId]
  )

  // Iniciar transmisión (broadcaster)
  const startStream = useCallback(
    async (customSessionId?: string) => {
      try {
        setError(null)

        // Usar el sessionId personalizado o el del estado
        const currentSessionId = customSessionId || sessionId

        // Obtener acceso a la cámara y micrófono
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        setLocalStream(stream)
        localStreamRef.current = stream

        // Unirse a la sala de streaming
        socket.emit('streaming:start', {
          sessionId: currentSessionId,
          broadcasterId: userId,
        })

        setIsConnected(true)
      } catch (err) {
        setError('Failed to access camera and microphone')
        console.error('Error starting stream:', err)
      }
    },
    [sessionId, userId, socket]
  )

  // Detener transmisión
  const stopStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
      localStreamRef.current = null
    }

    // Cerrar todas las conexiones peer
    peerConnections.current.forEach((connection) => {
      connection.close()
    })
    peerConnections.current.clear()

    // Salir de la sala
    socket.emit('streaming:stop', { sessionId })

    setRemoteStreams(new Map())
    setIsConnected(false)
  }, [sessionId])

  // Unirse como espectador
  const joinStream = useCallback(async () => {
    try {
      setError(null)
      console.log(
        'Joining stream with sessionId:',
        sessionId,
        'userId:',
        userId
      )

      // Unirse a la sala de streaming
      socket.emit('streaming:join', {
        sessionId,
        viewerId: userId,
      })

      // Solicitar el stream inmediatamente
      socket.emit('streaming:request_stream', {
        sessionId,
        viewerId: userId,
        broadcasterId: 'any', // El servidor encontrará el broadcaster activo
      })

      console.log('Stream join requests sent')
      setIsConnected(true)
    } catch (err) {
      setError('Failed to join stream')
      console.error('Error joining stream:', err)
    }
  }, [sessionId, userId])

  // Salir como espectador
  const leaveStream = useCallback(() => {
    // Cerrar todas las conexiones peer
    peerConnections.current.forEach((connection) => {
      connection.close()
    })
    peerConnections.current.clear()

    // Salir de la sala
    socket.emit('streaming:leave', {
      sessionId,
      viewerId: userId,
    })

    setRemoteStreams(new Map())
    setIsConnected(false)
  }, [sessionId, userId])

  // Manejar eventos de Socket.IO
  useEffect(() => {
    const handleStreamingStarted = (data: {
      sessionId: string
      broadcasterId: string
    }) => {
      if (data.sessionId === sessionId && !isBroadcaster) {
        // Si soy viewer y el stream ya empezó, solicitar el stream
        socket.emit('streaming:request_stream', {
          sessionId,
          viewerId: userId,
          broadcasterId: data.broadcasterId,
        })
      }
    }

    const handleStreamingViewerJoined = async (data: {
      viewerId: string
      sessionId: string
    }) => {
      if (
        data.sessionId === sessionId &&
        isBroadcaster &&
        localStreamRef.current
      ) {
        const peerConnection = createPeerConnection(data.viewerId)

        // Agregar stream local a la conexión
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current!)
        })

        // Crear y enviar oferta
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)

        socket.emit('webrtc:offer', {
          sessionId,
          offer,
          from: userId,
          to: data.viewerId,
        })
      }
    }

    const handleOffer = async (data: {
      offer: RTCSessionDescriptionInit
      from: string
      to: string
    }) => {
      if (data.to !== userId) return

      try {
        const peerConnection = createPeerConnection(data.from)

        // Si es espectador, obtener stream local para responder
        if (!isBroadcaster) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            })
            setLocalStream(stream)
            localStreamRef.current = stream
          } catch {
            console.warn('Could not access microphone for audio')
          }
        }

        // Verificar que la conexión esté en estado correcto
        if (peerConnection.signalingState === 'stable') {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          )

          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)

          socket.emit('webrtc:answer', {
            sessionId,
            answer,
            from: userId,
            to: data.from,
          })
        } else {
          console.warn(
            'Cannot handle offer in current state:',
            peerConnection.signalingState
          )
        }
      } catch (error) {
        console.error('Error handling offer:', error)
      }
    }

    const handleAnswer = async (data: {
      answer: RTCSessionDescriptionInit
      from: string
      to: string
    }) => {
      if (data.to !== userId) return

      const peerConnection = peerConnections.current.get(data.from)
      if (peerConnection) {
        try {
          // Verificar el estado de la conexión antes de establecer remote description
          if (peerConnection.signalingState === 'have-local-offer') {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            )
          } else {
            console.warn(
              'Cannot set remote description in current state:',
              peerConnection.signalingState
            )
          }
        } catch (error) {
          console.error('Error setting remote description:', error)
        }
      }
    }

    const handleIceCandidate = async (data: {
      candidate: RTCIceCandidateInit
      from: string
      to: string
    }) => {
      if (data.to !== userId) return

      const peerConnection = peerConnections.current.get(data.from)
      if (peerConnection && peerConnection.remoteDescription) {
        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          )
        } catch (error) {
          console.warn('Failed to add ICE candidate:', error)
        }
      }
    }

    const handleStreamingStopped = (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setRemoteStreams(new Map())
        setIsConnected(false)
      }
    }

    // Escuchar eventos
    socket.on('streaming:viewer_joined', handleStreamingViewerJoined)
    socket.on('streaming:started', handleStreamingStarted)
    socket.on('webrtc:offer', handleOffer)
    socket.on('webrtc:answer', handleAnswer)
    socket.on('webrtc:ice_candidate', handleIceCandidate)
    socket.on('streaming:stopped', handleStreamingStopped)

    return () => {
      socket.off('streaming:viewer_joined', handleStreamingViewerJoined)
      socket.off('streaming:started', handleStreamingStarted)
      socket.off('webrtc:offer', handleOffer)
      socket.off('webrtc:answer', handleAnswer)
      socket.off('webrtc:ice_candidate', handleIceCandidate)
      socket.off('streaming:stopped', handleStreamingStopped)
    }
  }, [sessionId, userId, isBroadcaster, createPeerConnection])

  // Cleanup cuando cambia sessionId
  useEffect(() => {
    // Limpiar conexiones existentes cuando cambia el sessionId
    if (sessionId) {
      console.log('Session ID changed, cleaning up existing connections')
      peerConnections.current.forEach((connection) => {
        connection.close()
      })
      peerConnections.current.clear()
      setRemoteStreams(new Map())
      setIsConnected(false)
    }
  }, [sessionId])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopStream()
      leaveStream()
    }
  }, [stopStream, leaveStream])

  return {
    localStream,
    remoteStreams,
    isConnected,
    startStream,
    stopStream,
    joinStream,
    leaveStream,
    error,
  }
}
