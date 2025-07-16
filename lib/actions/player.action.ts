'use server'

import { dbPromise } from '@/database/drizzle'
import { playersTable, usersTable, playerStatsTable } from '@/database/schema'
import { eq, isNull, desc, and } from 'drizzle-orm'
import { PlayerType } from '@/types/PlayerType'
import { cloudinaryHandles } from '@/lib/utils/cloudinaryUpload'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'

export const createPlayerAction = async (
  player: Omit<PlayerType, 'id' | 'createdAt' | 'updatedAt'> & {
    avatar?: string | File | Buffer
  }
) => {
  try {
    const db = await dbPromise
    // Validación: no permitir crear player sin club
    if (!player.organizationId) {
      return {
        data: null,
        error: 'You must join a club before adding a player.',
      }
    }
    // Validación de duplicados: mismo nombre, apellido y club
    const existing = await db
      .select()
      .from(playersTable)
      .where(
        and(
          eq(playersTable.name, player.name),
          eq(playersTable.lastName, player.lastName),
          eq(playersTable.organizationId, player.organizationId)
        )
      )
    if (existing.length > 0) {
      return {
        data: null,
        error: 'A player with this name already exists in your club.',
      }
    }
    let avatarUrl = ''
    if (player.avatar && typeof player.avatar !== 'string') {
      let buffer: Buffer
      if (Buffer.isBuffer(player.avatar)) {
        buffer = player.avatar
      } else if (typeof (player.avatar as File).arrayBuffer === 'function') {
        const arrayBuffer = await (player.avatar as File).arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        throw new Error('Unsupported image format')
      }
      avatarUrl = await cloudinaryHandles.uploadImageToCloudinary(
        buffer,
        `soccer-app/players/${
          player.name?.toLowerCase().replace(/\s+/g, '-') || 'player'
        }`
      )
    } else if (typeof player.avatar === 'string') {
      avatarUrl = player.avatar
    }
    const [newPlayer] = await db
      .insert(playersTable)
      .values({
        ...player,
        avatar: avatarUrl,
      })
      .returning()
    return { data: newPlayer, error: null }
  } catch (error) {
    console.error('Error creating player:', error)
    return { data: null, error: 'Failed to create player' }
  }
}

export const adminCreatePlayerAction = async (
  player: Omit<PlayerType, 'id' | 'createdAt' | 'updatedAt'> & {
    avatar?: string | File | Buffer
  }
) => {
  try {
    const db = await dbPromise
    // No validar organizationId, permitir nulo
    // Validación de duplicados: mismo nombre, apellido y club (si club existe)
    let existing = []
    if (player.organizationId) {
      existing = await db
        .select()
        .from(playersTable)
        .where(
          and(
            eq(playersTable.name, player.name),
            eq(playersTable.lastName, player.lastName),
            eq(playersTable.organizationId, player.organizationId)
          )
        )
    }
    if (existing.length > 0) {
      return {
        data: null,
        error: 'A player with this name already exists in this club.',
      }
    }
    let avatarUrl = ''
    if (player.avatar && typeof player.avatar !== 'string') {
      let buffer: Buffer
      if (Buffer.isBuffer(player.avatar)) {
        buffer = player.avatar
      } else if (typeof (player.avatar as File).arrayBuffer === 'function') {
        const arrayBuffer = await (player.avatar as File).arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        throw new Error('Unsupported image format')
      }
      avatarUrl = await cloudinaryHandles.uploadImageToCloudinary(
        buffer,
        `soccer-app/players/${
          player.name?.toLowerCase().replace(/\s+/g, '-') || 'player'
        }`
      )
    } else if (typeof player.avatar === 'string') {
      avatarUrl = player.avatar
    }
    const [newPlayer] = await db
      .insert(playersTable)
      .values({
        ...player,
        avatar: avatarUrl,
      })
      .returning()
    return { data: newPlayer, error: null }
  } catch (error) {
    console.error('Error creating player (admin):', error)
    return { data: null, error: 'Failed to create player (admin)' }
  }
}

export const getPlayerAction = async (id: string) => {
  try {
    const db = await dbPromise
    const player = await db
      .select()
      .from(playersTable)
      .where(eq(playersTable.id, id))
    return { data: player, error: null }
  } catch (error) {
    console.error('Error fetching player:', error)
    return { data: null, error: 'Failed to fetch player' }
  }
}

export const getPlayersAction = async () => {
  try {
    const db = await dbPromise
    const players = await db.select().from(playersTable)
    return { data: players, error: null }
  } catch (error) {
    console.error('Error fetching players:', error)
    return { data: null, error: 'Failed to fetch players' }
  }
}

export const getPlayersWithUserAction = async () => {
  try {
    const db = await dbPromise
    const result = await db
      .select({
        player: playersTable,
        user: usersTable,
      })
      .from(playersTable)
      .leftJoin(usersTable, eq(playersTable.userId, usersTable.id))

    // Agrupar por player
    const players = result.map((row) => ({
      ...row.player,
      user: row.user,
    }))
    return { data: players, error: null }
  } catch (error) {
    console.error('Error fetching players with user:', error)
    return { data: null, error: 'Failed to fetch players with user' }
  }
}

export const updatePlayerAction = async (
  id: string,
  data: Partial<PlayerType> & { avatar?: string | File | Buffer }
) => {
  try {
    const db = await dbPromise
    // Obtener el jugador actual para saber la URL vieja
    const [player] = await db
      .select()
      .from(playersTable)
      .where(eq(playersTable.id, id))

    let avatarUrl = undefined
    if (data.avatar && typeof data.avatar !== 'string') {
      // Borrar imagen anterior si existe
      if (player?.avatar) {
        const publicId = cloudinaryHandles.getPublicIdFromUrl(player.avatar)
        if (publicId)
          await cloudinaryHandles.deleteImageFromCloudinary(publicId)
      }
      // Subir la nueva imagen
      let buffer: Buffer
      if (Buffer.isBuffer(data.avatar)) {
        buffer = data.avatar
      } else if (typeof (data.avatar as File).arrayBuffer === 'function') {
        const arrayBuffer = await (data.avatar as File).arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        throw new Error('Unsupported image format')
      }
      avatarUrl = await cloudinaryHandles.uploadImageToCloudinary(
        buffer,
        `soccer-app/players/${
          player.name?.toLowerCase().replace(/\s+/g, '-') || 'player'
        }`
      )
    } else if (typeof data.avatar === 'string') {
      avatarUrl = data.avatar
    }

    // Excluir createdAt y updatedAt del update
    const updateData = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) =>
          key !== 'createdAt' && key !== 'updatedAt' && key !== 'avatar'
      )
    )
    if (avatarUrl !== undefined) {
      updateData.avatar = avatarUrl
    }
    await db.update(playersTable).set(updateData).where(eq(playersTable.id, id))
    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating player:', error)
    return { success: false, error: 'Failed to update player' }
  }
}

export const deletePlayerAction = async (id: string) => {
  try {
    const db = await dbPromise
    await db.delete(playersTable).where(eq(playersTable.id, id))
    revalidatePath('/admin/players', 'page')
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting player:', error)
    return { success: false, error: 'Failed to delete player' }
  }
}

export const getPlayersByOrganizationAction = async (
  organizationId: string
) => {
  try {
    const db = await dbPromise
    const players = await db
      .select()
      .from(playersTable)
      .where(eq(playersTable.organizationId, organizationId))
    return { data: players, error: null }
  } catch (error) {
    console.error('Error fetching players by organization:', error)
    return { data: null, error: 'Failed to fetch players by organization' }
  }
}

export const addPlayerToOrganizationAction = async (
  playerId: string,
  organizationId: string
) => {
  try {
    const db = await dbPromise
    await db
      .update(playersTable)
      .set({ organizationId })
      .where(eq(playersTable.id, playerId))
    revalidatePath(`/admin/teams/${organizationId}`, 'page')
    return { success: true, error: null }
  } catch (error) {
    console.error('Error adding player to organization:', error)
    return { success: false, error: 'Failed to add player to organization' }
  }
}

export const removePlayerFromOrganizationAction = async (
  playerId: string,
  organizationId: string
) => {
  try {
    const db = await dbPromise
    await db
      .update(playersTable)
      .set({ organizationId: null })
      .where(eq(playersTable.id, playerId))
    revalidatePath(`/admin/teams/${organizationId}`, 'page')
    return { success: true, error: null, organizationId }
  } catch (error) {
    console.error('Error removing player from organization:', error)
    return {
      success: false,
      error: 'Failed to remove player from organization',
    }
  }
}

export const getAvailablePlayersForOrganization = async () => {
  try {
    const db = await dbPromise
    const players = await db
      .select()
      .from(playersTable)
      .where(isNull(playersTable.organizationId))
    return { data: players, error: null }
  } catch (error) {
    console.error('Error fetching available players:', error)
    return { data: null, error: 'Failed to fetch available players' }
  }
}

// Devuelve el total de jugadores
export const getPlayersCountAction = async () => {
  try {
    const db = await dbPromise
    const result = await db.select().from(playersTable)
    return { data: result.length, error: null }
  } catch (error) {
    console.error('Error counting players:', error)
    return { data: null, error: 'Failed to count players' }
  }
}

// Devuelve los 3 jugadores más recientes
export const getLatestPlayersAction = async (limit = 3) => {
  try {
    const db = await dbPromise
    const players = await db
      .select()
      .from(playersTable)
      .orderBy(desc(playersTable.createdAt))
      .limit(limit)
    return { data: players, error: null }
  } catch (error) {
    console.error('Error fetching latest players:', error)
    return { data: null, error: 'Failed to fetch latest players' }
  }
}

export const getPlayersPaginatedAction = async (
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    const db = await dbPromise
    const offset = (page - 1) * pageSize
    const [players, totalResult] = await Promise.all([
      db.select().from(playersTable).limit(pageSize).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(playersTable),
    ])
    const total = totalResult[0]?.count || 0
    return { data: players, total, error: null }
  } catch (error) {
    console.error('Error fetching paginated players:', error)
    return { data: null, total: 0, error: 'Failed to fetch paginated players' }
  }
}

export async function getPlayerStatsByPlayerId(playerId: string) {
  try {
    const db = await dbPromise
    const stats = await db
      .select({
        goals: sql`SUM(${playerStatsTable.goals})`.as('goals'),
        assists: sql`SUM(${playerStatsTable.assists})`.as('assists'),
        passesCompleted: sql`SUM(${playerStatsTable.passesCompleted})`.as(
          'passesCompleted'
        ),
        duelsWon: sql`SUM(${playerStatsTable.duelsWon})`.as('duelsWon'),
        duelsLost: sql`SUM(${playerStatsTable.duelsLost})`.as('duelsLost'),
        minutesPlayed: sql`SUM(${playerStatsTable.minutesPlayed})`.as(
          'minutesPlayed'
        ),
      })
      .from(playerStatsTable)
      .where(eq(playerStatsTable.playerId, playerId))

    return { success: true, data: stats[0] }
  } catch (error) {
    return {
      success: false,
      error: (error as { message?: string }).message || 'Unknown error',
    }
  }
}
