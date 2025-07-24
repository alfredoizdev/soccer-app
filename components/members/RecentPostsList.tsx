import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { PostType } from '@/types/PostType'

interface RecentPostsListProps {
  posts: PostType[]
  currentPostId?: string
}

export default function RecentPostsList({
  posts,
  currentPostId,
}: RecentPostsListProps) {
  // Filtrar el post actual y asegurar mínimo 4 posts
  const filteredPosts = posts
    .filter((post) => post.id !== currentPostId)
    .slice(0, Math.max(4, posts.length))

  if (filteredPosts.length === 0) {
    return null
  }

  return (
    <section className='mt-12'>
      <h2 className='text-2xl font-bold mb-6'>Others posts</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className='bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200'
          >
            <Link href={`/members/posts/${post.slug}`} className='block'>
              {/* Header con avatar y nombre del usuario */}
              <div className='p-4 pb-2'>
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <Avatar className='w-6 h-6'>
                    {post.userAvatar ? (
                      <AvatarImage
                        src={post.userAvatar}
                        alt={post.userName || 'User'}
                        className='object-cover'
                      />
                    ) : (
                      <AvatarFallback className='text-xs bg-gray-200 text-gray-600'>
                        {post.userName ? post.userName[0].toUpperCase() : '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className='truncate'>{post.userName || 'Unknown'}</span>
                </div>
              </div>

              {/* Media */}
              <div className='relative h-48 bg-gray-200'>
                {post.mediaUrl ? (
                  post.mediaType === 'video' ? (
                    <video
                      src={post.mediaUrl}
                      className='w-full h-full object-cover'
                      muted
                      preload='metadata'
                      data-testid='post-video'
                    />
                  ) : (
                    <Image
                      src={post.mediaUrl}
                      alt={post.title}
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
                    />
                  )
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-gray-400 bg-gray-100'>
                    <span className='text-sm'>No media</span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className='p-4 pt-2'>
                <h3 className='font-semibold text-lg mb-2 line-clamp-2 text-gray-900 hover:text-blue-600 transition-colors'>
                  {post.title}
                </h3>
                {post.createdAt && (
                  <div className='text-xs text-gray-400'>
                    {post.createdAt.toLocaleDateString()}
                  </div>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
