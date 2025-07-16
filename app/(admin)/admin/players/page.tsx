import React from 'react'
import DataTablePlayer from '@/components/admin/PlayerTable/DataTablePlayer'
import { getPlayersPaginatedAction } from '@/lib/actions/player.action'
import { PlayerType } from '@/types/PlayerType'
import { UserType } from '@/types/UserType'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'

type PlayerWithUser = PlayerType & {
  user?: Pick<UserType, 'name' | 'lastName'>
}

interface PlayersPageProps {
  searchParams: { page?: string; perPage?: string }
}

const PlayersPage = async ({ searchParams }: PlayersPageProps) => {
  const page = Number(searchParams?.page) || 1
  const perPage = Number(searchParams?.perPage) || 10

  const { data: players, total } = await getPlayersPaginatedAction(
    page,
    perPage
  )

  // Map user to only include name and lastName, and handle null
  const mappedPlayers: PlayerWithUser[] = (players ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (player: any) => ({
      ...player,
      user: player.user
        ? { name: player.user.name, lastName: player.user.lastName }
        : undefined,
    })
  )

  const totalPages = Math.ceil((total ?? 0) / perPage)

  return (
    <div className='w-full p-2'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold'>Players</h1>
        <Link
          href='/admin/players/new'
          className='flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition'
        >
          <PlusIcon className='w-4 h-4' />
          Add Player
        </Link>
      </div>
      <DataTablePlayer players={mappedPlayers} />
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
  )
}

export default PlayersPage
