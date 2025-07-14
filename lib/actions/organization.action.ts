'use server'
import { dbPromise } from '@/database/drizzle'
import { organizationsTable } from '@/database/schema'
import { cloudinaryHandles } from '@/lib/utils/cloudinaryUpload'
import { OrganizationType } from '@/types/UserType'
import { eq, desc } from 'drizzle-orm'

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
