'use server'

import { dbPromise } from '@/database/drizzle'
import { streamingSessionsTable } from '@/database/schema'
import { eq, and } from 'drizzle-orm'
import { randomBytes } from 'crypto'

// Server Actions para el cliente
export async function createStreamingSessionAction(formData: FormData) {
  const matchId = formData.get('matchId') as string
  const broadcasterId = formData.get('broadcasterId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!matchId || !broadcasterId) {
    return { success: false, error: 'Missing required fields' }
  }

  try {
    const db = await dbPromise

    // Buscar si ya existe una sesión activa para este match
    console.log('Checking for existing active session for matchId:', matchId)
    const [existingSession] = await db
      .select()
      .from(streamingSessionsTable)
      .where(
        and(
          eq(streamingSessionsTable.matchId, matchId), // Buscar por matchId
          eq(streamingSessionsTable.isActive, true)
        )
      )
      .limit(1)

    if (existingSession) {
      console.log('Found existing session, reusing:', existingSession.id)
      return { success: true, data: existingSession, error: null }
    }

    // Si no existe, crear una nueva sesión
    console.log('No existing session found, creating new one')
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

    console.log('Created new streaming session with matchId:', session.id)
    return { success: true, data: session, error: null }
  } catch (error) {
    console.error('Error creating streaming session:', error)
    return { success: false, error: 'Failed to create streaming session' }
  }
}

export async function endStreamingSessionAction(formData: FormData) {
  const sessionId = formData.get('sessionId') as string

  if (!sessionId) {
    return { success: false, error: 'Missing session ID' }
  }

  try {
    const db = await dbPromise

    console.log('Ending streaming session:', sessionId)

    const [session] = await db
      .update(streamingSessionsTable)
      .set({
        isActive: false,
        endedAt: new Date(),
      })
      .where(eq(streamingSessionsTable.id, sessionId))
      .returning()

    console.log('Session ended successfully:', session)

    return { success: true, data: session, error: null }
  } catch (error) {
    console.error('Error ending streaming session:', error)
    return { success: false, error: 'Failed to end streaming session' }
  }
}

// Obtener sesión activa por matchId
export async function getActiveSessionByMatchIdAction(matchId: string) {
  try {
    console.log('Searching for active session for matchId:', matchId)
    const db = await dbPromise

    // Buscar por matchId
    const [session] = await db
      .select()
      .from(streamingSessionsTable)
      .where(
        and(
          eq(streamingSessionsTable.matchId, matchId), // Buscar por matchId
          eq(streamingSessionsTable.isActive, true)
        )
      )
      .limit(1)

    console.log('Found session:', session ? 'YES' : 'NO', session?.id || 'none')
    return { success: true, data: session, error: null }
  } catch (error) {
    console.error('Error getting active session by matchId:', error)
    return { success: false, error: 'Failed to get active session' }
  }
}

// Obtener todos los streams activos
export async function getActiveStreamsAction() {
  try {
    const db = await dbPromise

    console.log('Getting all active streams')

    const streams = await db
      .select()
      .from(streamingSessionsTable)
      .where(eq(streamingSessionsTable.isActive, true))

    console.log(`Found ${streams.length} active streams`)

    return { success: true, data: streams, error: null }
  } catch (error) {
    console.error('Error getting active streams:', error)
    return { success: false, error: 'Failed to get active streams' }
  }
}

// Limpiar manualmente todas las sesiones activas (para debugging)
export async function cleanupAllActiveSessionsAction() {
  try {
    const db = await dbPromise

    console.log('Cleaning up all active sessions')

    const result = await db
      .update(streamingSessionsTable)
      .set({
        isActive: false,
        endedAt: new Date(),
      })
      .where(eq(streamingSessionsTable.isActive, true))
      .returning()

    console.log(`Cleaned up ${result.length} active sessions`)

    return { success: true, data: result, error: null }
  } catch (error) {
    console.error('Error cleaning up sessions:', error)
    return { success: false, error: 'Failed to clean up sessions' }
  }
}
