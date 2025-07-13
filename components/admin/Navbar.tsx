import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import React from 'react'
import { Menu } from 'lucide-react'

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

const Navbar: React.FC<Props> = async ({ user }) => {
  if (!user) return null

  return (
    <nav className='w-full h-16 bg-gray-900 text-white flex items-center px-6 shadow'>
      <button className='md:hidden mr-4 p-2 rounded hover:bg-gray-800 focus:outline-none'>
        <Menu size={24} />
      </button>
      <div className='font-bold text-lg'>SoccerApp Admin</div>
      <div className='ml-auto'>
        <Avatar>
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  )
}

export default Navbar
