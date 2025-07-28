'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, BadgeCheck, Ban, ArrowLeft, Users } from 'lucide-react'
import { deletePlayerAction } from '@/lib/actions/player.action'
import { toast } from 'sonner'
import type { PlayerType } from '@/types/PlayerType'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PlayersListClientProps {
  players: PlayerType[]
  orgMap: Record<string, string>
}

export default function PlayersListClient({
  players: initialPlayers,
  orgMap,
}: PlayersListClientProps) {
  const [players, setPlayers] = useState(initialPlayers)
  const searchParams = useSearchParams()
  const teamId = searchParams.get('team')
  const teamName = teamId ? orgMap[teamId] : null

  const handleDelete = async (playerId: string) => {
    const res = await deletePlayerAction(playerId)
    if (res.success) {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId))
      toast.success('Player deleted')
    } else {
      toast.error(res.error || 'Error deleting player')
    }
  }

  if (players.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full mx-auto pt-9'>
        <h2 className='text-2xl font-bold'>
          {teamName ? `No players in ${teamName}` : 'No players found'}
        </h2>
        <p className='text-gray-500'>
          {teamName
            ? `There are no players registered in ${teamName} at the moment.`
            : 'There are no players registered for the moment.'}
        </p>
        {!teamName && (
          <Button asChild className='mt-4 rounded-none'>
            <Link href='/members/players/add'>Create player</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Header con título y navegación */}
      <div className='mb-8'>
        {teamName ? (
          <div className='flex items-center gap-4 mb-4'>
            <Button asChild variant='ghost' className='p-2'>
              <Link href='/members/players'>
                <ArrowLeft className='w-5 h-5' />
              </Link>
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>{teamName}</h1>
              <p className='text-gray-600'>Team players</p>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>My Players</h1>
              <p className='text-gray-600'>Manage your registered players</p>
            </div>
            <Button asChild className='rounded-none'>
              <Link href='/members/players/add'>Add Player</Link>
            </Button>
          </div>
        )}

        <div className='flex items-center gap-2 text-sm text-gray-500 mb-4'>
          <Users className='w-4 h-4' />
          <span>
            {players.length} player{players.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {players.map((player) => (
          <li
            key={player.id}
            className='flex items-center gap-6 bg-white rounded-xl shadow p-6 relative hover:shadow-lg transition-shadow'
          >
            <Link
              href={`/members/players/${player.id}`}
              className='flex items-center gap-6 flex-1'
            >
              <Image
                src={player.avatar || '/no-profile.webp'}
                alt={player.name}
                width={64}
                height={64}
                className='rounded-full object-cover border w-16 h-16'
              />
              <div className='flex-1'>
                <div>
                  {player.organizationId && orgMap[player.organizationId] ? (
                    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                      <BadgeCheck className='w-4 h-4 text-green-500' />
                      Registered to {orgMap[player.organizationId]}
                    </span>
                  ) : (
                    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500'>
                      <Ban className='w-4 h-4 text-gray-400' />
                      Not registered
                    </span>
                  )}
                </div>
                <div className='font-semibold text-lg flex items-center gap-2'>
                  {player.name} {player.lastName}
                </div>
                <div className='text-gray-500 text-sm'>Age: {player.age}</div>
                {player.jerseyNumber && (
                  <div className='text-gray-400 text-xs'>
                    #{player.jerseyNumber}
                  </div>
                )}
              </div>
            </Link>
            {!teamName && (
              <Button
                variant='ghost'
                className='bg-destructive/20 text-destructive p-2 hover:bg-destructive/30 ml-auto rounded-none'
                size='icon'
                onClick={() => handleDelete(player.id)}
                aria-label='Delete player'
              >
                <Trash2 className='w-5 h-5' />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
