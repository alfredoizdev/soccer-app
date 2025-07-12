export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className='flex flex-col items-center justify-center min-h-screen'>
      {/* Layout general para (auth) */}
      {children}
    </section>
  )
}
