import PostForm from '@/components/members/PostForm'
import { userAuth } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'

export default async function AddPostPage() {
  const user = await userAuth()
  if (!user) redirect('/login')

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>Create Post</h1>
      <PostForm mode='create' userId={user.id} />
    </div>
  )
}
