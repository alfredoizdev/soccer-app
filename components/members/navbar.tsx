import Link from 'next/link'
import { logoutAction, userAuth } from '@/lib/actions/auth.action'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { LayoutDashboard, ShieldPlus, UserPlus, Users } from 'lucide-react'

export default async function Navbar() {
  const user = await userAuth()

  return (
    <nav className='bg-white shadow-sm'>
      <div
        className={`w-full flex flex-col sm:flex-row items-center max-w-6xl mx-auto
                    justify-between px-4 sm:px-6 py-3 sm:py-4  gap-2 
                    sm:gap-0 `}
      >
        <Link href='/members/home' className='flex items-center gap-2'>
          <div className='flex items-center gap-2'>
            <span className='font-bold text-xl sm:text-2xl'>⚽</span>
            <span className='font-semibold text-lg sm:text-xl'>
              Soccer Stats
            </span>
          </div>
        </Link>

        <div className='sm:w-auto flex justify-center items-center mt-2 sm:mt-0'>
          {user ? (
            <div className='flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end'>
              {user.role === 'admin' && (
                <Link href='/admin/dashboard' className='text-gray-700'>
                  <LayoutDashboard className='w-6 h-6' />
                </Link>
              )}
              {/* Links de iconos antes del avatar */}
              <Link
                href='/members/join-club'
                className='flex items-center text-gray-700 hover:underline gap-1'
              >
                <ShieldPlus className='w-5 h-5' />
                <span className='hidden sm:inline'>Join Club</span>
              </Link>
              <Link
                href='/members/players/add'
                className='flex items-center text-gray-700 hover:underline gap-1'
              >
                <UserPlus className='w-5 h-5' />
                <span className='hidden sm:inline'>Add Player</span>
              </Link>
              {/* Avatar: centrado en mobile, al final en desktop */}
              <span className='flex justify-center items-center order-2 sm:order-last'>
                <Avatar className='w-14 h-14 border-2 border-gray-300 shadow'>
                  <AvatarImage
                    className='object-cover'
                    src={user.avatar ?? ''}
                    alt={user.name}
                  />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </span>
              {/* Links de iconos después del avatar: order-last en mobile, order-2 en desktop */}
              <Link
                href='/members/players'
                className='flex items-center text-gray-700 hover:underline gap-1 order-last sm:order-2'
              >
                <Users className='w-5 h-5' />
                <span className='hidden sm:inline'>My Players</span>
              </Link>
              <form action={logoutAction} className='order-last sm:order-2'>
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
      </div>
    </nav>
  )
}
