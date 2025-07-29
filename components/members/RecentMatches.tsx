import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MatchWithTeams } from '@/lib/actions/matches.action'

interface RecentMatchesProps {
  matches: MatchWithTeams[]
}

function RecentMatches({ matches }: RecentMatchesProps) {
  // Organizar partidos: activos primero, luego inactivos
  const sortedMatches = matches
    .filter((match) => match.status === 'active' || match.status === 'inactive')
    .sort((a, b) => {
      // Activos primero
      if (a.status === 'active' && b.status !== 'active') return -1
      if (b.status === 'active' && a.status !== 'active') return 1
      return 0
    })

  const recentMatches = sortedMatches.slice(0, 4)

  if (matches.length === 0) {
    return (
      <section className='container mx-auto w-full'>
        <div className='flex w-full justify-between items-center mb-6 px-4'>
          <h2 className='text-3xl font-bold'>Recent Matches</h2>
        </div>
        <div className='flex flex-col items-center justify-center h-32 mx-auto px-4'>
          <h3 className='text-xl font-semibold text-gray-600'>
            No matches found
          </h3>
          <p className='text-gray-500 text-center'>
            There are no matches scheduled for the moment.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className='container mx-auto w-full'>
      <div className='flex w-full justify-between items-center mb-6 px-4'>
        <h2 className='text-3xl font-bold'>Recent Matches</h2>
        <Link
          href='/members/matches/history'
          className='text-white p-2 bg-gray-900 rounded-null'
        >
          See More
          <span aria-hidden>→</span>
        </Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-4 mx-auto'>
        {recentMatches.map((match) => (
          <Card key={match.id} className='rounded-none border-none'>
            <CardContent className='flex flex-col items-center justify-center p-4 h-full w-full'>
              <span className='text-xs text-gray-400 mb-2'>
                {typeof match.date === 'string'
                  ? new Date(match.date).toLocaleDateString()
                  : match.date.toLocaleDateString()}
              </span>

              {/* Badge para partidos activos */}
              {match.status === 'active' && (
                <div className='flex justify-center mb-4'>
                  <Badge
                    variant='secondary'
                    className='bg-green-100 text-green-800 border-green-200'
                  >
                    ⚽ Active
                  </Badge>
                </div>
              )}

              {/* Badge para partidos inactivos */}
              {match.status === 'inactive' && (
                <div className='flex justify-center mb-4'>
                  <Badge
                    variant='secondary'
                    className='bg-yellow-100 text-yellow-800 border-yellow-200'
                  >
                    🏁 Completed
                  </Badge>
                </div>
              )}

              {/* Equipos */}
              <div className='flex justify-center items-center gap-4 relative w-full'>
                <div className='flex flex-col justify-center items-center gap-2'>
                  <Avatar>
                    <AvatarImage
                      src={match.team1Avatar}
                      className='w-16 h-16'
                    />
                    <AvatarFallback>{match.team1[0]}</AvatarFallback>
                  </Avatar>
                  <span className='text-sm font-medium text-center'>
                    {match.team1}
                  </span>
                  <span
                    className={`text-2xl font-semibold rounded-full p-1 ${
                      match.team1Goals > match.team2Goals
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {match.team1Goals}
                  </span>
                </div>
                <span className='text-sm font-semibold text-gray-500 rounded-full bg-gray-200 p-1'>
                  VS
                </span>
                <div className='flex flex-col justify-center items-center gap-2'>
                  <Avatar>
                    <AvatarImage
                      src={match.team2Avatar}
                      className='w-16 h-16'
                    />
                    <AvatarFallback>{match.team2[0]}</AvatarFallback>
                  </Avatar>
                  <span className='text-sm font-medium text-center'>
                    {match.team2}
                  </span>
                  <span
                    className={`text-2xl font-semibold rounded-full p-1 ${
                      match.team2Goals > match.team1Goals
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {match.team2Goals}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-center items-center'>
              <Button
                className='w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded-none transition-colors'
                asChild
              >
                <Link
                  href={
                    match.status === 'inactive'
                      ? `/members/matches/history/${match.id}/timeline`
                      : `/members/matches/live/${match.id}`
                  }
                >
                  {match.status === 'inactive' ? 'See History' : 'Watch Live'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default RecentMatches
