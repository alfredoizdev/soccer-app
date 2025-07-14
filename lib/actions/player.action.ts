'use server'

import { dbPromise } from '@/database/drizzle'
import { childrenTable, usersTable } from '@/database/schema'
import { eq, isNull, desc } from 'drizzle-orm'
import { PlayerType } from '@/types/PlayerType'
import { cloudinaryHandles } from '@/lib/utils/cloudinaryUpload'
import { revalidatePath } from 'next/cache'

export const createPlayerAction = async (
  player: Omit<PlayerType, 'id' | 'createdAt' | 'updatedAt'> & {
    avatar?: string | File | Buffer
  }
) => {
  try {
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
    const db = await dbPromise
    const [newPlayer] = await db
      .insert(childrenTable)
      .values({
        ...player,
        avatar: avatarUrl,
      })
      .returning()
    return { data: newPlayer, error: null }
  } catch (error) {
    console.error('Error creating player:', error)
    if (error instanceof Error) {
      console.error('Stack:', error.stack)
    }
    return { data: null, error: 'Failed to create player' }
  }
}

export const getPlayerAction = async (id: string) => {
  try {
    const db = await dbPromise
    const player = await db
      .select()
      .from(childrenTable)
      .where(eq(childrenTable.id, id))
    return { data: player, error: null }
  } catch (error) {
    console.error('Error fetching player:', error)
    return { data: null, error: 'Failed to fetch player' }
  }
}

export const getPlayersAction = async () => {
  try {
    const db = await dbPromise
    const players = await db.select().from(childrenTable)
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
        player: childrenTable,
        user: usersTable,
      })
      .from(childrenTable)
      .leftJoin(usersTable, eq(childrenTable.userId, usersTable.id))

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
      .from(childrenTable)
      .where(eq(childrenTable.id, id))

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
    await db
      .update(childrenTable)
      .set(updateData)
      .where(eq(childrenTable.id, id))
    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating player:', error)
    return { success: false, error: 'Failed to update player' }
  }
}

export const deletePlayerAction = async (id: string) => {
  try {
    const db = await dbPromise
    await db.delete(childrenTable).where(eq(childrenTable.id, id))
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
      .from(childrenTable)
      .where(eq(childrenTable.organizationId, organizationId))
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
      .update(childrenTable)
      .set({ organizationId })
      .where(eq(childrenTable.id, playerId))
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
      .update(childrenTable)
      .set({ organizationId: null })
      .where(eq(childrenTable.id, playerId))
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
      .from(childrenTable)
      .where(isNull(childrenTable.organizationId))
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
    const result = await db.select().from(childrenTable)
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
      .from(childrenTable)
      .orderBy(desc(childrenTable.createdAt))
      .limit(limit)
    return { data: players, error: null }
  } catch (error) {
    console.error('Error fetching latest players:', error)
    return { data: null, error: 'Failed to fetch latest players' }
  }
}
