import TeamTable from '@/components/admin/TeamTable'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function TeamsPage() {
  return (
    <div className='container mx-auto py-10'>
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
      <TeamTable />
    </div>
  )
}
