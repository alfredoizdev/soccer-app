'use client'
import { OrganizationType } from '@/types/UserType'
import { PlayerType } from '@/types/PlayerType'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Target, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface TeamSectionProps {
  team: OrganizationType
  players: PlayerType[]
  stats: {
    goalsScored: number
    goalsConceded: number
    wins: number
    losses: number
    draws: number
    totalMatches: number
    players: number
  }
  userId?: string
}

function TeamSection({ team, players, stats, userId }: TeamSectionProps) {
  const handleUnregister = async () => {
    if (!userId) return

    try {
      const { unregisterOrganizationAction } = await import(
        '@/lib/actions/organization.action'
      )
      await unregisterOrganizationAction(userId)
      // Recargar la página para mostrar el estado actualizado
      window.location.reload()
    } catch (error) {
      console.error('Error unregistering from team:', error)
    }
  }

  return (
    <section className='container mx-auto w-full'>
      <div className='flex w-full justify-between items-center mb-6 px-4'>
        <h2 className='text-3xl font-bold'>Your Team</h2>
        <Link
          href='/members/join-club'
          className='text-white p-2 bg-gray-900 rounded-null'
        >
          Manage Team
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 w-full px-4 mx-auto'>
        {/* Información del equipo */}
        <Card className='lg:col-span-1'>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4'>
              <Image
                src={team.avatar || '/no-club.jpg'}
                width={80}
                height={80}
                alt={team.name}
                className='w-20 h-20 rounded-full object-cover border'
              />
            </div>
            <CardTitle className='text-xl'>{team.name}</CardTitle>
            <p className='text-gray-500 text-sm'>{team.description}</p>
          </CardHeader>
          <CardContent className='text-center'>
            <Button
              variant='destructive'
              onClick={handleUnregister}
              className='w-full rounded-none'
            >
              Unregister from Team
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
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {stats.goalsScored}
                </div>
                <div className='text-sm text-gray-500 flex items-center justify-center gap-1'>
                  <Target className='w-4 h-4' />
                  Goals Scored
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {stats.goalsConceded}
                </div>
                <div className='text-sm text-gray-500 flex items-center justify-center gap-1'>
                  <Shield className='w-4 h-4' />
                  Goals Conceded
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {stats.wins}
                </div>
                <div className='text-sm text-gray-500'>Wins</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-600'>
                  {stats.totalMatches}
                </div>
                <div className='text-sm text-gray-500'>Total Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jugadores del equipo */}
      <div className='mt-8'>
        <div className='flex w-full justify-between items-center mb-6 px-4'>
          <h3 className='text-2xl font-bold flex items-center gap-2'>
            <Users className='w-6 h-6' />
            Team Players ({players.length})
          </h3>
          <Link
            href='/members/players/add'
            className='text-white p-2 bg-gray-900 rounded-null'
          >
            Add Player
            <span aria-hidden>→</span>
          </Link>
        </div>

        {players.length === 0 ? (
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
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full px-4 mx-auto'>
            {players.map((player) => (
              <Card key={player.id} className='rounded-none border-none'>
                <CardContent className='flex flex-col items-center justify-center p-4'>
                  <Avatar className='w-16 h-16 mb-3'>
                    <AvatarImage src={player.avatar || '/no-profile.webp'} />
                    <AvatarFallback>
                      {player.name?.[0]}
                      {player.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className='font-semibold text-center mb-1'>
                    {player.name} {player.lastName}
                  </h4>
                  <div className='flex gap-2 mb-3'>
                    {player.jerseyNumber && (
                      <Badge variant='secondary'>#{player.jerseyNumber}</Badge>
                    )}
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
    </section>
  )
}

export default TeamSection
