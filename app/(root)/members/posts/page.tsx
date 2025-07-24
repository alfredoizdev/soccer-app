import PostCard from '@/components/members/PostCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { getPostsAction } from '@/lib/actions/posts.action'

export default async function PostsPage() {
  const { data: posts } = await getPostsAction()

  if (posts.length === 0) {
    return (
      <section className='container mx-auto w-full py-8 h-screen fixed inset-0'>
        <div className='flex flex-col items-center justify-center h-full'>
          <h1 className='text-3xl font-bold'>No posts found</h1>
          <p className='text-gray-500 mb-4'>
            No posts found, please create a new post
          </p>
          <Link href='/members/posts/add' passHref>
            <Button variant='default' className='rounded-none'>
              <PlusIcon />
              Create Post
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className='container mx-auto w-full py-8'>
      <div className='flex w-full justify-between items-center mb-8 px-4'>
        <h1 className='text-3xl font-bold'>All News</h1>
        <Link href='/members/posts/add'>
          <Button variant='default' className='rounded-none'>
            <PlusIcon />
            Create Post
          </Button>
        </Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-4 mx-auto'>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}
