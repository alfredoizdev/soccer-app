import { Suspense } from 'react'
import MainActionDashboard from '@/components/members/MeinActionDashboard'
import MeinActionDashboardSkeleton from '@/components/members/MeinActionDashboardSkeleton'
import SlideLatsMatchResults from '@/components/members/SlideLatsMatchResults'
import SlideLatsMatchResultsSkeleton from '@/components/members/SlideLatsMatchResultsSkeleton'
import LatestNews from '@/components/members/LatestNews'
import { fakePosts } from '@/lib/utils/fakePosts'
import { userAuth } from '@/lib/actions/auth.action'
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'

export default async function Home() {
  const user = await userAuth()
  if (!user) {
    return <div>Please log in.</div>
  }
  const matches = await getAllMatchesWithTeams()

  return (
    <div className='w-full flex flex-col gap-8'>
      <Suspense fallback={<MeinActionDashboardSkeleton />}>
        <MainActionDashboard />
      </Suspense>
      <div className='w-full mx-auto bg-gray-300/20 pb-[100px] pt-[100px] px-2'>
        <LatestNews posts={fakePosts} />
      </div>

      <div className='container mx-auto w-full overflow-hidden'>
        <Suspense fallback={<SlideLatsMatchResultsSkeleton />}>
          <SlideLatsMatchResults matches={matches} />
        </Suspense>
      </div>
    </div>
  )
}
