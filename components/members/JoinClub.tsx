'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { OrganizationType } from '@/types/UserType'
import { PlayerType } from '@/types/PlayerType'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Target, Shield } from 'lucide-react'
import Link from 'next/link'
import { unregisterOrganizationAction } from '@/lib/actions/organization.action'
import { joinOrganizationAction } from '@/lib/actions/organization.action'
import { toast } from 'sonner'
import TeamProgressIndicators from './TeamProgressIndicators'

export default function JoinClub({
  clubs,
  userId,
  organizationId,
  team,
  teamStats,
  teamPlayers,
}: {
  clubs: OrganizationType[]
  userId?: string
  organizationId?: string
  team?: OrganizationType | null
  teamStats?: {
    goalsScored: number
    goalsConceded: number
    wins: number
    losses: number
    draws: number
    totalMatches: number
    players: number
    winRate: number
    drawRate: number
    lossRate: number
  } | null
  teamPlayers?: PlayerType[]
}) {
  const [joinedClubId, setJoinedClubId] = useState<string | null>(
    organizationId ?? null
  )
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Detectar club actual del usuario
  const currentClub = clubs.find((club) => club.id === joinedClubId)

  // Si el usuario ya está registrado en un club, mostrar información detallada
  if (joinedClubId && currentClub && team && teamStats) {
    return (
      <div className='w-full flex flex-col gap-8 p-6 sm:p-4'>
        <div className='mb-6 text-center'>
          <h2 className='text-2xl font-bold mb-2'>Your Team</h2>
          <p className='text-gray-600'>
            You are currently registered in this team. You can unregister if you
            want to join another team.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 w-full'>
          {/* Información del equipo */}
          <Card className='lg:col-span-1'>
            <CardHeader className='text-center'>
              <div className='flex justify-center mb-4'>
                <Image
                  src={currentClub.avatar || '/no-club.jpg'}
                  width={80}
                  height={80}
                  alt={currentClub.name}
                  className='w-20 h-20 rounded-full object-cover border'
                />
              </div>
              <CardTitle className='text-xl'>{currentClub.name}</CardTitle>
              <p className='text-gray-500 text-sm'>{currentClub.description}</p>
            </CardHeader>
            <CardContent className='text-center'>
              {/* Resumen de resultados */}
              <div className='flex justify-center gap-4 mb-4 text-sm'>
                <div className='flex items-center gap-1'>
                  <span className='font-bold text-green-600'>W</span>
                  <span>- {teamStats.wins}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='font-bold text-red-600'>L</span>
                  <span>- {teamStats.losses}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='font-bold text-yellow-600'>D</span>
                  <span>- {teamStats.draws}</span>
                </div>
              </div>

              <Button
                variant='destructive'
                onClick={async () => {
                  setLoadingId(currentClub.id)
                  if (userId) {
                    await unregisterOrganizationAction(userId)
                    setJoinedClubId(null)
                  }
                  setLoadingId(null)
                }}
                disabled={loadingId === currentClub.id}
                className='w-full rounded-none'
              >
                {loadingId === currentClub.id
                  ? 'Unregistering...'
                  : 'Unregister from Team'}
              </Button>
            </CardContent>
          </Card>

          {/* Estadísticas del equipo */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Trophy className='w-5 h-5' />
                Team Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {teamStats.goalsScored}
                  </div>
                  <div className='text-sm text-gray-500 flex items-center justify-center gap-1'>
                    <Target className='w-4 h-4' />
                    Goals Scored
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-red-600'>
                    {teamStats.goalsConceded}
                  </div>
                  <div className='text-sm text-gray-500 flex items-center justify-center gap-1'>
                    <Shield className='w-4 h-4' />
                    Goals Conceded
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {teamStats.wins}
                  </div>
                  <div className='text-sm text-gray-500'>Wins</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-600'>
                    {teamStats.totalMatches}
                  </div>
                  <div className='text-sm text-gray-500'>Total Matches</div>
                </div>
              </div>

              {/* Indicadores de progreso del equipo */}
              <div className='flex justify-center'>
                <TeamProgressIndicators
                  winRate={teamStats.winRate}
                  drawRate={teamStats.drawRate}
                  lossRate={teamStats.lossRate}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jugadores del equipo */}
        <div className='mt-8'>
          <div className='flex w-full justify-between items-center mb-6'>
            <h3 className='text-2xl font-bold flex items-center gap-2'>
              <Users className='w-6 h-6' />
              Team Players ({teamPlayers?.length || 0})
            </h3>
            <Link
              href='/members/players/add'
              className='text-white p-2 bg-gray-900 rounded-null'
            >
              Add Player
              <span aria-hidden>→</span>
            </Link>
          </div>

          {!teamPlayers || teamPlayers.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-500'>
                No players registered in this team yet.
              </p>
              <Link href='/members/players/add'>
                <Button className='mt-4 rounded-none'>
                  Add Your First Player
                </Button>
              </Link>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {teamPlayers.map((player) => (
                <Card key={player.id} className='rounded-none border-none'>
                  <CardContent className='flex flex-col items-center justify-center p-4'>
                    <div className='relative mb-3'>
                      <Avatar className='w-16 h-16'>
                        <AvatarImage
                          src={player.avatar || '/no-profile.webp'}
                        />
                        <AvatarFallback>
                          {player.name?.[0]}
                          {player.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {player.jerseyNumber && (
                        <div className='absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold'>
                          #{player.jerseyNumber}
                        </div>
                      )}
                    </div>
                    <h4 className='font-semibold text-center mb-1'>
                      {player.name} {player.lastName}
                    </h4>
                    <div className='flex gap-2 mb-3'>
                      {player.position && (
                        <Badge variant='outline'>{player.position}</Badge>
                      )}
                    </div>
                    <Link href={`/members/players/${player.id}`}>
                      <Button
                        variant='outline'
                        size='sm'
                        className='rounded-none'
                      >
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Si no hay clubs disponibles
  if (!clubs || clubs.length === 0)
    return (
      <div className='flex flex-col items-center justify-center h-full mx-auto pt-9'>
        <h2 className='text-2xl font-bold'>No clubs found</h2>
        <p className='text-gray-500'>
          There are no clubs registered for the moment.
        </p>
      </div>
    )

  // Mostrar lista de clubs para unirse
  return (
    <div className='w-full flex flex-col gap-8 py-8 px-4'>
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-bold mb-2'>Join a Club</h2>
        <p className='text-gray-600'>
          To participate in events and register your players, you must first
          join a club. Select your club below and become part of the community!
        </p>
      </div>
      <div className='grid gap-6 sm:grid-cols-2'>
        {clubs.map((club) => (
          <div
            key={club.id}
            className={`bg-white rounded-xl shadow p-6 flex flex-col items-center transition-all ${
              joinedClubId === club.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <Image
              src={club?.avatar || '/no-club.jpg'}
              width={64}
              height={64}
              alt={club.name}
              className='w-16 h-16 rounded-full object-cover mb-3 border'
            />

            <h3 className='text-lg font-semibold mb-1'>{club.name}</h3>
            <p className='text-gray-500 text-sm mb-4 text-center'>
              {club.description}
            </p>
            <Button
              onClick={async () => {
                setLoadingId(club.id)
                if (userId) {
                  const res = await joinOrganizationAction(userId, club.id)
                  if (res.success) {
                    setJoinedClubId(club.id)
                    toast.success('You have joined the club!')
                  } else {
                    toast.error(res.error || 'Failed to join club')
                  }
                }
                setLoadingId(null)
              }}
              disabled={joinedClubId === club.id || loadingId === club.id}
              className='w-full flex items-center gap-2 rounded-none'
            >
              {joinedClubId === club.id
                ? 'Joined'
                : loadingId === club.id
                ? 'Joining...'
                : 'Join Club'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
