import { userAuth } from '@/lib/actions/auth.action'
import { getUserAction } from '@/lib/actions/users.action'
import { getPlayersAction } from '@/lib/actions/player.action'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BadgeCheck, Ban } from 'lucide-react'

export default async function PlayersListPage() {
  const userToken = await userAuth()
  const userRes = await getUserAction(userToken?.id || '')
  const user = userRes?.data?.[0]
  const playersRes = await getPlayersAction()
  const players = (playersRes?.data || []).filter((p) => p.userId === user?.id)

  // Obtener los clubs de los jugadores (solo los que tienen organizationId)
  const orgIds = Array.from(
    new Set(players.map((p) => p.organizationId).filter(Boolean))
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
    <div className='max-w-6xl mx-auto py-12 px-4 sm:px-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4'>
        <h2 className='text-2xl font-bold'>My Players</h2>
        <Link href='/members/players/add'>
          <Button>+ Add Player</Button>
        </Link>
      </div>
      {players.length === 0 ? (
        <p className='text-gray-500 text-center'>
          You have not registered any players yet.
        </p>
      ) : (
        <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {players.map((player) => (
            <li
              key={player.id}
              className='flex items-center gap-6 bg-white rounded-xl shadow p-6'
            >
              <Image
                src={player.avatar || '/no-profile.webp'}
                alt={player.name}
                width={64}
                height={64}
                className='rounded-full object-cover border w-16 h-16'
              />
              <div>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
