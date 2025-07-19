import Footer from '@/components/members/footer'
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
      <main className='flex-1 flex flex-col max-w-6xl mx-auto px-2 sm:px-5 py-5'>
        {children}
      </main>
      <Footer />
    </>
  )
}
