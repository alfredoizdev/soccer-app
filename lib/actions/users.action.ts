'use server'

import { dbPromise } from '@/database/drizzle'
import { childrenTable, InsertUser, usersTable } from '@/database/schema'
import { eq } from 'drizzle-orm'

export const createUserAction = async (user: InsertUser) => {
  try {
    const db = await dbPromise
    const [newUser] = await db.insert(usersTable).values(user).returning()
    return { data: newUser, error: null }
  } catch (error) {
    console.error('Error creating user:', error)
    return { data: null, error: 'Failed to create user' }
  }
}

export const getUserAction = async (id: string) => {
  try {
    const db = await dbPromise
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id))
    return { data: user, error: null }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { data: null, error: 'Failed to fetch user' }
  }
}

export const getUsersAction = async () => {
  try {
    const db = await dbPromise
    const users = await db.select().from(usersTable)
    return { data: users, error: null }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { data: null, error: 'Failed to fetch users' }
  }
}

export const getUsersWithChildren = async () => {
  try {
    const db = await dbPromise
    const result = await db
      .select({
        user: usersTable,
        child: childrenTable,
      })
      .from(usersTable)
      .leftJoin(childrenTable, eq(usersTable.id, childrenTable.userId))

    const usersMap = new Map()
    for (const row of result) {
      const userId = row.user.id
      if (!usersMap.has(userId)) {
        usersMap.set(userId, { ...row.user, children: [] })
      }
      if (row.child && row.child.id) {
        usersMap.get(userId).children.push(row.child)
      }
    }
    return { data: Array.from(usersMap.values()), error: null }
  } catch (error) {
    console.error('Error fetching users with children:', error)
    return { data: null, error: 'Failed to fetch users with children' }
  }
}

export const getChildrenByUserAction = async (userId: string) => {
  const db = await dbPromise
  const children = await db
    .select()
    .from(childrenTable)
    .where(eq(childrenTable.userId, userId))
  return children
}
