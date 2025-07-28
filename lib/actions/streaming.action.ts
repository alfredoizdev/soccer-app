import { dbPromise } from '@/database/drizzle'
import {
  streamingSessionsTable,
  webrtcConnectionsTable,
} from '@/database/schema'
import { eq, and, desc, lt } from 'drizzle-orm'
import { randomBytes } from 'crypto'

// Crear una nueva sesión de streaming
export async function createStreamingSession({
  matchId,
  broadcasterId,
  title,
  description,
}: {
  matchId: string
  broadcasterId: string
  title?: string
  description?: string
}) {
  const db = await dbPromise

  // Generar una clave de stream única
  const streamKey = randomBytes(16).toString('hex')

  const [session] = await db
    .insert(streamingSessionsTable)
    .values({
      matchId,
      broadcasterId,
      title: title || `Live Match Stream`,
      description: description || `Live streaming of the match`,
      streamKey,
    })
    .returning()

  return { success: true, data: session, error: null }
}

// Obtener sesión de streaming por ID
export async function getStreamingSession(sessionId: string) {
  const db = await dbPromise

  const [session] = await db
    .select()
    .from(streamingSessionsTable)
    .where(eq(streamingSessionsTable.id, sessionId))
    .limit(1)

  return session || null
}

// Obtener sesión de streaming por matchId
export async function getStreamingSessionByMatchId(matchId: string) {
  const db = await dbPromise

  const [session] = await db
    .select()
    .from(streamingSessionsTable)
    .where(
      and(
        eq(streamingSessionsTable.matchId, matchId),
        eq(streamingSessionsTable.isActive, true)
      )
    )
    .orderBy(desc(streamingSessionsTable.createdAt))
    .limit(1)

  return session || null
}

// Obtener sesión de streaming por streamKey
export async function getStreamingSessionByStreamKey(streamKey: string) {
  const db = await dbPromise

  const [session] = await db
    .select()
    .from(streamingSessionsTable)
    .where(eq(streamingSessionsTable.streamKey, streamKey))
    .limit(1)

  return session || null
}

// Finalizar una sesión de streaming
export async function endStreamingSession(sessionId: string) {
  const db = await dbPromise

  const [session] = await db
    .update(streamingSessionsTable)
    .set({
      isActive: false,
      endedAt: new Date(),
    })
    .where(eq(streamingSessionsTable.id, sessionId))
    .returning()

  return { success: true, data: session, error: null }
}

// Registrar una conexión WebRTC
export async function createWebRTCConnection({
  sessionId,
  viewerId,
  connectionId,
}: {
  sessionId: string
  viewerId: string
  connectionId: string
}) {
  const db = await dbPromise

  const [connection] = await db
    .insert(webrtcConnectionsTable)
    .values({
      sessionId,
      viewerId,
      connectionId,
    })
    .returning()

  return { success: true, data: connection, error: null }
}

// Finalizar una conexión WebRTC
export async function endWebRTCConnection(connectionId: string) {
  const db = await dbPromise

  const [connection] = await db
    .update(webrtcConnectionsTable)
    .set({
      isActive: false,
      leftAt: new Date(),
    })
    .where(eq(webrtcConnectionsTable.connectionId, connectionId))
    .returning()

  return { success: true, data: connection, error: null }
}

// Obtener conexiones activas de una sesión
export async function getActiveConnections(sessionId: string) {
  const db = await dbPromise

  const connections = await db
    .select()
    .from(webrtcConnectionsTable)
    .where(
      and(
        eq(webrtcConnectionsTable.sessionId, sessionId),
        eq(webrtcConnectionsTable.isActive, true)
      )
    )

  return connections
}

// Obtener todas las sesiones de streaming activas
export async function getActiveStreamingSessions() {
  const db = await dbPromise

  // Limpiar sesiones antiguas antes de obtener las activas
  await cleanupOldStreamingSessions()

  const sessions = await db
    .select()
    .from(streamingSessionsTable)
    .where(eq(streamingSessionsTable.isActive, true))
    .orderBy(desc(streamingSessionsTable.createdAt))

  console.log(
    'Active streaming sessions:',
    sessions.length,
    sessions.map((s) => ({ id: s.id, isActive: s.isActive }))
  )

  return sessions
}

// Limpiar sesiones de streaming antiguas (más de 2 horas)
export async function cleanupOldStreamingSessions() {
  const db = await dbPromise

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás

  const result = await db
    .update(streamingSessionsTable)
    .set({
      isActive: false,
      endedAt: new Date(),
    })
    .where(
      and(
        eq(streamingSessionsTable.isActive, true),
        lt(streamingSessionsTable.createdAt, twoHoursAgo)
      )
    )
    .returning()

  if (result.length > 0) {
    console.log(`Cleaned up ${result.length} old streaming sessions`)
  }

  return result
}
