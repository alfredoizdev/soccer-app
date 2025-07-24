import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as postsActions from '@/lib/actions/posts.action'

vi.mock('@/database/drizzle', () => ({
  dbPromise: Promise.resolve({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: '1',
            title: 'Test',
            content: 'Content',
            userId: '1',
            slug: 'test',
            createdAt: new Date(),
          },
        ]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: '1',
              title: 'Test',
              content: 'Content',
              userId: '1',
              slug: 'test',
              createdAt: new Date(),
            },
          ]),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ id: '1' }]),
    }),
    select: vi.fn().mockImplementation(function () {
      return {
        from: () => ({
          leftJoin: () => ({
            where: () => ({
              orderBy: () => ({
                limit: () =>
                  Promise.resolve([
                    {
                      post: {
                        id: '1',
                        title: 'Test',
                        content: 'Content',
                        userId: '1',
                        slug: 'test',
                        createdAt: new Date(),
                      },
                      user: {
                        name: 'Jane',
                        lastName: 'Doe',
                        avatar: '/avatar.jpg',
                      },
                    },
                  ]),
              }),
            }),
          }),
        }),
      }
    }),
    findFirst: vi.fn().mockResolvedValue({ name: 'Jane', lastName: 'Doe' }),
    then: vi.fn().mockImplementation(function (cb) {
      return cb([{ id: '1' }])
    }),
  }),
}))

vi.mock('@/lib/utils/cloudinaryUpload', () => ({
  cloudinaryHandles: {
    uploadMediaToCloudinary: vi.fn().mockResolvedValue('/media.jpg'),
    deleteImageFromCloudinary: vi.fn().mockResolvedValue(true),
    getPublicIdFromUrl: vi.fn().mockReturnValue('public-id'),
  },
}))

describe('posts.action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(postsActions, 'createPost').mockImplementation(async (input) => {
      if (!input.title || !input.content || !input.userId) {
        return { success: false, data: null, error: 'Missing required fields' }
      }
      return {
        success: true,
        data: {
          id: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '1',
          title: 'Test',
          slug: 'test',
          content: 'Content',
          mediaUrl: null,
          mediaType: null,
        },
        error: null,
      }
    })
    vi.spyOn(postsActions, 'updatePost').mockImplementation(async (input) => {
      if (!input.id) {
        return { success: false, data: null, error: 'Missing post id' }
      }
      return {
        success: true,
        data: {
          id: '1',
          title: 'Test',
          slug: 'test',
          content: 'Content',
          mediaUrl: null,
          mediaType: null,
          userId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        error: null,
      }
    })
    vi.spyOn(postsActions, 'deletePost').mockResolvedValue({
      success: true,
      error: null,
    })
    vi.spyOn(postsActions, 'getPostsAction').mockResolvedValue({
      success: true,
      data: [],
      error: null,
    })
    vi.spyOn(postsActions, 'getRecentPosts').mockResolvedValue({
      success: true,
      data: [],
      error: null,
    })
  })

  it('createPost returns error if missing fields', async () => {
    const res = await postsActions.createPost({
      title: '',
      content: '',
      userId: '',
    })
    expect(res.success).toBe(false)
  })

  it('createPost returns success with valid data', async () => {
    const res = await postsActions.createPost({
      title: 'Test',
      content: 'Content',
      userId: '1',
    })
    expect(res.success).toBe(true)
  })

  it('updatePost returns error if missing id', async () => {
    const res = await postsActions.updatePost({ title: 'Test' } as unknown as {
      id: string
    })
    expect(res.success).toBe(false)
  })

  it('updatePost returns success with valid data', async () => {
    const res = await postsActions.updatePost({ id: '1', title: 'Test' })
    expect(res.success).toBe(true)
  })

  it('deletePost returns success', async () => {
    const res = await postsActions.deletePost('1')
    expect(res.success).toBe(true)
  })

  it('getPostsAction returns posts', async () => {
    const res = await postsActions.getPostsAction()
    expect(res.success).toBe(true)
  })

  it('getRecentPosts returns posts', async () => {
    const res = await postsActions.getRecentPosts()
    expect(res.success).toBe(true)
  })
})
