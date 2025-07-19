'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'
import MobileMenuDrawer from '../MobileMenuDrawer'
import { MENUS_DASHBOARD } from '@/lib/constants'
import Link from 'next/link'

interface Props {
  user: {
    id: string
    name: string
    lastName: string
    email: string
    role: 'admin' | 'user'
    avatar: string
  }
}

const Navbar: React.FC<Props> = ({ user }) => {
  if (!user) return null

  return (
    <nav className='w-full h-14 sm:h-16 bg-gray-900 text-white flex items-center px-3 sm:px-6 shadow md:fixed top-0 left-0 z-50'>
      <MobileMenuDrawer title='Dashboard Menu' menus={MENUS_DASHBOARD} />
      <div className='font-bold text-base sm:text-lg truncate'>
        SoccerApp Admin
      </div>
      <div className='ml-auto'>
        <Link href={`/admin/users/${user.id}`}>
          <Avatar className='w-8 h-8 sm:w-10 sm:h-10'>
            <AvatarImage
              className='object-cover'
              src={user.avatar}
              alt={user.name}
            />
            <AvatarFallback className='text-xs sm:text-sm'>
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
