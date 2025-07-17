import React from 'react'
import WidgetCard from '@/components/admin/WidgetCard'
import LatestList from '@/components/admin/LatestList'
import Link from 'next/link'
import {
  getUsersCountAction,
  getLatestUsersAction,
} from '@/lib/actions/users.action'
import {
  getOrganizationsCountAction,
  getLatestOrganizationsAction,
} from '@/lib/actions/organization.action'
import {
  getPlayersCountAction,
  getLatestPlayersAction,
} from '@/lib/actions/player.action'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  // Obtener datos reales
  const [
    usersCountRes,
    latestUsersRes,
    orgsCountRes,
    latestOrgsRes,
    playersCountRes,
  ] = await Promise.all([
    getUsersCountAction(),
    getLatestUsersAction(),
    getOrganizationsCountAction(),
    getLatestOrganizationsAction(),
    getPlayersCountAction(),
    getLatestPlayersAction(),
  ])

  const totalUsers = usersCountRes.data || 0
  const totalTeams = orgsCountRes.data || 0
  const totalPlayers = playersCountRes.data || 0
  const latestUsers = latestUsersRes.data || []
  const latestTeams = latestOrgsRes.data || []
  // Si quieres mostrar los últimos jugadores, puedes agregar otro widget/lista

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Admin Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <WidgetCard title='Total Users' value={totalUsers} />
        <WidgetCard title='Total Teams' value={totalTeams} />
        <WidgetCard title='Total Players' value={totalPlayers} />
      </div>
      {/* Enlace temporal para acceder al mockup de stats en tiempo real */}
      <div className='flex flex-col gap-4 justify-center p-4 bg-white rounded-lg shadow-md mb-6'>
        <h2 className='text-lg font-semibold mb-4'>Features</h2>
        <div>
          <Button variant='default' asChild>
            <Link href='/admin/matches/live'>Control match (Mockup)</Link>
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <LatestList title='Latest Users' items={latestUsers} type='user' />
        <LatestList title='Latest Teams' items={latestTeams} type='team' />
      </div>
    </div>
  )
}
