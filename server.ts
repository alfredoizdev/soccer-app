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
      socket.join(`streaming:${data.sessionId}`)
      io.to(`streaming:${data.sessionId}`).emit('streaming:viewer_joined', {
        viewerId: data.viewerId,
        sessionId: data.sessionId,
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
      })
    })

    socket.on('webrtc:answer', (data) => {
      socket.to(`streaming:${data.sessionId}`).emit('webrtc:answer', {
        answer: data.answer,
        from: data.from,
        to: data.to,
      })
    })

    socket.on('webrtc:ice_candidate', (data) => {
      socket.to(`streaming:${data.sessionId}`).emit('webrtc:ice_candidate', {
        candidate: data.candidate,
        from: data.from,
        to: data.to,
      })
    })

    socket.on('streaming:start', (data) => {
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
      // Buscar todas las sesiones activas para este match y terminarlas
      io.emit('streaming:stop_by_match', {
        matchId: data.matchId,
      })
    })

    socket.on('disconnect', () => {
      // User disconnected
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
