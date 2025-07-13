import React from 'react'
import DataTablePlayer from '@/components/admin/PlayerTable/DataTablePlayer'
import { getPlayersWithUserAction } from '@/lib/actions/player.action'
import { PlayerType } from '@/types/PlayerType'
import { UserType } from '@/types/UserType'

type PlayerWithUser = PlayerType & {
  user?: Pick<UserType, 'name' | 'lastName'>
}

type RawPlayerWithUser = PlayerType & {
  user: (UserType & { avatar?: string | null }) | null
}

const PlayersPage = async () => {
  const players = await getPlayersWithUserAction()
  // Map user to only include name and lastName, and handle null
  const mappedPlayers: PlayerWithUser[] = (players.data ?? []).map(
    (player: RawPlayerWithUser) => ({
      ...player,
      user: player.user
        ? { name: player.user.name, lastName: player.user.lastName }
        : undefined,
    })
  )

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Players</h1>
      <DataTablePlayer players={mappedPlayers} />
    </div>
  )
}

export default PlayersPage
