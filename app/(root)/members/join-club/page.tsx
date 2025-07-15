import JoinClub from '@/components/members/JoinClub'
import { getOrganizationsAction } from '@/lib/actions/organization.action'
import { userAuth } from '@/lib/actions/auth.action'
import { getUserAction } from '@/lib/actions/users.action'

export default async function JoinClubPage() {
  const userToken = await userAuth()
  const [clubsRes, userRes] = await Promise.all([
    getOrganizationsAction(),
    getUserAction(userToken?.id || ''),
  ])

  return (
    <JoinClub
      clubs={clubsRes.data || []}
      userId={userRes?.data?.[0]?.id || ''}
      organizationId={userRes?.data?.[0]?.organizationId || ''}
    />
  )
}
