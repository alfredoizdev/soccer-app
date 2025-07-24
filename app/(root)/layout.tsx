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
      <div className='flex flex-row min-h-screen w-full pt-10'>
        {/* Sidebar fijo a la izquierda en desktop */}
        <aside className='hidden md:block fixed left-0 top-0 h-screen w-20 lg:w-40 z-40 mt-[90px]'>
          <MembersSidebar />
        </aside>
        {/* Espacio para el sidebar en desktop */}
        <main className='flex-1 w-full ml-0 md:ml-20 lg:ml-40 pt-[70px]'>
          {children}
        </main>
      </div>
      {/* Sidebar móvil fijo abajo */}
      <div className='fixed bottom-0 left-0 right-0 w-full md:hidden z-50'>
        <MembersSidebar />
      </div>
      <Footer />
    </>
  )
}
