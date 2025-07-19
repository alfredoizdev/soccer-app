import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'
import { format } from 'date-fns'
import Image from 'next/image'

interface MatchListItem {
  id: string
  date: string | Date
  team1: string
  team2: string
  team1Id: string
  team2Id: string
  team1Goals: number
  team2Goals: number
  team1Avatar: string
  team2Avatar: string
  duration?: number | null
  status?: string
}

export default async function MatchHistoryPage() {
  const allMatches: MatchListItem[] = await getAllMatchesWithTeams()

  // Filtrar solo partidos que han finalizado (status inactive o con goles/duración)
  const completedMatches = allMatches.filter(
    (match) =>
      match.status === 'inactive' ||
      match.team1Goals > 0 ||
      match.team2Goals > 0 ||
      match.duration
  )

  return (
    <div className='w-full px-4 mx-auto mt-5 animate-fade-in duration-500'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Match History</h1>
        <div className='flex gap-2'>
          <Link href='/admin/matches'>
            <Button variant='outline'>Active Matches</Button>
          </Link>
          <Link href='/admin/matches/new'>
            <Button>New match</Button>
          </Link>
        </div>
      </div>

      {completedMatches.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-gray-500 mb-4'>No completed matches found.</p>
          <p className='text-sm text-gray-400'>
            Completed matches will appear here after they are finished.
          </p>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {completedMatches.map((match) => (
            <Card key={match.id} className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {format(new Date(match.date), 'MMM dd, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8'>
                      <Image
                        src={match.team1Avatar || '/no-club.jpg'}
                        alt={match.team1}
                        width={32}
                        height={32}
                        className='w-full h-full object-cover rounded-full'
                      />
                    </div>
                    <span className='font-medium text-sm'>{match.team1}</span>
                  </div>
                  <div className='text-lg font-bold'>
                    {match.team1Goals} - {match.team2Goals}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm'>{match.team2}</span>
                    <div className='w-8 h-8'>
                      <Image
                        src={match.team2Avatar || '/no-club.jpg'}
                        alt={match.team2}
                        width={32}
                        height={32}
                        className='w-full h-full object-cover rounded-full'
                      />
                    </div>
                  </div>
                </div>

                {match.duration && (
                  <div className='text-sm text-gray-500 mb-3'>
                    Duration: {Math.floor(match.duration / 60)}:
                    {(match.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}

                <div className='flex gap-2'>
                  <Link href={`/admin/matches/history/${match.id}`}>
                    <Button variant='outline' size='sm'>
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/admin/matches/history/${match.id}/timeline`}>
                    <Button variant='outline' size='sm'>
                      Timeline
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
