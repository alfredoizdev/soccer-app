//import TeamTable from '@/components/admin/TeamTable'
import { getOrganizationsAction } from '@/lib/actions/organization.action'
import Image from 'next/image'
import { PlusIcon, TrashIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import { UpdateTeamDrawer } from './UpdateTeamDrawer'

export default async function TeamsPage() {
  const { data, error } = await getOrganizationsAction()

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!data) {
    return <div>No data</div>
  }

  return (
    <div className='p-4 animate-fade-in duration-500'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Teams</h1>

        <Link
          href='/admin/teams/new'
          className='flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700'
        >
          <PlusIcon className='w-4 h-4' />
          Add Team
        </Link>
      </div>
      {/* <TeamTable /> */}
      <div className='w-full flex flex-wrap gap-4 justify-center items-center mt-10 px-4'>
        {data?.map((team) => (
          <div
            key={team.id}
            className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex flex-col items-center mb-4'
          >
            <div className='bg-white rounded-md shadow-md p-2 flex flex-col items-center'>
              <Link className='' href={`/admin/teams/${team.id}`}>
                <Image
                  src={team.avatar || '/no-club.jpg'}
                  alt={team.name}
                  width={60}
                  height={60}
                  className='w-50 h-50 object-contain rounded-full'
                />
              </Link>
              <h2 className='text-lg font-bold my-2'>{team.name}</h2>
              <hr className='w-full' />
              <div className='flex gap-2 justify-center items-center w-full mt-2'>
                <UpdateTeamDrawer team={team} />
                <Button variant='outline' size='icon' asChild>
                  <Link href={`/admin/teams/${team.id}`}>
                    <UsersIcon className='w-4 h-4' />
                  </Link>
                </Button>
                <Button variant='outline' size='icon'>
                  <TrashIcon className='w-4 h-4' />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
