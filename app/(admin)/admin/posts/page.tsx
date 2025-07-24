import React from 'react'
import { DataTablePost } from '@/components/admin/PostTable'
import { getPostsPaginatedAdminAction } from '@/lib/actions/posts.action'
import PaginationComponent from '@/components/PaginationComponent'

interface PostsPageProps {
  searchParams: Promise<{ page?: string; perPage?: string }>
}

export default async function PostsAdminPage({ searchParams }: PostsPageProps) {
  const { page, perPage } = await searchParams
  const { data: posts, total } = await getPostsPaginatedAdminAction(
    Number(page) || 1,
    Number(perPage) || 10
  )
  const totalPages = Math.ceil((total ?? 0) / (Number(perPage) || 10))

  return (
    <div className='w-full p-2 mt-5 animate-fade-in duration-500'>
      <h1 className='text-2xl font-bold mb-4'>Posts</h1>
      <DataTablePost posts={posts} />
      <PaginationComponent
        page={Number(page) || 1}
        perPage={Number(perPage) || 10}
        totalPages={totalPages}
      />
    </div>
  )
}
