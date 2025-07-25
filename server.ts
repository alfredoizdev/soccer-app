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
    console.log('a user connected')

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

    socket.on('disconnect', () => {
      console.log('user disconnected')
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
