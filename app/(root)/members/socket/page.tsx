'use client'

import { useEffect, useState } from 'react'
import { socket } from '@/app/socket'

export default function SocketPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')

  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      setIsConnected(true)
      setTransport(socket.io.engine.transport.name)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.io.engine.on('upgrade', (transport: any) => {
        setTransport(transport.name)
      })
    }

    function onDisconnect() {
      setIsConnected(false)
      setTransport('N/A')
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('match:start', (data: any) => {
      console.log('🎬 match:start received:', data)
    })

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('match:start')
    }
  }, [])

  return (
    <div>
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Transport: {transport}</p>
    </div>
  )
}
