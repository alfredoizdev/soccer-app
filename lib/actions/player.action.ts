'use server'

import { dbPromise } from '@/database/drizzle'
import { childrenTable, usersTable } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { PlayerType } from '@/types/PlayerType'

export const createPlayerAction = async (
  player: Omit<PlayerType, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    const db = await dbPromise
    const [newPlayer] = await db
      .insert(childrenTable)
      .values(player)
      .returning()
    return { data: newPlayer, error: null }
  } catch (error) {
    console.error('Error creating player:', error)
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
  data: Partial<PlayerType>
) => {
  try {
    const db = await dbPromise
    // Excluir createdAt y updatedAt del update
    const updateData = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) => key !== 'createdAt' && key !== 'updatedAt'
      )
    )
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
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting player:', error)
    return { success: false, error: 'Failed to delete player' }
  }
}
