import React from 'react'
import { userAuth } from '@/lib/actions/auth.action'
import { getPlayersAction } from '@/lib/actions/player.action'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import { BadgeCheck, Ban } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import Link from 'next/link'
import { PlayerType } from '@/types/PlayerType'
import Image from 'next/image'

export default async function MemberHomeWidgets() {
  const user = await userAuth()
  if (!user) return <div>Please log in.</div>

  const playersRes = await getPlayersAction()
  const myPlayers: PlayerType[] = (playersRes.data || []).filter(
    (p: PlayerType) => p.userId === user.id
  )

  // Obtener los clubs de los jugadores (solo los que tienen organizationId)
  const orgIds = Array.from(
    new Set(myPlayers.map((p) => p.organizationId).filter(Boolean))
  )
  const orgMap: Record<string, string> = {}
  for (const orgId of orgIds) {
    if (orgId) {
      const orgRes = await getOrganizationAction(orgId)
      if (orgRes?.data?.name) {
        orgMap[orgId] = orgRes.data.name
      }
    }
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>My Players</h3>
        </div>
        {myPlayers.length === 0 ? (
          <div className='text-gray-500'>You have no players yet.</div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {myPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/members/players/${player.id}`}
                className='block'
              >
                <Card className='p-4 flex flex-col items-center gap-2'>
                  <CardContent className='flex flex-col items-center gap-2'>
                    <Image
                      width={100}
                      height={100}
                      src={player.avatar || '/no-profile.webp'}
                      alt={player.name}
                      className='w-20 h-20 rounded-full object-cover border'
                    />
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
                    <div className='font-bold flex items-center gap-2'>
                      {player.name} {player.lastName}
                    </div>
                    <div className='text-gray-600 text-sm'>
                      Age: {player.age}
                    </div>
                    <div className='text-gray-500 text-xs'>
                      Goals: {player.totalGoals ?? 0}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
