import Footer from '@/components/members/footer'
import MembersSidebar from '@/components/members/MembersSidebar'
import Navbar from '@/components/members/navbar'
import { userAuth } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'

// Force dynamic rendering for root routes
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await userAuth()
  if (!user) {
    redirect('/login')
  }
  return (
    <>
      <Navbar />
      <main className='flex max-w-screen-xl mx-auto w-full min-h-[80vh]'>
        <div className='w-56 pl-2 hidden md:block'>
          <MembersSidebar />
        </div>
        <div className='flex-1 w-full px-2 md:px-4'>{children}</div>
      </main>
      <div className='fixed bottom-0 left-0 right-0 w-full md:hidden'>
        <MembersSidebar />
      </div>
      <Footer />
    </>
  )
}
