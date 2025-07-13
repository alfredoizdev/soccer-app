import { userAuth } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import Navbar from '@/components/admin/Navbar'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await userAuth()
  if (!user || user.role != 'admin') {
    redirect('/members/home')
  }

  console.log(user)

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar user={{ ...user, avatar: user.avatar ?? '' }} />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex-1 bg-gray-100 p-2'>{children}</main>
      </div>
    </div>
  )
}
