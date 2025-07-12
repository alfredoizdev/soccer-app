import { getUsersWithChildren } from '@/lib/actions/users.action'

export default async function Home() {
  const { data: users, error } = await getUsersWithChildren()

  if (error) {
    return <div className='text-red-500'>Error: {error}</div>
  }

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <h1>Hello World</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  )
}
