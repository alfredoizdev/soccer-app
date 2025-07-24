import { PostType } from '@/types/PostType'
import PostCard from './PostCard'
import Link from 'next/link'

interface LatestNewsProps {
  posts: PostType[]
}

function LatestNews({ posts }: LatestNewsProps) {
  return (
    <section className='container mx-auto w-full'>
      <div className='flex w-full justify-between items-center mb-6 px-4'>
        <h2 className='text-3xl font-bold'>Latest News</h2>
        <Link
          href='/members/posts'
          className='text-white p-2 bg-gray-700 rounded-null'
        >
          Latest News
          <span aria-hidden>→</span>
        </Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-4 mx-auto'>
        {posts.slice(0, 4).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}

export default LatestNews
