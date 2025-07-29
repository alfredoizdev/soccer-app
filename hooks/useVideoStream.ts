import { useState, useRef, useEffect } from 'react'
import { socket } from '@/app/socket'
import { toast } from 'sonner'

interface UseVideoStreamProps {
  sessionId: string
  user: { id: string; name: string; email: string } | null
}

export function useVideoStream({ sessionId, user }: UseVideoStreamProps) {
  const [isWatching, setIsWatching] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

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

      // Manejar ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc:ice_candidate', {
            candidate: event.candidate,
            from: user.id,
            to: 'broadcaster',
            sessionId,
          })
        }
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
      const audioTracks = (
        videoRef.current.srcObject as MediaStream
      )?.getAudioTracks()
      if (audioTracks) {
        audioTracks.forEach((track) => {
          track.enabled = !track.enabled
        })
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  const toggleVideo = () => {
    if (videoRef.current) {
      const videoTracks = (
        videoRef.current.srcObject as MediaStream
      )?.getVideoTracks()
      if (videoTracks) {
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled
        })
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  return {
    isWatching,
    isConnected,
    viewerCount,
    isAudioEnabled,
    isVideoEnabled,
    videoRef,
    handleJoinStream,
    handleLeaveStream,
    toggleAudio,
    toggleVideo,
  }
}
