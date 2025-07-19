import {
  getPlayersAction,
  getPlayerStatsByPlayerId,
  getPlayerStatsRankingByOrganizationAction,
} from '@/lib/actions/player.action'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  getPlayerMatchesWithStats,
  PlayerMatchWithStats,
} from '@/lib/actions/matches.action'
import PlayerMatchCard from '@/components/members/PlayerMatchCard'
import PlayerMatchesDrawer from '@/components/members/PlayerMatchesDrawer'
import PlayerStatsAdmin from '@/components/admin/PlayerStatsAdmin'
import ClubRanking, { ClubRankingPlayer } from '@/components/ClubRanking'
import ClubTeammates, { ClubTeammate } from '@/components/ClubTeammates'
import PlayerStatsPerformance from '@/components/admin/PlayerStatsBarChart'
import PlayerEfficiencyDonut from '@/components/admin/PlayerEfficiencyDonut'

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

type PlayerStats = {
  goals: number
  assists: number
  passesCompleted: number
  minutesPlayed: number
  goalsAllowed?: number
  goalsSaved?: number
}

// Use ClubRankingPlayer type from ClubRanking

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

  // Fetch ranking for this club
  let ranking: ClubRankingPlayer[] = []
  if (player.organizationId) {
    const rankingRes = await getPlayerStatsRankingByOrganizationAction(
      player.organizationId
    )
    ranking = (rankingRes?.data || []).map((p: unknown) => ({
      ...(p as ClubRankingPlayer),
      goals: Number((p as ClubRankingPlayer).goals ?? 0),
      assists: Number((p as ClubRankingPlayer).assists ?? 0),
      passesCompleted: Number((p as ClubRankingPlayer).passesCompleted ?? 0),

      minutesPlayed: Number((p as ClubRankingPlayer).minutesPlayed ?? 0),
    }))
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
    <>
      <div className='w-full mx-auto p-4'>
        <div className='bg-white w-full p-5 shadow-md rounded-lg'>
          <div className='flex flex-col items-center mt-20 w-full'>
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
          </div>
          {/* Compañeros de club */}
          <div className='w-full mt-8'>
            <ClubTeammates
              teammates={teammates as ClubTeammate[]}
              pathBase='/admin/players/'
            />
          </div>
        </div>
        <section className='w-full mt-10'>
          <PlayerStatsAdmin position={player.position ?? ''} stats={stats} />
          {/* Gráficos de performance y eficiencia juntos */}
          <div className='grid md:grid-cols-2 gap-6'>
            <PlayerStatsPerformance
              goalsPerMatch={
                sortedMatches.length > 0
                  ? stats.goals / sortedMatches.length
                  : 0
              }
              assistsPerMatch={
                sortedMatches.length > 0
                  ? stats.assists / sortedMatches.length
                  : 0
              }
              minutesPerMatch={
                sortedMatches.length > 0
                  ? stats.minutesPlayed / sortedMatches.length
                  : 0
              }
              passesPerMatch={
                sortedMatches.length > 0
                  ? stats.passesCompleted / sortedMatches.length
                  : 0
              }
            />
            <PlayerEfficiencyDonut
              goals={stats.goals}
              assists={stats.assists}
              passesCompleted={stats.passesCompleted}
              minutesPlayed={stats.minutesPlayed}
            />
          </div>
          <div className='mt-10 w-full '>
            <div className='text-lg font-semibold mb-2'>Last Match</div>
            {lastMatch ? (
              <PlayerMatchCard
                team1={{ ...team1, goals: lastMatch.match.team1Goals }}
                team2={{ ...team2, goals: lastMatch.match.team2Goals }}
                stats={lastMatch.stats}
                date={lastMatch.match.date}
                drawerButton={
                  sortedMatches.length > 0 ? (
                    <PlayerMatchesDrawer
                      matches={sortedMatches}
                      trigger={
                        <Button
                          variant='outline'
                          className='bg-blue-200/50 text-blue-700'
                          size='sm'
                        >
                          See all
                        </Button>
                      }
                    />
                  ) : null
                }
              />
            ) : (
              <div className='text-gray-500 text-sm'>No matches found.</div>
            )}
          </div>
          <div className='mt-10 w-full'>
            <ClubRanking ranking={ranking} currentPlayerId={player.id} />
          </div>
        </section>
      </div>
    </>
  )
}
