import React from 'react'
import DataTablePlayer from '@/components/admin/PlayerTable/DataTablePlayer'
import { getPlayersWithUserAction } from '@/lib/actions/player.action'
import { PlayerType } from '@/types/PlayerType'
import { UserType } from '@/types/UserType'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

type PlayerWithUser = PlayerType & {
  user?: Pick<UserType, 'name' | 'lastName'>
}

const PlayersPage = async () => {
  const players = await getPlayersWithUserAction()
  // Map user to only include name and lastName, and handle null
  const mappedPlayers: PlayerWithUser[] = (players.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (player: any) => ({
      ...player,
      user: player.user
        ? { name: player.user.name, lastName: player.user.lastName }
        : undefined,
    })
  )

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
    </div>
  )
}

export default PlayersPage
