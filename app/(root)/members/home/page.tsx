import { Suspense } from 'react'
import MainActionDashboard from '@/components/members/MeinActionDashboard'
import MeinActionDashboardSkeleton from '@/components/members/MeinActionDashboardSkeleton'
import TeamPlayersSection from '@/components/members/TeamPlayersSection'
import TeamPlayersSectionSkeleton from '@/components/members/TeamPlayersSectionSkeleton'
import RecentMatches from '@/components/members/RecentMatches'
import TeamSection from '@/components/members/TeamSection'
import LatestNews from '@/components/members/LatestNews'
import LatestNewsSkeleton from '@/components/members/LatestNewsSkeleton'
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'
import { getPostsAction } from '@/lib/actions/posts.action'
import { userAuth } from '@/lib/actions/auth.action'
import {
  getOrganizationByUserId,
  getOrganizationStatsAction,
} from '@/lib/actions/organization.action'
import { getPlayersByOrganizationAction } from '@/lib/actions/player.action'

export default async function Home() {
  const user = await userAuth()
  if (!user) {
    return <div>Please log in.</div>
  }

  const [matches, postsRes, teamRes] = await Promise.all([
    getAllMatchesWithTeams(),
    getPostsAction(),
    getOrganizationByUserId(user.id),
  ])

  const posts = postsRes.data || []

  // Obtener datos del equipo si el usuario está registrado en uno
  let teamSection = null
  if (teamRes.data) {
    const [statsRes, playersRes] = await Promise.all([
      getOrganizationStatsAction(teamRes.data.id),
      getPlayersByOrganizationAction(teamRes.data.id),
    ])

    teamSection = (
      <div className='w-full mx-auto bg-gray-300/20 pb-[100px] pt-[100px] px-2'>
        <TeamSection
          team={teamRes.data}
          players={playersRes.data || []}
          stats={
            statsRes.data || {
              goalsScored: 0,
              goalsConceded: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              totalMatches: 0,
              players: 0,
            }
          }
          userId={user.id}
        />
      </div>
    )
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <Suspense fallback={<MeinActionDashboardSkeleton />}>
        <MainActionDashboard />
      </Suspense>

      <div className='container mx-auto w-full overflow-hidden py-4 px-2'>
        <RecentMatches matches={matches} />
      </div>

      {teamSection}

      <div className='w-full mx-auto bg-gray-300/20 pb-[100px] pt-[100px] px-2'>
        <Suspense fallback={<LatestNewsSkeleton />}>
          <LatestNews posts={posts} />
        </Suspense>
      </div>

      <div className='container mx-auto w-full py-4'>
        <Suspense fallback={<TeamPlayersSectionSkeleton />}>
          <TeamPlayersSection />
        </Suspense>
      </div>
    </div>
  )
}
