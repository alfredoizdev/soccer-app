export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {/* Layout general para (root) */}
      {children}
    </section>
  )
}
