'use server'

import { dbPromise } from '@/database/drizzle'
import { childrenTable, InsertUser, usersTable } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { cloudinaryHandles } from '@/lib/utils/cloudinaryUpload'

export const createUserAction = async (
  user: InsertUser & { avatar?: string | File | Buffer }
) => {
  try {
    let avatarUrl = ''
    if (user.avatar && typeof user.avatar !== 'string') {
      let buffer: Buffer
      if (Buffer.isBuffer(user.avatar)) {
        buffer = user.avatar
      } else if (typeof (user.avatar as File).arrayBuffer === 'function') {
        const arrayBuffer = await (user.avatar as File).arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        throw new Error('Unsupported image format')
      }
      avatarUrl = await cloudinaryHandles.uploadImageToCloudinary(
        buffer,
        `users/${user.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}`
      )
    } else if (typeof user.avatar === 'string') {
      avatarUrl = user.avatar
    }
    const db = await dbPromise
    const [newUser] = await db
      .insert(usersTable)
      .values({
        ...user,
        avatar: avatarUrl,
      })
      .returning()
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
    // Normalizar avatar a string
    const normalizedUsers = users.map((user) => ({
      ...user,
      avatar: user.avatar ?? '',
    }))

    return { data: normalizedUsers, error: null }
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

export const updateUserAction = async (
  id: string,
  data: Partial<InsertUser> & { avatar?: string | File | Buffer }
) => {
  try {
    if (!id) {
      return { success: false, error: 'User ID is required' }
    }
    const db = await dbPromise
    // Obtener el usuario actual para saber la URL vieja
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))

    let avatarUrl = ''
    if (data.avatar && typeof data.avatar !== 'string') {
      // Eliminar la imagen anterior si existe
      if (user?.avatar) {
        const publicId = cloudinaryHandles.getPublicIdFromUrl(user.avatar)
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
        `users/${data.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}`
      )
    } else if (typeof data.avatar === 'string') {
      avatarUrl = data.avatar
    } else {
      avatarUrl = user?.avatar || ''
    }

    await db
      .update(usersTable)
      .set({
        ...Object.fromEntries(
          Object.entries(data).filter(([key]) => key !== 'password')
        ),
        ...(data.password ? { password: data.password } : {}),
        avatar: avatarUrl,
      })
      .where(eq(usersTable.id, id))
    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}
