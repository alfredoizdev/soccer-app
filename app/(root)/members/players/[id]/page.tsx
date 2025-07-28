import { getPlayersAction } from '@/lib/actions/player.action'
import { getOrganizationAction } from '@/lib/actions/organization.action'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PlayerStatsChart from '@/components/admin/PlayerStatsChart'
import { getPlayerStatsByPlayerId } from '@/lib/actions/player.action'
import {
  getPlayerMatchesWithStats,
  PlayerMatchWithStats,
} from '@/lib/actions/matches.action'
import PlayerMatchesDrawer from '@/components/members/PlayerMatchesDrawer'
import PlayerMatchCard from '@/components/members/PlayerMatchCard'
import PlayerProgressIndicators from '@/components/members/PlayerProgressIndicators'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Trophy,
  Target,
  Zap,
  Clock,
  Users,
  MapPin,
  ArrowRight,
  Shield,
} from 'lucide-react'

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

type PlayerStats = {
  goals: number
  assists: number
  passesCompleted: number
  minutesPlayed: number
}

export default async function PlayerDetailPage({
  params,
}: PlayerDetailPageProps) {
  const { id } = await params
  const playersRes = await getPlayersAction()
  const players = playersRes?.data || []
  const player = players.find((p) => p.id === id)

  if (!player) return notFound()

  let orgName = ''
  let orgAvatar = '/no-profile.webp'
  if (player.organizationId) {
    const orgRes = await getOrganizationAction(player.organizationId)
    orgName = orgRes?.data?.name || ''
    orgAvatar = orgRes?.data?.avatar || '/no-profile.webp'
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

  // Calcular porcentajes para los indicadores de progreso
  // Conversion Rate: Goles por partido (promedio de goles en 90 minutos)
  const matchesPlayed = Math.max(stats.minutesPlayed / 90, 1)
  const conversionRate = Math.min((stats.goals / matchesPlayed) * 20, 100) // Factor de 20 para hacer el porcentaje más realista

  // Passing Rate: Porcentaje de pases completados (asumiendo que tenemos pases totales)
  // Como no tenemos pases totales, usamos un cálculo basado en minutos jugados
  const passingRate = Math.min(
    (stats.passesCompleted / (stats.minutesPlayed * 0.8)) * 100,
    100
  ) // 0.8 pases por minuto como base

  // Obtener posición del jugador
  const getPositionDisplay = (position: string) => {
    const positions: { [key: string]: string } = {
      goalkeeper: 'GOALKEEPER',
      defender: 'DEFENDER',
      midfielder: 'MIDFIELDER',
      forward: 'FORWARD',
      winger: 'WINGER',
      striker: 'STRIKER',
    }
    return positions[position.toLowerCase()] || position.toUpperCase()
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header con foto prominente y información básica */}
      <div className='bg-white rounded-none shadow-lg p-8 mb-8'>
        <div className='flex flex-col lg:flex-row gap-8 items-start'>
          {/* Foto prominente del jugador */}
          <div className='flex-shrink-0'>
            <div className='relative'>
              <Image
                src={player.avatar || '/no-profile.webp'}
                alt={player.name}
                width={300}
                height={300}
                className='rounded-2xl object-cover w-80 h-80 border-4 border-gray-100 shadow-xl'
              />
              <div className='absolute -bottom-4 -right-4 bg-gray-800 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg'>
                #{player.jerseyNumber}
              </div>
            </div>
          </div>

          {/* Información del jugador */}
          <div className='flex-1 space-y-6'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                #{player.jerseyNumber} {player.name} {player.lastName}
              </h1>
              <div className='text-lg text-gray-600 font-medium'>
                {getPositionDisplay(player.position)}
              </div>
            </div>

            <div className='text-gray-600 text-lg leading-relaxed'>
              {player.name} {player.lastName} is one of the most promising
              players in the league. With exceptional skills and dedication, he
              continues to impress with every match.
            </div>

            <div className='flex items-center gap-4'>
              <Button className='bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-none font-semibold'>
                Read More
                <ArrowRight className='ml-2 w-4 h-4' />
              </Button>
              {orgName && (
                <div className='flex items-center gap-3 text-gray-600'>
                  <Image
                    src={orgAvatar}
                    alt={orgName}
                    width={24}
                    height={24}
                    className='rounded-full object-cover w-6 h-6'
                  />
                  <span className='font-medium'>{orgName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Indicadores de progreso */}
          <PlayerProgressIndicators
            conversionRate={conversionRate}
            passingRate={passingRate}
          />
        </div>
      </div>

      {/* Estadísticas del jugador */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <Card className='shadow-lg rounded-none'>
          <CardContent className='p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
              <Trophy className='w-6 h-6 text-yellow-600' />
              Statistics Player
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                  <Shield className='w-5 h-5 text-gray-500' />
                  <span className='font-medium text-gray-700'>Club</span>
                </div>
                <div className='flex items-center gap-2'>
                  {orgAvatar !== '/no-profile.webp' && (
                    <Image
                      src={orgAvatar}
                      alt={orgName || 'Club'}
                      width={20}
                      height={20}
                      className='rounded-full object-cover w-5 h-5'
                    />
                  )}
                  <span className='text-gray-900 font-semibold'>
                    {orgName || 'No Club'}
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                  <Users className='w-5 h-5 text-gray-500' />
                  <span className='font-medium text-gray-700'>Appearances</span>
                </div>
                <span className='text-gray-900 font-semibold'>
                  {sortedMatches.length}
                </span>
              </div>

              <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                  <Target className='w-5 h-5 text-gray-500' />
                  <span className='font-medium text-gray-700'>Goals</span>
                </div>
                <span className='text-gray-900 font-semibold'>
                  {stats.goals}
                </span>
              </div>

              <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                  <Zap className='w-5 h-5 text-gray-500' />
                  <span className='font-medium text-gray-700'>Assists</span>
                </div>
                <span className='text-gray-900 font-semibold'>
                  {stats.assists}
                </span>
              </div>

              <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                  <Clock className='w-5 h-5 text-gray-500' />
                  <span className='font-medium text-gray-700'>
                    Minutes played
                  </span>
                </div>
                <span className='text-gray-900 font-semibold'>
                  {stats.minutesPlayed}
                </span>
              </div>

              <div className='flex items-center justify-between py-2'>
                <div className='flex items-center gap-3'>
                  <MapPin className='w-5 h-5 text-gray-500' />
                  <span className='font-medium text-gray-700'>Position</span>
                </div>
                <span className='text-gray-900 font-semibold'>
                  {getPositionDisplay(player.position)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de estadísticas */}
        <Card className='shadow-lg rounded-none'>
          <CardContent className='p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>
              Performance Chart
            </h3>
            <PlayerStatsChart
              goals={stats.goals}
              assists={stats.assists}
              passesCompleted={stats.passesCompleted}
            />
          </CardContent>
        </Card>
      </div>

      {/* Compañeros de equipo */}
      {teammates.length > 0 && (
        <Card className='mt-8 shadow-lg rounded-none'>
          <CardContent className='p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Teammates</h3>
            <div className='flex flex-wrap gap-3'>
              {teammates.map((tm) => (
                <Link key={tm.id} href={`/members/players/${tm.id}`}>
                  <div className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors'>
                    <Image
                      src={tm.avatar || '/no-profile.webp'}
                      alt={tm.name}
                      width={40}
                      height={40}
                      className='rounded-full object-cover w-10 h-10'
                    />
                    <div>
                      <div className='font-medium text-gray-900'>
                        {tm.name} {tm.lastName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        #{tm.jerseyNumber}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Último partido */}
      <Card className='mt-8 shadow-lg rounded-none'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xl font-bold text-gray-900'>Last Match</h3>
            {sortedMatches.length > 0 && (
              <PlayerMatchesDrawer
                matches={sortedMatches}
                trigger={
                  <Button variant='outline' size='sm' className='rounded-none'>
                    See all matches
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
            <div className='text-gray-500 text-center py-8'>
              No matches found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
