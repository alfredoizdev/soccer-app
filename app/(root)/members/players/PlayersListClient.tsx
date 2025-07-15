'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, BadgeCheck, Ban } from 'lucide-react'
import { deletePlayerAction } from '@/lib/actions/player.action'
import { toast, Toaster } from 'sonner'
import type { PlayerType } from '@/types/PlayerType'
import Link from 'next/link'

interface PlayersListClientProps {
  players: PlayerType[]
  orgMap: Record<string, string>
}

export default function PlayersListClient({
  players: initialPlayers,
  orgMap,
}: PlayersListClientProps) {
  const [players, setPlayers] = useState(initialPlayers)

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
      <p className='text-gray-500 text-center'>
        You have not registered any players yet.
      </p>
    )
  }

  return (
    <>
      <Toaster position='top-right' richColors />
      <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {players.map((player) => (
          <li
            key={player.id}
            className='flex items-center gap-6 bg-white rounded-xl shadow p-6 relative'
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
              </div>
            </Link>
            <Button
              variant='ghost'
              className='bg-destructive/20 text-destructive p-2 hover:bg-destructive/30 ml-auto'
              size='icon'
              onClick={() => handleDelete(player.id)}
              aria-label='Delete player'
            >
              <Trash2 className='w-5 h-5' />
            </Button>
          </li>
        ))}
      </ul>
    </>
  )
}
