import { Suspense } from 'react'
import MainActionDashboard from '@/components/members/MeinActionDashboard'
import MeinActionDashboardSkeleton from '@/components/members/MeinActionDashboardSkeleton'
import SlideLatsMatchResults from '@/components/members/SlideLatsMatchResults'
import SlideLatsMatchResultsSkeleton from '@/components/members/SlideLatsMatchResultsSkeleton'
import LatestNews from '@/components/members/LatestNews'
import LatestNewsSkeleton from '@/components/members/LatestNewsSkeleton'
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'
import { getPostsAction } from '@/lib/actions/posts.action'
import { userAuth } from '@/lib/actions/auth.action'

export default async function Home() {
  const user = await userAuth()
  if (!user) {
    return <div>Please log in.</div>
  }
  const matches = await getAllMatchesWithTeams()
  const postsRes = await getPostsAction()
  const posts = postsRes.data || []

  return (
    <div className='w-full flex flex-col gap-8'>
      <Suspense fallback={<MeinActionDashboardSkeleton />}>
        <MainActionDashboard />
      </Suspense>
      <div className='w-full mx-auto bg-gray-300/20 pb-[100px] pt-[100px] px-2'>
        <Suspense fallback={<LatestNewsSkeleton />}>
          <LatestNews posts={posts} />
        </Suspense>
      </div>

      <div className='container mx-auto w-full overflow-hidden'>
        <Suspense fallback={<SlideLatsMatchResultsSkeleton />}>
          <SlideLatsMatchResults matches={matches} />
        </Suspense>
      </div>
    </div>
  )
}
