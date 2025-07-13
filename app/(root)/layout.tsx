import Footer from '@/components/members/footer'
import Navbar from '@/components/members/navbar'
import { userAuth } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'

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
      <main className='flex-1 flex flex-col'>{children}</main>
      <Footer />
    </>
  )
}
