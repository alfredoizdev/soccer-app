import { notFound } from 'next/navigation'
import { getPostBySlug, getRecentPosts } from '@/lib/actions/posts.action'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import Image from 'next/image'
import RecentPostsList from '@/components/members/RecentPostsList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { userAuth } from '@/lib/actions/auth.action'
import { getUserAction } from '@/lib/actions/users.action'

interface PostDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params
  const { data: post } = await getPostBySlug(slug)

  if (!post) return notFound()

  // Obtener usuario autenticado
  const userToken = await userAuth()
  const userRes = await getUserAction(userToken?.id || '')
  const user = userRes?.data?.[0]

  // Obtener posts recientes excluyendo el post actual
  const { data: recentPosts } = await getRecentPosts(post.id, 8)

  return (
    <article className='max-w-2xl mx-auto py-10 px-4'>
      <div className='relative w-full mb-6 rounded-lg overflow-hidden'>
        {/* Header con avatar y nombre de usuario */}
        <div className='flex items-center gap-2 py-3'>
          <Avatar>
            {post.userAvatar ? (
              <AvatarImage
                src={post.userAvatar}
                alt={post.userName || 'User'}
                className='object-cover rounded-full'
              />
            ) : (
              <AvatarFallback>
                {post.userName ? post.userName[0] : '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <span className='text-sm font-medium text-gray-700'>
            {post.userName || 'Unknown'}
          </span>
          {/* Botón de editar solo para el dueño */}
          {user && user.id === post.userId && (
            <Link href={`/members/posts/${post.slug}/edit`} className='ml-auto'>
              <Button variant='default' className='rounded-none'>
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className='relative w-full h-120 bg-gray-900 flex items-center justify-center'>
        {post.mediaType === 'video' && post.mediaUrl ? (
          <video
            src={post.mediaUrl}
            controls
            className='w-full h-full object-contain rounded-none'
            style={{ maxHeight: '400px' }}
          />
        ) : post.mediaUrl ? (
          <Image
            src={post.mediaUrl}
            alt={post.title}
            fill
            className='object-cover'
            priority={false}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-400'>
            No media
          </div>
        )}
      </div>
      <h1 className='text-3xl font-bold my-2'>{post.title}</h1>
      <div className='flex items-center gap-4 text-sm text-gray-500 mb-6'>
        <span>By {post.userName || 'Unknown'}</span>
        <span>·</span>
        <span>{post.createdAt?.toLocaleDateString()}</span>
      </div>
      <div className='prose max-w-none'>{post.content}</div>

      {/* Posts recientes */}
      <RecentPostsList posts={recentPosts || []} currentPostId={post.id} />
    </article>
  )
}
