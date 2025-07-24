'use server'
import { postsTable, usersTable } from '@/database/schema'
import { dbPromise } from '@/database/drizzle'
import slugify from 'slugify'
import { eq, ne, desc, and } from 'drizzle-orm'
import { cloudinaryHandles } from '@/lib/utils/cloudinaryUpload'
import { PostType, PostInput } from '@/types/PostType'
import { revalidatePath } from 'next/cache'

export async function createPost(input: PostInput) {
  try {
    if (!input.title || !input.content || !input.userId) {
      return { success: false, data: null, error: 'Missing required fields' }
    }
    let mediaUrl = input.mediaUrl
    let mediaType = input.mediaType
    if (input.mediaFile) {
      let buffer: Buffer
      if (Buffer.isBuffer(input.mediaFile)) {
        buffer = input.mediaFile
      } else if (typeof (input.mediaFile as File).arrayBuffer === 'function') {
        const arrayBuffer = await (input.mediaFile as File).arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        return { success: false, data: null, error: 'Unsupported media format' }
      }
      const type = (input.mediaFile as File).type.startsWith('video/')
        ? 'video'
        : 'image'
      // Obtener username
      const db = await dbPromise
      const user = await db.query.usersTable.findFirst({
        where: (u, { eq }) => eq(u.id, String(input.userId)),
      })
      const username = user
        ? `${user.name}-${user.lastName}`.replace(/\s+/g, '').toLowerCase()
        : 'unknown'
      mediaUrl = await cloudinaryHandles.uploadMediaToCloudinary(
        buffer,
        type,
        `soccer-app/posts/${username}`
      )
      mediaType = type
    } else {
      mediaUrl = undefined
      mediaType = 'text'
    }
    const slug = slugify(input.title, { lower: true, strict: true })
    const db = await dbPromise
    const [post] = await db
      .insert(postsTable)
      .values({ ...input, slug, mediaUrl, mediaType })
      .returning()
    return { success: true, data: post, error: null }
  } catch (error) {
    console.error('Error creating post:', error)
    return { success: false, data: null, error: 'Failed to create post' }
  }
}

export type PostUpdateInput = Partial<PostInput> & {
  id: string
  status?: 'pending' | 'approved' | 'rejected'
}

export async function updatePost(input: PostUpdateInput) {
  try {
    const { id, ...rest } = input
    if (!id) return { success: false, data: null, error: 'Missing post id' }
    const db = await dbPromise
    let mediaUrl = rest.mediaUrl
    let mediaType = rest.mediaType
    // Obtener el post actual para saber si hay media previa
    const [current] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, id))
    const prevMediaUrl = current?.mediaUrl

    if (rest.mediaFile) {
      let buffer: Buffer
      if (Buffer.isBuffer(rest.mediaFile)) {
        buffer = rest.mediaFile
      } else if (typeof (rest.mediaFile as File).arrayBuffer === 'function') {
        const arrayBuffer = await (rest.mediaFile as File).arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        return { success: false, data: null, error: 'Unsupported media format' }
      }
      const type = (rest.mediaFile as File).type.startsWith('video/')
        ? 'video'
        : 'image'
      // Obtener username
      const user = await db.query.usersTable.findFirst({
        where: (u, { eq }) => eq(u.id, String(rest.userId)),
      })
      const username = user
        ? `${user.name}-${user.lastName}`.replace(/\s+/g, '').toLowerCase()
        : 'unknown'
      // Borrar media anterior si existe
      if (prevMediaUrl) {
        const publicId = cloudinaryHandles.getPublicIdFromUrl(prevMediaUrl)
        if (publicId) {
          await cloudinaryHandles.deleteImageFromCloudinary(publicId)
        }
      }
      mediaUrl = await cloudinaryHandles.uploadMediaToCloudinary(
        buffer,
        type,
        `soccer-app/posts/${username}`
      )
      mediaType = type
    } else if (!rest.mediaUrl && prevMediaUrl) {
      // Si el admin borra la media (mediaUrl vacío o undefined), borrar la anterior
      const publicId = cloudinaryHandles.getPublicIdFromUrl(prevMediaUrl)
      if (publicId) {
        await cloudinaryHandles.deleteImageFromCloudinary(publicId)
      }
      mediaUrl = undefined
      mediaType = 'text'
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData = { ...rest, mediaUrl, mediaType } as any
    if (rest.title) {
      updateData.slug = slugify(rest.title, { lower: true, strict: true })
    }
    const [post] = await db
      .update(postsTable)
      .set(updateData)
      .where(eq(postsTable.id, id))
      .returning()

    revalidatePath('/admin/posts', 'page')

    return { success: true, data: post, error: null }
  } catch (error) {
    console.error('Error updating post:', error)
    return { success: false, data: null, error: 'Failed to update post' }
  }
}

export async function deletePost(id: string) {
  try {
    const db = await dbPromise
    await db.delete(postsTable).where(eq(postsTable.id, id))
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error: 'Failed to delete post' }
  }
}

export async function getPostsAction() {
  try {
    const db = await dbPromise
    const posts = await db
      .select({
        post: postsTable,
        user: usersTable,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .where(eq(postsTable.status, 'approved'))
    const data: PostType[] = posts.map((row) => ({
      ...row.post,
      mediaUrl: row.post.mediaUrl ?? undefined,
      mediaType: row.post.mediaType ?? undefined,
      createdAt: row.post.createdAt ?? undefined,
      updatedAt: row.post.updatedAt ?? undefined,
      userName: row.user ? `${row.user.name} ${row.user.lastName}` : undefined,
      userAvatar: row.user?.avatar ?? undefined,
    }))
    return { success: true, data, error: null }
  } catch (error) {
    console.error('Error getting posts:', error)
    return { success: false, data: [], error: 'Failed to get posts' }
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const db = await dbPromise
    const result = await db
      .select({
        post: postsTable,
        user: usersTable,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .where(eq(postsTable.slug, slug))
    if (!result.length) {
      return { success: false, data: null, error: 'Post not found' }
    }
    const row = result[0]
    const post: PostType = {
      ...row.post,
      mediaUrl: row.post.mediaUrl ?? undefined,
      mediaType: row.post.mediaType ?? undefined,
      createdAt: row.post.createdAt ?? undefined,
      updatedAt: row.post.updatedAt ?? undefined,
      userName: row.user ? `${row.user.name} ${row.user.lastName}` : undefined,
      userAvatar: row.user?.avatar ?? undefined,
    }
    return { success: true, data: post, error: null }
  } catch (error) {
    console.error('Error getting post by slug:', error)
    return { success: false, data: null, error: 'Failed to get post' }
  }
}

export async function getRecentPosts(
  excludePostId?: string,
  limit: number = 8
) {
  try {
    const db = await dbPromise

    const posts = await db
      .select({
        post: postsTable,
        user: usersTable,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .where(
        and(
          eq(postsTable.status, 'approved'),
          excludePostId ? ne(postsTable.id, excludePostId) : undefined
        )
      )
      .orderBy(desc(postsTable.createdAt))
      .limit(limit)

    const data: PostType[] = posts.map((row) => ({
      ...row.post,
      mediaUrl: row.post.mediaUrl ?? undefined,
      mediaType: row.post.mediaType ?? undefined,
      createdAt: row.post.createdAt ?? undefined,
      updatedAt: row.post.updatedAt ?? undefined,
      userName: row.user ? `${row.user.name} ${row.user.lastName}` : undefined,
      userAvatar: row.user?.avatar ?? undefined,
    }))
    return { success: true, data, error: null }
  } catch (error) {
    console.error('Error getting recent posts:', error)
    return { success: false, data: [], error: 'Failed to get recent posts' }
  }
}

export async function getPostsPaginatedAdminAction(
  page: number = 1,
  perPage: number = 10
) {
  try {
    const db = await dbPromise
    const offset = (page - 1) * perPage
    const posts = await db
      .select({
        post: postsTable,
        user: usersTable,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .orderBy(desc(postsTable.createdAt))
      .limit(perPage)
      .offset(offset)
    const total = await db.select().from(postsTable)
    const data: PostType[] = posts.map((row) => ({
      ...row.post,
      mediaUrl: row.post.mediaUrl ?? undefined,
      mediaType: row.post.mediaType ?? undefined,
      createdAt: row.post.createdAt ?? undefined,
      updatedAt: row.post.updatedAt ?? undefined,
      userName: row.user ? `${row.user.name} ${row.user.lastName}` : undefined,
      userAvatar: row.user?.avatar ?? undefined,
    }))
    return { success: true, data, total: total.length, error: null }
  } catch (error) {
    console.error('Error getting paginated posts:', error)
    return { success: false, data: [], total: 0, error: 'Failed to get posts' }
  }
}
