import { getActiveMatchesWithTeams } from '@/lib/actions/matches.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Play, Square } from 'lucide-react'

export default async function LiveMatchesPage() {
  const matches = await getActiveMatchesWithTeams()

  return (
    <div className='w-full max-w-7xl mx-auto py-8 px-2 sm:px-6 lg:px-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>Live Matches</h1>
        <p className='text-gray-600'>Watch matches in real-time</p>
      </div>

      {matches.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            <Square className='w-16 h-16 mx-auto' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>No Live Matches</h3>
          <p className='text-gray-500'>
            There are currently no matches being played.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {matches.map((match) => (
            <Card key={match.id} className='hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>
                    {match.team1} vs {match.team2}
                  </CardTitle>
                  <Badge
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    <Play className='w-3 h-3' />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-center gap-4 mb-4'>
                  {/* Team 1 */}
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 mb-2'>
                      <AvatarImage
                        src={match.team1Avatar || '/no-club.jpg'}
                        alt={match.team1}
                      />
                      <AvatarFallback>{match.team1.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-medium text-center'>
                      {match.team1}
                    </span>
                  </div>

                  {/* Score */}
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl font-bold'>
                      {match.team1Goals || 0}
                    </span>
                    <span className='text-lg text-gray-500'>-</span>
                    <span className='text-2xl font-bold'>
                      {match.team2Goals || 0}
                    </span>
                  </div>

                  {/* Team 2 */}
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 mb-2'>
                      <AvatarImage
                        src={match.team2Avatar || '/no-club.jpg'}
                        alt={match.team2}
                      />
                      <AvatarFallback>{match.team2.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-medium text-center'>
                      {match.team2}
                    </span>
                  </div>
                </div>

                <div className='text-center'>
                  <Link href={`/members/matches/live/${match.id}`}>
                    <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'>
                      Watch Match
                    </button>
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
