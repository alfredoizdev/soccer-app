'use client'
import {
  Calendar,
  Home,
  ShieldPlus,
  UserPlus,
  Users,
  FileText,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function MembersSidebar() {
  const pathname = usePathname()
  return (
    <div className='bg-gray-100 p-4 h-full flex flex-col w-full'>
      <div className='flex flex-row justify-center items-center lg:items-start md:flex-col gap-5 overflow-hidden '>
        <Link
          href='/members/home'
          className={`flex items-center text-gray-700 hover:underline gap-1`}
        >
          {pathname === '/members/home' ? (
            <div className='flex items-center p-2 rounded-md bg-gray-300 text-gray-700 gap-1'>
              <Home className='w-5 h-5' />
              <span className='hidden lg:inline'>Home</span>
            </div>
          ) : (
            <>
              <Home className='w-5 h-5' />
              <span className='hidden lg:inline'>Home</span>
            </>
          )}
        </Link>
        <Link
          href='/members/players'
          className={`flex items-center text-gray-700 hover:underline gap-1 order-last sm:order-2`}
        >
          {pathname === '/members/players' ? (
            <div className='flex items-center p-2 rounded-md bg-gray-300 text-gray-700 gap-1'>
              <Users className='w-5 h-5' />
              <span className='hidden lg:inline'>My Players</span>
            </div>
          ) : (
            <>
              <Users className='w-5 h-5' />
              <span className='hidden lg:inline'>My Players</span>
            </>
          )}
        </Link>
        <Link
          href='/members/join-club'
          className={`flex items-center text-gray-700 hover:underline gap-1`}
        >
          {pathname === '/members/join-club' ? (
            <div className='flex items-center p-2 rounded-md bg-gray-300 text-gray-700 gap-1'>
              <ShieldPlus className='w-5 h-5' />
              <span className='hidden lg:inline'>Join Club</span>
            </div>
          ) : (
            <>
              <ShieldPlus className='w-5 h-5' />
              <span className='hidden lg:inline'>Join Club</span>
            </>
          )}
        </Link>

        <Link
          href='/members/players/add'
          className={`flex items-center text-gray-700 hover:underline gap-1`}
        >
          {pathname === '/members/players/add' ? (
            <div className='flex items-center p-2 rounded-md bg-gray-300 text-gray-700 gap-1'>
              <UserPlus className='w-5 h-5' />
              <span className='hidden lg:inline'>Add Player</span>
            </div>
          ) : (
            <>
              <UserPlus className='w-5 h-5' />
              <span className='hidden lg:inline'>Add Player</span>
            </>
          )}
        </Link>
        <Link
          href='/members/posts'
          className={`flex items-center text-gray-700 hover:underline gap-1`}
        >
          {pathname === '/members/posts' ? (
            <div className='flex items-center p-2 rounded-md bg-gray-300 text-gray-700 gap-1'>
              <FileText className='w-5 h-5' />
              <span className='hidden lg:inline'>Posts</span>
            </div>
          ) : (
            <>
              <FileText className='w-5 h-5' />
              <span className='hidden lg:inline'>Posts</span>
            </>
          )}
        </Link>
        <Link
          href='/members/matches/calendar'
          className={`flex items-center text-gray-700 hover:underline gap-1 order-last sm:order-2`}
        >
          {pathname === '/members/matches/calendar' ? (
            <div className='flex items-center p-2 rounded-md bg-gray-300 text-gray-700 gap-1'>
              <Calendar className='w-5 h-5' />
              <span className='hidden lg:inline'>Matches</span>
            </div>
          ) : (
            <>
              <Calendar className='w-5 h-5' />
              <span className='hidden lg:inline'>Matches</span>
            </>
          )}
        </Link>
      </div>
    </div>
  )
}
