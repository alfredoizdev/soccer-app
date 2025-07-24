import { PostType } from '@/types/PostType'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface PostCardProps {
  post: PostType
}

function PostCard({ post }: PostCardProps) {
  return (
    <div className='flex flex-col w-full max-w-sm rounded-none overflow-hidden bg-white shadow-sm'>
      {/* Header con avatar y nombre de usuario */}
      <div className='flex items-center gap-2 p-3 border-b border-gray-100 bg-gray-50'>
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
      </div>
      <div className='relative w-full h-40 bg-gray-100 flex items-center justify-center'>
        {post.mediaType === 'video' && post.mediaUrl ? (
          <video
            src={post.mediaUrl}
            controls
            className='w-full h-full object-cover rounded-none'
            style={{ maxHeight: '160px' }}
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
      <div className='flex flex-col gap-2 p-4'>
        <Link
          href={`/members/posts/${post.slug}`}
          className='font-bold text-base leading-tight hover:underline'
        >
          {post.title}
        </Link>
        <p className='text-sm text-gray-600'>{post.content}</p>
      </div>
    </div>
  )
}

export default PostCard
