import UserTable from '@/components/admin/UserTable'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { getUsersPaginatedAction } from '@/lib/actions/users.action'
import PaginationComponent from '@/components/PaginationComponent'

interface UsersPageProps {
  searchParams: Promise<{ page?: string; perPage?: string }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { page, perPage } = await searchParams
  const { data: users, total } = await getUsersPaginatedAction(
    Number(page),
    Number(perPage)
  )
  const totalPages = Math.ceil((total ?? 0) / (Number(perPage) ?? 10))

  // Normalizar organizationId: null a undefined para UserType
  const normalizedUsers = (users ?? []).map((user) => ({
    ...user,
    organizationId: user.organizationId ?? undefined,
  }))

  return (
    <div className='w-full'>
      <div className='flex justify-between items-center p-4'>
        <h1 className='text-2xl font-bold'>Users</h1>
        <Link
          href='/admin/users/new'
          className='flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700'
        >
          <PlusIcon className='w-4 h-4' />
          Add User
        </Link>
      </div>
      <div className='p-2 w-full'>
        <UserTable data={normalizedUsers} />
        <PaginationComponent
          page={Number(page)}
          perPage={Number(perPage)}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
