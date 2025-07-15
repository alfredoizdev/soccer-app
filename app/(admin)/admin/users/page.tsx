import UserTable from '@/components/admin/UserTable'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function UsersPage() {
  return (
    <div className='mx-auto py-1'>
      <div className='flex justify-between items-center p-4'>
        <h1 className='text-2xl font-bold'>Users</h1>
        <Link
          href='/admin/users/new'
          className='flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700'
        >
          <PlusIcon className='w-4 h-4' />
          Add User
        </Link>
      </div>
      <div className='p-2'>
        <UserTable />
      </div>
    </div>
  )
}
