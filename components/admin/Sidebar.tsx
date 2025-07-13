import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Shield } from 'lucide-react'

const Sidebar = () => {
  return (
    <aside className='hidden md:flex h-full min-h-screen w-56 bg-gray-800 text-white flex-col py-6 px-4 gap-4'>
      <Link
        href='/admin/dashboard'
        className='hover:bg-gray-700 rounded px-3 py-2 flex items-center gap-2'
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </Link>
      <Link
        href='/admin/teams'
        className='hover:bg-gray-700 rounded px-3 py-2 flex items-center gap-2'
      >
        <Shield size={20} />
        <span>Teams</span>
      </Link>
      <Link
        href='/admin/users'
        className='hover:bg-gray-700 rounded px-3 py-2 flex items-center gap-2'
      >
        <Users size={20} />
        <span>Users</span>
      </Link>
    </aside>
  )
}

export default Sidebar
