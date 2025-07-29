import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { dbPromise } from '@/database/drizzle'
import {
  matchesTable,
  organizationsTable,
  playersTable,
  playerStatsTable,
} from '@/database/schema'
import { eq, inArray } from 'drizzle-orm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MatchHistoryPage({ params }: PageProps) {
  const { id } = await params
  const db = await dbPromise

  // Obtener el partido con los equipos
  const matchData = await db
    .select({
      id: matchesTable.id,
      date: matchesTable.date,
      team1Id: matchesTable.team1Id,
      team2Id: matchesTable.team2Id,
      team1Goals: matchesTable.team1Goals,
      team2Goals: matchesTable.team2Goals,
      duration: matchesTable.duration,
      status: matchesTable.status,
      location: matchesTable.location,
    })
    .from(matchesTable)
    .where(eq(matchesTable.id, id))
    .limit(1)

  if (!matchData.length) {
    notFound()
  }

  const match = matchData[0]

  // Obtener los equipos
  const teams = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      avatar: organizationsTable.avatar,
    })
    .from(organizationsTable)
    .where(inArray(organizationsTable.id, [match.team1Id, match.team2Id]))

  const team1 = teams.find((t) => t.id === match.team1Id)
  const team2 = teams.find((t) => t.id === match.team2Id)

  if (!team1 || !team2) {
    notFound()
  }

  // Obtener estadísticas de jugadores
  const playerStats = await db
    .select({
      playerId: playerStatsTable.playerId,
      minutesPlayed: playerStatsTable.minutesPlayed,
      goals: playerStatsTable.goals,
      assists: playerStatsTable.assists,
      passesCompleted: playerStatsTable.passesCompleted,
      goalsAllowed: playerStatsTable.goalsAllowed,
      goalsSaved: playerStatsTable.goalsSaved,
    })
    .from(playerStatsTable)
    .where(eq(playerStatsTable.matchId, id))

  // Obtener jugadores de ambos equipos
  const players = await db
    .select({
      id: playersTable.id,
      name: playersTable.name,
      lastName: playersTable.lastName,
      avatar: playersTable.avatar,
      jerseyNumber: playersTable.jerseyNumber,
      position: playersTable.position,
      organizationId: playersTable.organizationId,
    })
    .from(playersTable)
    .where(inArray(playersTable.organizationId, [match.team1Id, match.team2Id]))

  const playersTeam1 = players.filter((p) => p.organizationId === match.team1Id)
  const playersTeam2 = players.filter((p) => p.organizationId === match.team2Id)

  // Combinar jugadores con sus estadísticas
  const playersWithStats = [...playersTeam1, ...playersTeam2].map((player) => {
    const stats = playerStats.find((ps) => ps.playerId === player.id)
    return {
      ...player,
      stats: stats || {
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        passesCompleted: 0,
        goalsAllowed: 0,
        goalsSaved: 0,
      },
    }
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className='max-w-screen-xl mx-auto px-4 py-6 mt-10'>
      {/* Header con botón de regreso */}
      <div className='mb-6'>
        <Link href='/members/matches/history'>
          <Button variant='outline' className='flex items-center gap-2'>
            <ArrowLeft className='w-4 h-4' />
            Back to All Matches
          </Button>
        </Link>
      </div>

      {/* Información del partido */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='w-5 h-5' />
            Match Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Equipos */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Image
                  src={team1.avatar || '/no-club.jpg'}
                  alt={team1.name}
                  width={60}
                  height={60}
                  className='rounded-full border object-cover'
                />
                <div>
                  <h3 className='font-semibold text-lg'>{team1.name}</h3>
                  <span className='text-2xl font-bold text-blue-600'>
                    {match.team1Goals}
                  </span>
                </div>
              </div>

              <div className='text-center'>
                <div className='text-lg font-semibold text-gray-600'>VS</div>
                <Badge
                  variant={
                    match.status === 'inactive' ? 'default' : 'secondary'
                  }
                >
                  {match.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>

              <div className='flex items-center gap-3'>
                <div className='text-right'>
                  <h3 className='font-semibold text-lg'>{team2.name}</h3>
                  <span className='text-2xl font-bold text-blue-600'>
                    {match.team2Goals}
                  </span>
                </div>
                <Image
                  src={team2.avatar || '/no-club.jpg'}
                  alt={team2.name}
                  width={60}
                  height={60}
                  className='rounded-full border object-cover'
                />
              </div>
            </div>

            {/* Detalles del partido */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-gray-600'>
                <Clock className='w-4 h-4' />
                <span>
                  {formatDate(match.date)} at {formatTime(match.date)}
                </span>
              </div>

              {match.location && (
                <div className='flex items-center gap-2 text-gray-600'>
                  <MapPin className='w-4 h-4' />
                  <span>{match.location}</span>
                </div>
              )}

              {match.duration && (
                <div className='flex items-center gap-2 text-gray-600'>
                  <Trophy className='w-4 h-4' />
                  <span>Duration: {match.duration} minutes</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de jugadores */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Equipo 1 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Image
                src={team1.avatar || '/no-club.jpg'}
                alt={team1.name}
                width={24}
                height={24}
                className='rounded-full border object-cover'
              />
              {team1.name} Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {playersWithStats
                .filter((player) => player.organizationId === match.team1Id)
                .map((player) => (
                  <div
                    key={player.id}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <Image
                        src={player.avatar || '/no-profile.webp'}
                        alt={`${player.name} ${player.lastName}`}
                        width={40}
                        height={40}
                        className='rounded-full border object-cover'
                      />
                      <div>
                        <div className='font-medium'>
                          {player.name} {player.lastName}
                        </div>
                        <div className='text-sm text-gray-600'>
                          #{player.jerseyNumber} • {player.position}
                        </div>
                      </div>
                    </div>
                    <div className='text-right text-sm'>
                      <div>Goals: {player.stats.goals}</div>
                      <div>Assists: {player.stats.assists}</div>
                      <div>Passes: {player.stats.passesCompleted}</div>
                      {player.position === 'goalkeeper' && (
                        <>
                          <div>Saves: {player.stats.goalsSaved}</div>
                          <div>Allowed: {player.stats.goalsAllowed}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipo 2 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Image
                src={team2.avatar || '/no-club.jpg'}
                alt={team2.name}
                width={24}
                height={24}
                className='rounded-full border object-cover'
              />
              {team2.name} Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {playersWithStats
                .filter((player) => player.organizationId === match.team2Id)
                .map((player) => (
                  <div
                    key={player.id}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <Image
                        src={player.avatar || '/no-profile.webp'}
                        alt={`${player.name} ${player.lastName}`}
                        width={40}
                        height={40}
                        className='rounded-full border object-cover'
                      />
                      <div>
                        <div className='font-medium'>
                          {player.name} {player.lastName}
                        </div>
                        <div className='text-sm text-gray-600'>
                          #{player.jerseyNumber} • {player.position}
                        </div>
                      </div>
                    </div>
                    <div className='text-right text-sm'>
                      <div>Goals: {player.stats.goals}</div>
                      <div>Assists: {player.stats.assists}</div>
                      <div>Passes: {player.stats.passesCompleted}</div>
                      {player.position === 'goalkeeper' && (
                        <>
                          <div>Saves: {player.stats.goalsSaved}</div>
                          <div>Allowed: {player.stats.goalsAllowed}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link al timeline */}
      <div className='mt-6 text-center'>
        <Link href={`/members/matches/history/${id}/timeline`}>
          <Button className='flex items-center gap-2'>
            <Clock className='w-4 h-4' />
            View Match Timeline
          </Button>
        </Link>
      </div>
    </div>
  )
}
