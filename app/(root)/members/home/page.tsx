import MemberClubWidget from '@/components/members/MemberClubWidget'
import MemberHomeWidgets from '@/components/members/MemberHomeWidgets'
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

  return (
    <div className='flex flex-col items-center w-full max-w-6xl mx-auto p-6 sm:p-10 gap-8'>
      <MemberClubWidget club={club} user={user as UserType} />
      <MemberHomeWidgets />
    </div>
  )
}
