import {
  getPlayersAction,
  getPlayerStatsByPlayerId,
} from '@/lib/actions/player.action'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  getPlayerMatchesWithStats,
  PlayerMatchWithStats,
} from '@/lib/actions/matches.action'
import PlayerMatchCard from '@/components/members/PlayerMatchCard'
import PlayerMatchesDrawer from '@/components/members/PlayerMatchesDrawer'
import PlayerStatsAdmin from '@/components/admin/PlayerStatsAdmin'

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

type PlayerStats = {
  goals: number
  assists: number
  passesCompleted: number
  duelsWon: number
  duelsLost: number
  minutesPlayed: number
  goalsAllowed?: number
  goalsSaved?: number
}

export default async function PlayerDetailAdminPage({
  params,
}: PlayerDetailPageProps) {
  const { id } = await params
  const playersRes = await getPlayersAction()
  const players = playersRes?.data || []
  const player = players.find((p) => p.id === id)

  if (!player) return notFound()

  let orgName = ''
  if (player.organizationId) {
    const orgRes = await getOrganizationAction(player.organizationId)
    orgName = orgRes?.data?.name || ''
  }

  // Compañeros de club (excluyendo al jugador actual)
  const teammates = players.filter(
    (p) => p.organizationId === player.organizationId && p.id !== player.id
  )

  const statsRes = await getPlayerStatsByPlayerId(player.id)
  const stats: PlayerStats = {
    goals: Number(statsRes?.data?.goals ?? 0),
    assists: Number(statsRes?.data?.assists ?? 0),
    passesCompleted: Number(statsRes?.data?.passesCompleted ?? 0),
    duelsWon: Number(statsRes?.data?.duelsWon ?? 0),
    duelsLost: Number(statsRes?.data?.duelsLost ?? 0),
    minutesPlayed: Number(statsRes?.data?.minutesPlayed ?? 0),
    goalsAllowed: Number(statsRes?.data?.goalsAllowed ?? 0),
    goalsSaved: Number(statsRes?.data?.goalsSaved ?? 0),
  }

  // Obtener los matches y stats del jugador
  const matchesWithStats: PlayerMatchWithStats[] =
    await getPlayerMatchesWithStats(player.id)
  // Ordenar por fecha descendente (más reciente primero)
  const sortedMatches = matchesWithStats.sort(
    (a, b) =>
      new Date(b.match.date).getTime() - new Date(a.match.date).getTime()
  )
  const lastMatch = sortedMatches[0]

  // Obtener datos reales de los equipos para el último partido
  let team1 = { name: '', avatar: '/no-profile.webp' }
  let team2 = { name: '', avatar: '/no-profile.webp' }
  if (lastMatch) {
    const [team1Res, team2Res] = await Promise.all([
      getOrganizationAction(lastMatch.match.team1Id),
      getOrganizationAction(lastMatch.match.team2Id),
    ])
    team1 = {
      name: team1Res?.data?.name || '',
      avatar: team1Res?.data?.avatar || '/no-profile.webp',
    }
    team2 = {
      name: team2Res?.data?.name || '',
      avatar: team2Res?.data?.avatar || '/no-profile.webp',
    }
  }

  return (
    <div className='flex flex-col md:flex-row gap-8 min-h-screen'>
      {/* ASIDE: Info principal del jugador */}
      <aside className='md:w-1/3 w-full flex flex-col items-center md:items-center justify-center bg-white rounded-lg p-6 md:min-h-screen'>
        <Image
          src={player.avatar || '/no-profile.webp'}
          alt={player.name}
          width={96}
          height={96}
          className='rounded-full border object-cover w-24 h-24 mb-4'
        />
        <h1 className='text-3xl font-bold mb-1 text-center'>
          {player.name} {player.lastName}
        </h1>
        {orgName && (
          <div className='text-green-700 font-medium text-lg mb-1 text-center'>
            {orgName}
          </div>
        )}
        <div className='text-sm text-gray-500 mb-1 text-center'>
          # {player.jerseyNumber}
        </div>
        <div className='text-sm text-gray-500 mb-2 text-center'>
          {player.position?.toUpperCase() ?? ''}
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <section className='md:w-2/3 w-full flex flex-col gap-6 max-w-xl p-0 md:p-6 px-2'>
        <PlayerStatsAdmin position={player.position ?? ''} stats={stats} />

        {teammates.length > 0 && (
          <div className='mb-6'>
            <div className='text-sm font-semibold mb-2'>
              Other players in this club:
            </div>
            <div className='flex -space-x-3'>
              {teammates.map((tm) => (
                <Link key={tm.id} href={`/admin/players/${tm.id}`}>
                  <Image
                    src={tm.avatar || '/no-profile.webp'}
                    alt={tm.name}
                    width={40}
                    height={40}
                    className='rounded-full border-2 border-white object-cover w-10 h-10 hover:scale-110 transition-transform'
                    title={`${tm.name} ${tm.lastName}`}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Último partido y Drawer */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-lg font-semibold'>Last Match</div>
            {sortedMatches.length > 0 && (
              <PlayerMatchesDrawer
                matches={sortedMatches}
                trigger={
                  <Button variant='default' size='sm'>
                    See all
                  </Button>
                }
              />
            )}
          </div>
          {lastMatch ? (
            <PlayerMatchCard
              team1={{ ...team1, goals: lastMatch.match.team1Goals }}
              team2={{ ...team2, goals: lastMatch.match.team2Goals }}
              stats={lastMatch.stats}
              date={lastMatch.match.date}
            />
          ) : (
            <div className='text-gray-500 text-sm'>No matches found.</div>
          )}
        </div>
      </section>
    </div>
  )
}
