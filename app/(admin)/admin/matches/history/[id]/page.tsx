import {
  getMatchWithPlayers,
  getMatchPlayerStats,
} from '@/lib/actions/matches.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils/formatDate'

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
  const team1Totals = {
    goals:
      team1Stats.length > 0
        ? team1Stats.reduce((sum, stat) => sum + stat.goals, 0)
        : match.match.team1Goals || 0,
    assists: team1Stats.reduce((sum, stat) => sum + stat.assists, 0),
    passesCompleted: team1Stats.reduce(
      (sum, stat) => sum + stat.passesCompleted,
      0
    ),
    duelsWon: team1Stats.reduce((sum, stat) => sum + stat.duelsWon, 0),
    duelsLost: team1Stats.reduce((sum, stat) => sum + stat.duelsLost, 0),
  }

  const team2Totals = {
    goals:
      team2Stats.length > 0
        ? team2Stats.reduce((sum, stat) => sum + stat.goals, 0)
        : match.match.team2Goals || 0,
    assists: team2Stats.reduce((sum, stat) => sum + stat.assists, 0),
    passesCompleted: team2Stats.reduce(
      (sum, stat) => sum + stat.passesCompleted,
      0
    ),
    duelsWon: team2Stats.reduce((sum, stat) => sum + stat.duelsWon, 0),
    duelsLost: team2Stats.reduce((sum, stat) => sum + stat.duelsLost, 0),
  }

  // Combinar todos los jugadores con sus estadísticas
  const allPlayersWithStats = [
    ...match.playersTeam1.map((player) => ({
      ...player,
      team: match.match.team1,
      teamAvatar: match.match.team1Avatar,
      stats: team1Stats.find((stat) => stat.playerId === player.id),
    })),
    ...match.playersTeam2.map((player) => ({
      ...player,
      team: match.match.team2,
      teamAvatar: match.match.team2Avatar,
      stats: team2Stats.find((stat) => stat.playerId === player.id),
    })),
  ]

  return (
    <div className='w-full mx-auto p-4'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Match Details</h1>
        <p className='text-gray-600'>
          {formatDate(new Date(match.match.date))}
        </p>
      </div>

      {/* Score Card */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-center'>Final Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center space-x-8'>
            <div className='text-center'>
              <Image
                src={match.match.team1Avatar || '/no-club.jpg'}
                alt={match.match.team1}
                width={64}
                height={64}
                className='rounded-full mx-auto mb-2'
              />
              <h3 className='font-semibold text-lg'>{match.match.team1}</h3>
              <div className='text-3xl font-bold text-blue-600'>
                {match.match.team1Goals}
              </div>
            </div>

            <div className='text-4xl font-bold'>VS</div>

            <div className='text-center'>
              <Image
                src={match.match.team2Avatar || '/no-club.jpg'}
                alt={match.match.team2}
                width={64}
                height={64}
                className='rounded-full mx-auto mb-2'
              />
              <h3 className='font-semibold text-lg'>{match.match.team2}</h3>
              <div className='text-3xl font-bold text-blue-600'>
                {match.match.team2Goals}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Statistics */}
      <div className='grid md:grid-cols-2 gap-6 mb-6'>
        {/* Team 1 Stats */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Image
                src={match.match.team1Avatar || '/no-club.jpg'}
                alt={match.match.team1}
                width={32}
                height={32}
                className='rounded-full'
              />
              <span>{match.match.team1} Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>Goals:</span>
                <Badge variant='secondary'>{team1Totals.goals}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Assists:</span>
                <Badge variant='secondary'>{team1Totals.assists}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Passes Completed:</span>
                <Badge variant='secondary'>{team1Totals.passesCompleted}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Duels Won:</span>
                <Badge variant='secondary'>{team1Totals.duelsWon}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Duels Lost:</span>
                <Badge variant='secondary'>{team1Totals.duelsLost}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team 2 Stats */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Image
                src={match.match.team2Avatar || '/no-club.jpg'}
                alt={match.match.team2}
                width={32}
                height={32}
                className='rounded-full'
              />
              <span>{match.match.team2} Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>Goals:</span>
                <Badge variant='secondary'>{team2Totals.goals}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Assists:</span>
                <Badge variant='secondary'>{team2Totals.assists}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Passes Completed:</span>
                <Badge variant='secondary'>{team2Totals.passesCompleted}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Duels Won:</span>
                <Badge variant='secondary'>{team2Totals.duelsWon}</Badge>
              </div>
              <div className='flex justify-between'>
                <span>Duels Lost:</span>
                <Badge variant='secondary'>{team2Totals.duelsLost}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Player Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className='text-center'>Goals</TableHead>
                  <TableHead className='text-center'>Assists</TableHead>
                  <TableHead className='text-center'>Minutes</TableHead>
                  <TableHead className='text-center'>Passes</TableHead>
                  <TableHead className='text-center'>Duels Won</TableHead>
                  <TableHead className='text-center'>Duels Lost</TableHead>
                  <TableHead className='text-center'>Goals Saved</TableHead>
                  <TableHead className='text-center'>Goals Allowed</TableHead>
                  <TableHead className='text-center'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPlayersWithStats.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className='flex items-center space-x-3'>
                        <Image
                          src={player.avatar || '/no-profile.webp'}
                          alt={player.name}
                          width={32}
                          height={32}
                          className='rounded-full'
                        />
                        <div>
                          <div className='font-medium'>
                            {player.name} {player.lastName}
                          </div>
                          <div className='text-sm text-gray-500'>
                            #{player.jerseyNumber} • {player.position}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <Image
                          src={player.teamAvatar || '/no-club.jpg'}
                          alt={player.team}
                          width={20}
                          height={20}
                          className='rounded-full'
                        />
                        <span className='text-sm'>{player.team}</span>
                      </div>
                    </TableCell>
                    <TableCell className='text-center font-medium'>
                      {player.stats?.goals || 0}
                    </TableCell>
                    <TableCell className='text-center font-medium'>
                      {player.stats?.assists || 0}
                    </TableCell>
                    <TableCell className='text-center font-medium'>
                      {player.stats?.minutesPlayed || 0}
                    </TableCell>
                    <TableCell className='text-center font-medium'>
                      {player.stats?.passesCompleted || 0}
                    </TableCell>
                    <TableCell className='text-center font-medium'>
                      {player.stats?.duelsWon || 0}
                    </TableCell>
                    <TableCell className='text-center font-medium'>
                      {player.stats?.duelsLost || 0}
                    </TableCell>
                    <TableCell className='text-center font-medium'>
                      {player.stats?.goalsSaved || 0}
                    </TableCell>
                    <TableCell className='text-center font-medium'>
                      {player.stats?.goalsAllowed || 0}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Link href={`/admin/players/${player.id}`}>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                        >
                          <Eye className='h-4 w-4' />
                          <span className='sr-only'>View player details</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
