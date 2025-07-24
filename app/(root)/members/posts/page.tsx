import { fakePosts } from '@/lib/utils/fakePosts'
import PostCard from '@/components/members/PostCard'

export default function PostsPage() {
  return (
    <section className='container mx-auto w-full py-8'>
      <div className='flex w-full justify-between items-center mb-8 px-4'>
        <h1 className='text-3xl font-bold'>All News</h1>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-4 mx-auto'>
        {fakePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
