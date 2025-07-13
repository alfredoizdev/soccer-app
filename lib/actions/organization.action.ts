'use server'
import { dbPromise } from '@/database/drizzle'
import { organizationsTable } from '@/database/schema'
import { uploadImageToCloudinary } from '@/lib/utils/cloudinaryUpload'

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
      avatarUrl = await uploadImageToCloudinary(
        buffer,
        `social-app/${data.name.toLowerCase().replace(/\s+/g, '-')}`
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
