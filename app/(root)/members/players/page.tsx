import { userAuth } from '@/lib/actions/auth.action'
import { getUserAction } from '@/lib/actions/users.action'
import { getPlayersAction } from '@/lib/actions/player.action'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import { PlayerType } from '@/types/PlayerType'
import PlayersListClient from './PlayersListClient'

export default async function PlayersListPage() {
  const userToken = await userAuth()
  const userRes = await getUserAction(userToken?.id || '')
  const user = userRes?.data?.[0]
  const playersRes = await getPlayersAction()
  const players = (playersRes?.data || []).filter(
    (p: PlayerType) => p.userId === user?.id
  )

  // Obtener los clubs de los jugadores (solo los que tienen organizationId)
  const orgIds = Array.from(
    new Set(players.map((p) => p.organizationId).filter(Boolean))
  )
  const orgMap: Record<string, string> = {}
  for (const orgId of orgIds) {
    if (orgId) {
      const orgRes = await getOrganizationAction(orgId)
      if (orgRes?.data?.name) {
        orgMap[orgId] = orgRes.data.name
      }
    }
  }

  return (
    <div className='px-4'>
      <PlayersListClient players={players} orgMap={orgMap} />
    </div>
  )
}
