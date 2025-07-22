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
      <main className='flex-1 flex max-w-6xl mx-auto px-2 sm:px-5 py-5'>
        <div className='w-1/6 min-w-[80px] hidden md:block'>
          <MembersSidebar />
        </div>
        <div className='flex-1'>{children}</div>
        <div className='fixed bottom-0 left-0 right-0 w-full md:hidden'>
          <MembersSidebar />
        </div>
      </main>
      <Footer />
    </>
  )
}
