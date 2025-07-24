import { PostType } from '@/types/PostType'
import Link from 'next/link'
import Image from 'next/image'

interface PostCardProps {
  post: PostType
}

function PostCard({ post }: PostCardProps) {
  return (
    <div className='flex flex-col w-full max-w-sm rounded-none overflow-hidden bg-white shadow-sm'>
      <div className='relative w-full h-40'>
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className='object-cover'
          priority={false}
        />
        {post.tag && (
          <span className='absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
            {post.tag}
          </span>
        )}
      </div>
      <div className='flex flex-col gap-2 p-4'>
        <Link
          href={`/members/posts/${post.id}`}
          className='font-bold text-base leading-tight hover:underline'
        >
          {post.title}
        </Link>
        <p className='text-sm text-gray-600'>{post.summary}</p>
      </div>
    </div>
  )
}

export default PostCard
