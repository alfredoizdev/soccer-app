import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    socket.on('match:start', (data) => {
      socket.join(`match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:start', data)
    })

    socket.on('match:goal', (data) => {
      socket.join(`match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:goal', data)
    })

    socket.on('match:assist', (data) => {
      socket.join(`match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:assist', data)
    })

    socket.on('match:pass', (data) => {
      socket.join(`match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:pass', data)
    })

    socket.on('match:goal_saved', (data) => {
      socket.join(`match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:goal_saved', data)
    })

    socket.on('match:goal_allowed', (data) => {
      socket.join(`match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:goal_allowed', data)
    })

    socket.on('match:player_toggle', (data) => {
      socket.join(`match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:player_toggle', data)
    })

    socket.on('match:half_time', (data) => {
      console.log('Server received match:half_time:', data)
      socket.join(`match:${data.matchId}`)
      console.log('Emitting match:half_time to room:', `match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:half_time', data)
    })

    socket.on('match:resume', (data) => {
      console.log('Server received match:resume:', data)
      socket.join(`match:${data.matchId}`)
      console.log('Emitting match:resume to room:', `match:${data.matchId}`)
      io.to(`match:${data.matchId}`).emit('match:resume', data)
    })

    socket.on('match:end', (data) => {
      io.to(`match:${data.matchId}`).emit('match:end', data)
      socket.leave(`match:${data.matchId}`)
    })

    socket.on('join:match', (data) => {
      socket.join(`match:${data.matchId}`)
    })

    socket.on('leave:match', (data) => {
      socket.leave(`match:${data.matchId}`)
    })

    // WebRTC Events
    socket.on('streaming:join', (data) => {
      console.log('User joining stream:', data)
      socket.join(`streaming:${data.sessionId}`)
      console.log('User joined room:', `streaming:${data.sessionId}`)
      console.log(
        'Emitted streaming:viewer_joined to room:',
        `streaming:${data.sessionId}`
      )
      io.to(`streaming:${data.sessionId}`).emit('streaming:viewer_joined', {
        viewerId: data.userId || data.viewerId,
        sessionId: data.sessionId,
        connectionId: data.connectionId,
      })
    })

    socket.on('streaming:leave', (data) => {
      socket.leave(`streaming:${data.sessionId}`)
      io.to(`streaming:${data.sessionId}`).emit('streaming:viewer_left', {
        viewerId: data.viewerId,
        sessionId: data.sessionId,
      })
    })

    socket.on('webrtc:offer', (data) => {
      socket.to(`streaming:${data.sessionId}`).emit('webrtc:offer', {
        offer: data.offer,
        from: data.from,
        to: data.to,
        matchId: data.matchId,
      })
    })

    socket.on('webrtc:answer', (data) => {
      socket.to(`streaming:${data.sessionId}`).emit('webrtc:answer', {
        answer: data.answer,
        from: data.from,
        to: data.to,
        matchId: data.matchId,
      })
    })

    socket.on('webrtc:ice_candidate', (data) => {
      socket.to(`streaming:${data.sessionId}`).emit('webrtc:ice_candidate', {
        candidate: data.candidate,
        from: data.from,
        to: data.to,
        matchId: data.matchId,
      })
    })

    socket.on('streaming:start', (data) => {
      console.log('Broadcaster starting stream:', data)
      socket.join(`streaming:${data.sessionId}`)
      io.to(`streaming:${data.sessionId}`).emit('streaming:started', {
        sessionId: data.sessionId,
        broadcasterId: data.broadcasterId,
      })
    })

    socket.on('streaming:stop', (data) => {
      io.to(`streaming:${data.sessionId}`).emit('streaming:stopped', {
        sessionId: data.sessionId,
      })
      socket.leave(`streaming:${data.sessionId}`)
    })

    socket.on('streaming:request_stream', (data) => {
      io.to(`streaming:${data.sessionId}`).emit('streaming:viewer_joined', {
        viewerId: data.viewerId,
        sessionId: data.sessionId,
      })
    })

    socket.on('streaming:stop_by_match', (data) => {
      console.log('Received streaming:stop_by_match event:', data)
      // Buscar todas las sesiones activas para este match y terminarlas
      io.emit('streaming:stop_by_match', {
        matchId: data.matchId,
      })
      console.log(
        'Emitted streaming:stop_by_match to all clients with matchId:',
        data.matchId
      )
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      // Limpiar todas las rooms del usuario desconectado
      socket.rooms.forEach((room) => {
        if (room.startsWith('streaming:')) {
          console.log('User left streaming room:', room)
          socket.leave(room)
          // Notificar a otros usuarios que este viewer se fue
          io.to(room).emit('streaming:viewer_left', {
            viewerId: socket.id,
            sessionId: room.replace('streaming:', ''),
          })
        }
        if (room.startsWith('match:')) {
          console.log('User left match room:', room)
          socket.leave(room)
        }
      })
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
