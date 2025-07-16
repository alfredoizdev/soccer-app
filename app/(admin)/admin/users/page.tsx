import UserTable from '@/components/admin/UserTable'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { getUsersPaginatedAction } from '@/lib/actions/users.action'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'

interface UsersPageProps {
  searchParams: { page?: string; perPage?: string }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const page = Number(searchParams?.page) || 1
  const perPage = Number(searchParams?.perPage) || 10
  const { data: users, total } = await getUsersPaginatedAction(page, perPage)
  const totalPages = Math.ceil((total ?? 0) / perPage)

  // Normalizar organizationId: null a undefined para UserType
  const normalizedUsers = (users ?? []).map((user) => ({
    ...user,
    organizationId: user.organizationId ?? undefined,
  }))

  return (
    <div className='mx-auto py-1'>
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
      <div className='p-2'>
        <UserTable data={normalizedUsers} />
        <div className='mt-4 flex justify-end'>
          <Pagination className='justify-end w-auto mx-0'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`?page=${page - 1}&perPage=${perPage}`}
                  aria-disabled={page <= 1}
                  tabIndex={page <= 1 ? -1 : 0}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    href={`?page=${i + 1}&perPage=${perPage}`}
                    isActive={page === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href={
                    page < totalPages
                      ? `?page=${page + 1}&perPage=${perPage}`
                      : `?page=${page}&perPage=${perPage}`
                  }
                  aria-disabled={page >= totalPages}
                  tabIndex={page >= totalPages ? -1 : 0}
                  className={
                    page >= totalPages ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
