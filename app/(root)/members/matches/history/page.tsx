import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import Image from 'next/image'
import { abbreviateTeam } from '@/lib/utils/abbreviateTeam'

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
          <Link href='/members/matches/calendar'>
            <Button variant='outline' className='rounded-none'>
              Back to Calendar
            </Button>
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
            <Card
              key={match.id}
              className='hover:shadow-lg transition-shadow rounded-none'
            >
              <CardHeader>
                <CardTitle className='text-center'>
                  {format(new Date(match.date), 'PPP')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-center gap-4 mb-4'>
                  {(() => {
                    const team1Goals = match.team1Goals || 0
                    const team2Goals = match.team2Goals || 0
                    const team1Wins = team1Goals > team2Goals
                    const team2Wins = team2Goals > team1Goals

                    return (
                      <>
                        <div className='text-center'>
                          <Image
                            src={match.team1Avatar || '/no-club.jpg'}
                            alt={match.team1}
                            width={48}
                            height={48}
                            className='rounded-full object-cover border-2 border-gray-200 mx-auto mb-2'
                          />
                          <div className='font-semibold text-sm'>
                            {abbreviateTeam(match.team1)}
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              team1Wins
                                ? 'text-green-600'
                                : team2Wins
                                ? 'text-gray-500'
                                : 'text-blue-600'
                            }`}
                          >
                            {team1Goals}
                          </div>
                        </div>

                        <div className='text-center'>
                          <div className='text-2xl font-bold text-gray-400'>
                            VS
                          </div>
                          <div className='text-xs text-gray-500 mt-1'>
                            {match.duration ? 'Completed' : 'Scheduled'}
                          </div>
                        </div>

                        <div className='text-center'>
                          <Image
                            src={match.team2Avatar || '/no-club.jpg'}
                            alt={match.team2}
                            width={48}
                            height={48}
                            className='rounded-full object-cover border-2 border-gray-200 mx-auto mb-2'
                          />
                          <div className='font-semibold text-sm'>
                            {abbreviateTeam(match.team2)}
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              team2Wins
                                ? 'text-green-600'
                                : team1Wins
                                ? 'text-gray-500'
                                : 'text-blue-600'
                            }`}
                          >
                            {team2Goals}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                <div className='flex gap-2 justify-center'>
                  <Link href={`/members/matches/history/${match.id}/timeline`}>
                    <Button
                      variant='default'
                      size='sm'
                      className='rounded-none'
                    >
                      See Timeline
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
