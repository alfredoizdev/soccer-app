import {
  getMatchWithPlayers,
  getMatchPlayerStats,
} from '@/lib/actions/matches.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DataTableMatchPlayerStats,
  MatchPlayerStats,
} from '@/components/admin/MatchPlayerStatsTable'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils/formatDate'
import Image from 'next/image'
import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

interface MatchDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MatchDetailPage({
  params,
}: MatchDetailPageProps) {
  const { id } = await params

  const matchRes = await getMatchWithPlayers(id)
  const statsRes = await getMatchPlayerStats(id)

  if (!matchRes) return notFound()

  const match = matchRes
  const playerStats = statsRes || []

  // Agrupar estadísticas por equipo
  const team1Stats = playerStats.filter((stat) =>
    match.playersTeam1.some((player) => player.id === stat.playerId)
  )
  const team2Stats = playerStats.filter((stat) =>
    match.playersTeam2.some((player) => player.id === stat.playerId)
  )

  // Calcular totales por equipo
  // Si no hay jugadores registrados, usar los goles del marcador del partido
  const team1Totals = {
    goals:
      team1Stats.length > 0
        ? team1Stats.reduce((sum, stat) => sum + stat.goals, 0)
        : match.team1Goals || 0,
    assists: team1Stats.reduce((sum, stat) => sum + stat.assists, 0),
    passesCompleted: team1Stats.reduce(
      (sum, stat) => sum + stat.passesCompleted,
      0
    ),
  }

  const team2Totals = {
    goals:
      team2Stats.length > 0
        ? team2Stats.reduce((sum, stat) => sum + stat.goals, 0)
        : match.team2Goals || 0,
    assists: team2Stats.reduce((sum, stat) => sum + stat.assists, 0),
    passesCompleted: team2Stats.reduce(
      (sum, stat) => sum + stat.passesCompleted,
      0
    ),
  }

  // Combinar todos los jugadores con sus estadísticas
  const allPlayersWithStats = [
    ...match.playersTeam1.map((player) => ({
      ...player,
      team: match.team1,
      teamAvatar: match.team1Avatar,
      stats: team1Stats.find((stat) => stat.playerId === player.id),
    })),
    ...match.playersTeam2.map((player) => ({
      ...player,
      team: match.team2,
      teamAvatar: match.team2Avatar,
      stats: team2Stats.find((stat) => stat.playerId === player.id),
    })),
  ]

  return (
    <div className='w-full mx-auto p-2 sm:p-4'>
      {/* Header con botón de regreso */}
      <div className='mb-4 sm:mb-6 flex justify-between items-center w-full mx-auto gap-2'>
        <Link
          href='/admin/matches/history'
          className='inline-flex bg-gray-800 rounded-md p-2 items-center text-white mb-2 sm:mb-4 text-sm'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back
        </Link>
        <h1 className='text-2xl sm:text-3xl font-bold mb-2'>Match Details</h1>
        <p className='text-sm sm:text-base text-gray-600'>
          {formatDate(new Date(match.date))}
        </p>
      </div>

      {/* Score Card mejorado */}
      <Card className='mb-6 sm:mb-8  shadow-sm'>
        <CardHeader className='text-center pb-3 sm:pb-4'>
          <CardTitle className='text-lg sm:text-xl text-gray-700'>
            Final Score
          </CardTitle>
          <Badge
            variant='secondary'
            className='w-fit mx-auto text-xs sm:text-sm'
          >
            {formatDate(new Date(match.date))}
          </Badge>
        </CardHeader>
        <CardContent className='pb-6 sm:pb-8'>
          <div className='flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 lg:space-x-12'>
            {/* Equipo 1 */}
            <div className='text-center flex-1 order-1 md:order-1'>
              <div className='w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-3 sm:mb-4 mx-auto'>
                <Image
                  src={match.team1Avatar || '/no-club.jpg'}
                  alt={match.team1}
                  width={96}
                  height={96}
                  className='w-full h-full object-cover rounded-full border-4 border-white shadow-sm'
                />
              </div>
              <h3 className='font-bold text-sm sm:text-base md:text-lg text-gray-800'>
                {match.team1}
              </h3>
            </div>

            {/* Marcador central */}
            <div className='flex flex-col items-center order-2 md:order-2'>
              <div className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2'>
                {match.team1Goals} : {match.team2Goals}
              </div>
              <div className='text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-xs mb-3'>
                Final Result
              </div>
              {match.duration && (
                <div className='text-xs sm:text-sm text-gray-500 bg-blue-100 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-xs mb-3'>
                  Duration: {Math.floor(match.duration / 60)}:
                  {(match.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
              <Link
                href={`/admin/matches/history/${id}/timeline`}
                className='inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors'
              >
                <Clock className='w-4 h-4 mr-2' />
                View Match Timeline
              </Link>
            </div>

            {/* Equipo 2 */}
            <div className='text-center flex-1 order-3 md:order-3'>
              <div className='w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-3 sm:mb-4 mx-auto'>
                <Image
                  src={match.team2Avatar || '/no-club.jpg'}
                  alt={match.team2}
                  width={96}
                  height={96}
                  className='w-full h-full object-cover rounded-full border-4 border-white shadow-sm'
                />
              </div>
              <h3 className='font-bold text-sm sm:text-base md:text-lg text-gray-800'>
                {match.team2}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Statistics mejoradas */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8'>
        {/* Team 1 Stats */}
        <Card className='border-l-4 border-l-blue-500 shadow-sm'>
          <CardHeader className='pb-3 sm:pb-4'>
            <CardTitle className='flex items-center space-x-2 sm:space-x-3'>
              <div className='w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10'>
                <Image
                  src={match.team1Avatar || '/no-club.jpg'}
                  alt={match.team1}
                  width={40}
                  height={40}
                  className='w-full h-full object-cover rounded-full'
                />
              </div>
              <span className='text-sm sm:text-base md:text-lg'>
                {match.team1} Statistics
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 sm:space-y-3 md:space-y-4'>
              <div className='flex justify-between items-center p-2 sm:p-2 md:p-3 bg-blue-50 rounded-lg'>
                <span className='font-medium text-xs sm:text-sm md:text-base'>
                  Goals:
                </span>
                <Badge
                  variant='default'
                  className='text-sm sm:text-base md:text-lg px-2 md:px-3 py-1'
                >
                  {team1Totals.goals}
                </Badge>
              </div>
              <div className='flex justify-between items-center p-2 sm:p-2 md:p-3 bg-green-50 rounded-lg'>
                <span className='font-medium text-xs sm:text-sm md:text-base'>
                  Assists:
                </span>
                <Badge
                  variant='secondary'
                  className='text-sm sm:text-base md:text-lg px-2 md:px-3 py-1'
                >
                  {team1Totals.assists}
                </Badge>
              </div>
              <div className='flex justify-between items-center p-2 sm:p-2 md:p-3 bg-yellow-50 rounded-lg'>
                <span className='font-medium text-xs sm:text-sm md:text-base'>
                  Passes Completed:
                </span>
                <Badge
                  variant='outline'
                  className='text-sm sm:text-base md:text-lg px-2 md:px-3 py-1'
                >
                  {team1Totals.passesCompleted}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team 2 Stats */}
        <Card className='border-l-4 border-l-red-500 shadow-sm'>
          <CardHeader className='pb-3 sm:pb-4'>
            <CardTitle className='flex items-center space-x-2 sm:space-x-3'>
              <div className='w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10'>
                <Image
                  src={match.team2Avatar || '/no-club.jpg'}
                  alt={match.team2}
                  width={40}
                  height={40}
                  className='w-full h-full object-cover rounded-full'
                />
              </div>
              <span className='text-sm sm:text-base md:text-lg'>
                {match.team2} Statistics
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 sm:space-y-3 md:space-y-4'>
              <div className='flex justify-between items-center p-2 sm:p-2 md:p-3 bg-red-50 rounded-lg'>
                <span className='font-medium text-xs sm:text-sm md:text-base'>
                  Goals:
                </span>
                <Badge
                  variant='default'
                  className='text-sm sm:text-base md:text-lg px-2 md:px-3 py-1'
                >
                  {team2Totals.goals}
                </Badge>
              </div>
              <div className='flex justify-between items-center p-2 sm:p-2 md:p-3 bg-green-50 rounded-lg'>
                <span className='font-medium text-xs sm:text-sm md:text-base'>
                  Assists:
                </span>
                <Badge
                  variant='secondary'
                  className='text-sm sm:text-base md:text-lg px-2 md:px-3 py-1'
                >
                  {team2Totals.assists}
                </Badge>
              </div>
              <div className='flex justify-between items-center p-2 sm:p-2 md:p-3 bg-yellow-50 rounded-lg'>
                <span className='font-medium text-xs sm:text-sm md:text-base'>
                  Passes Completed:
                </span>
                <Badge
                  variant='outline'
                  className='text-sm sm:text-base md:text-lg px-2 md:px-3 py-1'
                >
                  {team2Totals.passesCompleted}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Statistics Table */}
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base sm:text-lg md:text-xl'>
            Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableMatchPlayerStats
            players={allPlayersWithStats as MatchPlayerStats[]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
