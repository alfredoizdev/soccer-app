'use server'
import { dbPromise } from '@/database/drizzle'
import { organizationsTable } from '@/database/schema'
import { cloudinaryHandles } from '@/lib/utils/cloudinaryUpload'
import { OrganizationType } from '@/types/UserType'
import { eq, desc } from 'drizzle-orm'
import { usersTable } from '@/database/schema'

export const getOrganizationsAction = async () => {
  try {
    const db = await dbPromise
    const orgs = await db.select().from(organizationsTable)
    const normalizedOrgs = orgs.map((org) => ({
      ...org,
      avatar: org.avatar ?? '',
      description: org.description ?? '',
      createdAt: org.createdAt ?? undefined,
    }))
    return { data: normalizedOrgs, error: null }
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return { data: null, error: 'Failed to fetch organizations' }
  }
}

export const getOrganizationAction = async (id: string) => {
  try {
    const db = await dbPromise
    const org = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, id))
      .limit(1)

    const team: OrganizationType = {
      ...org[0],
      avatar: org[0].avatar ?? '',
      description: org[0].description ?? '',
      createdAt: org[0].createdAt ?? undefined,
    }

    return { data: team, error: null }
  } catch (error) {
    console.error('Error fetching organization:', error)
    return { data: null, error: 'Failed to fetch organization' }
  }
}

export const createOrganizationAction = async (data: {
  name: string
  description?: string
  avatar?: string | File | Buffer // Puede ser URL, buffer o File
}) => {
  try {
    let avatarUrl = ''
    if (data.avatar && typeof data.avatar !== 'string') {
      // Si es un archivo o buffer, subir a Cloudinary
      // Si es File (del frontend), convertir a buffer
      let buffer: Buffer
      if (data.avatar instanceof Buffer) {
        buffer = data.avatar
      } else if (typeof (data.avatar as File).arrayBuffer === 'function') {
        // File del frontend
        const arrayBuffer = await (data.avatar as File).arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        throw new Error('Formato de imagen no soportado')
      }
      avatarUrl = await cloudinaryHandles.uploadImageToCloudinary(
        buffer,
        `soccer-app/teams/${data.name.toLowerCase().replace(/\s+/g, '-')}`
      )
    } else if (typeof data.avatar === 'string') {
      avatarUrl = data.avatar
    }
    const db = await dbPromise
    await db.insert(organizationsTable).values({
      name: data.name,
      description: data.description ?? '',
      avatar: avatarUrl,
    })
    return { success: true, error: null }
  } catch (error) {
    console.error('Error creating organization:', error)
    return { success: false, error: 'Failed to create organization' }
  }
}

export const updateOrganizationAction = async (
  id: string,
  data: {
    name: string
    description?: string
    avatar?: string | File | Buffer
  }
) => {
  try {
    if (!id) {
      return { success: false, error: 'Organization ID is required' }
    }

    const db = await dbPromise

    // 1. Obtener la organización actual para saber la URL vieja
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, id))

    let avatarUrl = ''
    if (data.avatar && typeof data.avatar !== 'string') {
      // 2. Eliminar la imagen anterior si existe
      if (org?.avatar) {
        const publicId = cloudinaryHandles.getPublicIdFromUrl(org.avatar)
        if (publicId)
          await cloudinaryHandles.deleteImageFromCloudinary(publicId)
      }
      // 3. Subir la nueva imagen
      let buffer: Buffer
      if (data.avatar instanceof Buffer) {
        buffer = data.avatar
      } else if (typeof (data.avatar as File).arrayBuffer === 'function') {
        const arrayBuffer = await (data.avatar as File).arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        throw new Error('Format not supported')
      }
      avatarUrl = await cloudinaryHandles.uploadImageToCloudinary(
        buffer,
        `soccer-app/teams/${data.name.toLowerCase().replace(/\s+/g, '-')}`
      )
    } else if (typeof data.avatar === 'string') {
      avatarUrl = data.avatar
    }

    await db
      .update(organizationsTable)
      .set({
        name: data.name,
        description: data.description ?? '',
        avatar: avatarUrl,
      })
      .where(eq(organizationsTable.id, id))
    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating organization:', error)
    return { success: false, error: 'Failed to update organization' }
  }
}

// Devuelve el total de equipos (organizations)
export const getOrganizationsCountAction = async () => {
  try {
    const db = await dbPromise
    const result = await db.select().from(organizationsTable)
    return { data: result.length, error: null }
  } catch (error) {
    console.error('Error counting organizations:', error)
    return { data: null, error: 'Failed to count organizations' }
  }
}

// Devuelve los 3 equipos más recientes
export const getLatestOrganizationsAction = async (limit = 3) => {
  try {
    const db = await dbPromise
    const orgs = await db
      .select()
      .from(organizationsTable)
      .orderBy(desc(organizationsTable.createdAt))
      .limit(limit)
    const normalizedOrgs = orgs.map((org) => ({
      ...org,
      avatar: org.avatar ?? '',
      description: org.description ?? '',
      createdAt: org.createdAt ?? undefined,
    }))
    return { data: normalizedOrgs, error: null }
  } catch (error) {
    console.error('Error fetching latest organizations:', error)
    return { data: null, error: 'Failed to fetch latest organizations' }
  }
}

export const joinOrganizationAction = async (
  userId: string,
  organizationId: string
) => {
  try {
    if (!userId || !organizationId) {
      return {
        success: false,
        error: 'User ID and Organization ID are required',
      }
    }
    const db = await dbPromise
    // 1. Asignar el club al usuario
    await db
      .update(usersTable)
      .set({ organizationId })
      .where(eq(usersTable.id, userId))
    // 2. Asignar el club a todos los jugadores de ese usuario
    const { playersTable } = await import('@/database/schema')
    await db
      .update(playersTable)
      .set({ organizationId })
      .where(eq(playersTable.userId, userId))
    return { success: true, error: null }
  } catch (error) {
    console.error('Error joining organization:', error)
    return { success: false, error: 'Failed to join organization' }
  }
}

export const unregisterOrganizationAction = async (userId: string) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' }
    }
    const db = await dbPromise
    // 1. Quitar el club al usuario
    await db
      .update(usersTable)
      .set({ organizationId: null })
      .where(eq(usersTable.id, userId))
    // 2. Quitar el club a todos los jugadores de ese usuario
    const { playersTable } = await import('@/database/schema')
    await db
      .update(playersTable)
      .set({ organizationId: null })
      .where(eq(playersTable.userId, userId))
    return { success: true, error: null }
  } catch (error) {
    console.error('Error unregistering organization:', error)
    return { success: false, error: 'Failed to unregister organization' }
  }
}

export type GetOrganizationByUserIdResult = {
  data: OrganizationType | null
  error: string | null
}

export const getOrganizationByUserId = async (
  userId: string
): Promise<GetOrganizationByUserIdResult> => {
  try {
    const db = await dbPromise
    // 1. Buscar el usuario
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
    if (!user || !user.organizationId) {
      return { data: null, error: 'User not in any organization' }
    }
    // 2. Buscar la organización
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, user.organizationId))
    if (!org) {
      return { data: null, error: 'Organization not found' }
    }
    // Mapear a OrganizationType, asegurando que los campos sean string o undefined
    const organization: OrganizationType = {
      id: org.id,
      name: org.name,
      description: org.description ?? '',
      avatar: org.avatar ?? '',
      createdAt: org.createdAt ?? undefined,
    }
    return { data: organization, error: null }
  } catch (error) {
    console.error('Error fetching organization by user:', error)
    return { data: null, error: 'Failed to fetch organization by user' }
  }
}
