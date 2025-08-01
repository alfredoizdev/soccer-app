import { userAuth } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import Navbar from '@/components/admin/Navbar'
import Sidebar from '@/components/admin/Sidebar'
import GlobalStoreInitializer from '@/components/GlobalStoreInitializer'

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await userAuth()
  if (!user || user.role != 'admin') {
    redirect('/members/home')
  }

  return (
    <div className='min-h-screen flex flex-col ml-0 md:ml-56 md:mt-[65px]'>
      <GlobalStoreInitializer />
      <Navbar user={{ ...user, avatar: user.avatar ?? '' }} />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex-1 bg-gray-100 w-full overflow-hidden'>
          {children}
        </main>
      </div>
    </div>
  )
}
