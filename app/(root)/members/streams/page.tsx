import { Suspense } from 'react'
import { getActiveStreamingSessions } from '@/lib/actions/streaming.action'
import { userAuth } from '@/lib/actions/auth.action'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ActiveStreamsClient from './ActiveStreamsClient'

export default async function StreamsPage() {
  const user = await userAuth()
  if (!user) {
    return <div>Please log in.</div>
  }

  const activeSessions = await getActiveStreamingSessions()

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8'>Live Streams</h1>

      <Suspense fallback={<StreamsSkeleton />}>
        <ActiveStreamsClient sessions={activeSessions} />
      </Suspense>
    </div>
  )
}

function StreamsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[1, 2, 3].map((i) => (
        <Card key={i} className='p-6 rounded-none'>
          <Skeleton className='h-4 w-3/4 mb-2' />
          <Skeleton className='h-3 w-1/2 mb-4' />
          <Skeleton className='h-32 w-full mb-4' />
          <Skeleton className='h-10 w-full' />
        </Card>
      ))}
    </div>
  )
}
