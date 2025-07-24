import { fakePosts } from '@/lib/utils/fakePosts'
import { notFound } from 'next/navigation'
import Image from 'next/image'

interface PostDetailPageProps {
  params: { id: string }
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const post = fakePosts.find((p) => p.id === params.id)
  if (!post) return notFound()

  return (
    <article className='max-w-2xl mx-auto py-10 px-4'>
      <div className='relative w-full h-64 mb-6 rounded-lg overflow-hidden'>
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
      <h1 className='text-3xl font-bold mb-2'>{post.title}</h1>
      <div className='flex items-center gap-4 text-sm text-gray-500 mb-6'>
        <span>By {post.author}</span>
        <span>·</span>
        <span>{post.createdAt}</span>
      </div>
      <div className='prose max-w-none'>{post.content}</div>
    </article>
  )
}
