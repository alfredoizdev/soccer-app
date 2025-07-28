import React from 'react'
import { userAuth } from '@/lib/actions/auth.action'
import { getPlayersByOrganizationAction } from '@/lib/actions/player.action'
import { getOrganizationByUserId } from '@/lib/actions/organization.action'
import { Card, CardContent } from '../ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Trophy, UserPlus } from 'lucide-react'

interface TeamPlayer {
  id: string
  name: string
  lastName: string
  age: number
  avatar: string | null
  jerseyNumber: number | null
  position: string
  totalGoals: number
  totalAssists: number
}

export default async function TeamPlayersSection() {
  const user = await userAuth()
  if (!user) return <div>Please log in.</div>

  // Obtener la organización del usuario
  const orgRes = await getOrganizationByUserId(user.id)

  if (!orgRes.data) {
    return (
      <div className='w-full flex flex-col items-center justify-center py-12 px-4 text-gray-500'>
        <Trophy className='w-12 h-12 mb-4 text-gray-400' />
        <h3 className='text-lg font-semibold mb-2'>
          Not registered to any team
        </h3>
        <p className='text-sm text-center mb-4'>
          You need to join a team to see your teammates.
        </p>
        <Link
          href='/members/join-club'
          className='inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors'
        >
          <UserPlus className='w-4 h-4' />
          Join a team
        </Link>
      </div>
    )
  }

  const organization = orgRes.data

  // Obtener todos los jugadores del equipo
  const playersRes = await getPlayersByOrganizationAction(organization.id)
  const players: TeamPlayer[] = (playersRes.data || []).map((player) => ({
    id: player.id,
    name: player.name,
    lastName: player.lastName,
    age: player.age,
    avatar: player.avatar,
    jerseyNumber: player.jerseyNumber,
    position: player.position || '',
    totalGoals: player.totalGoals || 0,
    totalAssists: player.totalAssists || 0,
  }))

  if (players.length === 0) {
    return (
      <div className='w-full flex flex-col items-center justify-center py-12 text-gray-500 px-4'>
        <Users className='w-12 h-12 mb-4 text-gray-400' />
        <h3 className='text-lg font-semibold mb-2'>
          No players in {organization.name}
        </h3>
        <p className='text-sm text-center'>
          There are no players registered in your team yet.
        </p>
      </div>
    )
  }

  return (
    <div className='w-full px-4'>
      <div className='flex items-center justify-between mb-6 px-2'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            {organization.name}
          </h2>
          <p className='text-gray-600'>Your team players</p>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Users className='w-4 h-4' />
          <span>
            {players.length} player{players.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2'>
        {players.map((player) => (
          <Link
            key={player.id}
            href={`/members/players/${player.id}`}
            className='block group'
          >
            <Card className='h-full transition-all duration-300 hover:shadow-lg hover:border-gray-800/50 rounded-none shadow-sm'>
              <CardContent className='p-4 flex flex-col items-center text-center'>
                <div className='relative mb-3'>
                  <Image
                    src={player.avatar || '/no-profile.webp'}
                    alt={`${player.name} ${player.lastName}`}
                    width={80}
                    height={80}
                    className='w-16 h-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-800 transition-colors'
                  />
                  {player.jerseyNumber && (
                    <div className='absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold'>
                      #{player.jerseyNumber}
                    </div>
                  )}
                </div>

                <h3 className='text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors'>
                  {player.name} {player.lastName}
                </h3>

                <div className='text-gray-600 text-sm mb-2'>
                  {player.position?.toUpperCase() || 'N/A'}
                </div>

                <div className='text-gray-500 text-xs mb-2'>
                  Age: {player.age}
                </div>

                <div className='flex items-center gap-4 text-xs text-gray-500 mt-auto'>
                  <div className='flex items-center gap-1'>
                    <span className='font-semibold text-green-600'>
                      {player.totalGoals}
                    </span>
                    <span>Goals</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span className='font-semibold text-gray-700'>
                      {player.totalAssists}
                    </span>
                    <span>Assists</span>
                  </div>
                </div>

                <div className='mt-3 text-gray-700 text-xs font-medium group-hover:text-gray-900 transition-colors'>
                  View profile →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
