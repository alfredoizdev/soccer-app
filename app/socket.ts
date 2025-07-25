'use client'
// @ts-expect-error Socket is not defined in the client
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000'

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
})
