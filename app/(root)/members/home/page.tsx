import MemberClubWidget from '@/components/members/MemberClubWidget'
import MemberHomeWidgets from '@/components/members/MemberHomeWidgets'
import PreviewMatches from '@/components/members/PreviewMatches'
import { getActiveMatchesWithTeams } from '@/lib/actions/matches.action'
import { userAuth } from '@/lib/actions/auth.action'
import { getOrganizationByUserId } from '@/lib/actions/organization.action'
import { UserType } from '@/types/UserType'

export default async function Home() {
  const user = await userAuth()
  if (!user) {
    return <div>Please log in.</div>
  }
  const clubsRes = await getOrganizationByUserId(user.id)
  const club = clubsRes.data
  const matches = await getActiveMatchesWithTeams()

  return (
    <div className='w-full flex flex-col gap-8'>
      <div className='flex gap-4 w-full flex-col md:flex-row'>
        <MemberClubWidget club={club} user={user as UserType} />
        <PreviewMatches matches={matches} />
      </div>
      <MemberHomeWidgets />
    </div>
  )
}
