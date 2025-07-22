'use client'
// @ts-expect-error Socket is not defined in the client
import { io } from 'socket.io-client'

export const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})
