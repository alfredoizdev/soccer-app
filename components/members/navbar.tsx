import Link from 'next/link'
import { logoutAction, userAuth } from '@/lib/actions/auth.action'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { LayoutDashboard } from 'lucide-react'

export default async function Navbar() {
  const user = await userAuth()

  return (
    <nav className='w-full flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white shadow gap-2 sm:gap-0'>
      <div className='flex items-center gap-2'>
        <span className='font-bold text-xl sm:text-2xl'>⚽</span>
        <span className='font-semibold text-lg sm:text-xl'>Soccer Stats</span>
      </div>
      <div className='sm:w-auto flex justify-center items-center mt-2 sm:mt-0'>
        {user ? (
          <div className='flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end'>
            {user.role === 'admin' && (
              <Link href='/admin/dashboard' className='text-gray-700'>
                <LayoutDashboard className='w-6 h-6' />
              </Link>
            )}
            <span className='text-gray-700 truncate max-w-[120px] sm:max-w-none'>
              <Avatar className='w-10 h-10'>
                <AvatarImage
                  className='object-cover'
                  src={user.avatar ?? ''}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </span>
            <form action={logoutAction}>
              <button
                type='submit'
                className='text-red-500 p-2 hover:bg-destructive/20 transition-all duration-300 rounded-md'
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <Link href='/login' className='text-blue-500 hover:underline'>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
