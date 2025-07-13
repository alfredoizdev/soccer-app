'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'
import MobileMenuDrawer from '../MobileMenuDrawer'
import { MENUS_DASHBOARD } from '@/lib/constants'

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
    <nav className='w-full h-16 bg-gray-900 text-white flex items-center px-6 shadow'>
      <MobileMenuDrawer title='Dashboard Menu' menus={MENUS_DASHBOARD} />
      <div className='font-bold text-lg'>SoccerApp Admin</div>
      <div className='ml-auto'>
        <Avatar className='w-10 h-10'>
          <AvatarImage
            className='object-cover'
            src={user.avatar}
            alt={user.name}
          />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  )
}

export default Navbar
