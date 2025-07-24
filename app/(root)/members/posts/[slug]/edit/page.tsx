import { notFound, redirect } from 'next/navigation'
import { getPostBySlug } from '@/lib/actions/posts.action'
import PostForm from '@/components/members/PostForm'
import { userAuth } from '@/lib/actions/auth.action'
import { getUserAction } from '@/lib/actions/users.action'

interface EditPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params
  const { data: post } = await getPostBySlug(slug)
  if (!post) return notFound()

  // Obtener usuario autenticado
  const userToken = await userAuth()
  const userRes = await getUserAction(userToken?.id || '')
  const user = userRes?.data?.[0]

  // Solo el dueño puede editar
  if (!user || user.id !== post.userId) {
    redirect('/members/posts')
  }

  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Edit Post</h1>
      <PostForm
        mode='update'
        initialData={post}
        postId={post.id}
        userId={user.id}
      />
    </div>
  )
}
