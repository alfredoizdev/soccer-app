import { userAuth } from '@/lib/actions/auth.action'
import { getUserAction } from '@/lib/actions/users.action'
import { getPlayersAction } from '@/lib/actions/player.action'
import { getPlayersByOrganizationAction } from '@/lib/actions/player.action'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import { PlayerType } from '@/types/PlayerType'
import PlayersListClient from './PlayersListClient'

interface PlayersListPageProps {
  searchParams: Promise<{ team?: string }>
}

export default async function PlayersListPage({
  searchParams,
}: PlayersListPageProps) {
  const userToken = await userAuth()
  const userRes = await getUserAction(userToken?.id || '')
  const user = userRes?.data?.[0]
  const { team } = await searchParams

  let players: PlayerType[] = []
  const orgMap: Record<string, string> = {}

  if (team) {
    // Si hay un equipo seleccionado, obtener todos los jugadores de ese equipo
    const playersRes = await getPlayersByOrganizationAction(team)
    players = (playersRes.data || []) as PlayerType[]

    // Obtener información del equipo
    const orgRes = await getOrganizationAction(team)
    if (orgRes?.data?.name) {
      orgMap[team] = orgRes.data.name
    }
  } else {
    // Si no hay equipo seleccionado, mostrar solo los jugadores del usuario
    const playersRes = await getPlayersAction()
    players = (playersRes?.data || []).filter(
      (p) => p.userId === user?.id
    ) as PlayerType[]

    // Obtener los clubs de los jugadores (solo los que tienen organizationId)
    const orgIds = Array.from(
      new Set(players.map((p) => p.organizationId).filter(Boolean))
    )
    for (const orgId of orgIds) {
      if (orgId) {
        const orgRes = await getOrganizationAction(orgId)
        if (orgRes?.data?.name) {
          orgMap[orgId] = orgRes.data.name
        }
      }
    }
  }

  return (
    <div className='px-4'>
      <PlayersListClient players={players} orgMap={orgMap} />
    </div>
  )
}
