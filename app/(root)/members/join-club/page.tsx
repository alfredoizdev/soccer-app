import JoinClub from '@/components/members/JoinClub'
import {
  getOrganizationsAction,
  getOrganizationByUserId,
  getOrganizationStatsAction,
} from '@/lib/actions/organization.action'
import { userAuth } from '@/lib/actions/auth.action'
import { getUserAction } from '@/lib/actions/users.action'
import { getPlayersByOrganizationAction } from '@/lib/actions/player.action'
import { PlayerType } from '@/types/PlayerType'

export default async function JoinClubPage() {
  const userToken = await userAuth()
  const [clubsRes, userRes, teamRes] = await Promise.all([
    getOrganizationsAction(),
    getUserAction(userToken?.id || ''),
    getOrganizationByUserId(userToken?.id || ''),
  ])

  // Obtener datos del equipo si el usuario está registrado en uno
  let teamStats = null
  let teamPlayers: PlayerType[] = []

  if (teamRes.data) {
    const [statsRes, playersRes] = await Promise.all([
      getOrganizationStatsAction(teamRes.data.id),
      getPlayersByOrganizationAction(teamRes.data.id),
    ])

    teamStats = statsRes.data
    teamPlayers = playersRes.data || []
  }

  return (
    <JoinClub
      clubs={clubsRes.data || []}
      userId={userRes?.data?.[0]?.id || ''}
      organizationId={userRes?.data?.[0]?.organizationId || ''}
      team={teamRes.data}
      teamStats={teamStats}
      teamPlayers={teamPlayers}
    />
  )
}
