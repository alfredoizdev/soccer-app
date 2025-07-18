/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/formatDate'

export default async function MatchHistoryPage() {
  const matchesRes = await getAllMatchesWithTeams()
  const matches = matchesRes || []

  // Filtrar solo partidos que tienen goles (partidos completados)
  const completedMatches = matches.filter(
    (match: any) => match.team1Goals !== null && match.team2Goals !== null
  )

  return (
    <div className='w-full mx-auto p-4'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Match History</h1>
        <p className='text-gray-600'>
          View statistics and results from completed matches
        </p>
      </div>

      {completedMatches.length === 0 ? (
        <Card>
          <CardContent className='p-6 text-center'>
            <p className='text-gray-500'>No completed matches found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4'>
          {completedMatches.map((match: any) => (
            <Card key={match.id} className='hover:shadow-md transition-shadow'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-2'>
                      <Image
                        src={match.team1?.avatar || '/no-club.jpg'}
                        alt={match.team1?.name || 'Team 1'}
                        width={32}
                        height={32}
                        className='rounded-full'
                      />
                      <span className='font-semibold'>{match.team1?.name}</span>
                    </div>
                    <div className='text-2xl font-bold'>
                      {match.team1Goals} - {match.team2Goals}
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='font-semibold'>{match.team2?.name}</span>
                      <Image
                        src={match.team2?.avatar || '/no-club.jpg'}
                        alt={match.team2?.name || 'Team 2'}
                        width={32}
                        height={32}
                        className='rounded-full'
                      />
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge variant='secondary'>
                      {formatDate(new Date(match.date))}
                    </Badge>
                    <Link
                      href={`/admin/matches/history/${match.id}`}
                      className='text-blue-600 hover:text-blue-800 font-medium'
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
