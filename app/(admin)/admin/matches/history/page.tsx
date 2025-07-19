/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllMatchesWithTeams } from '@/lib/actions/matches.action'
import { Card, CardContent } from '@/components/ui/card'
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
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {completedMatches.map((match: any) => (
            <Link
              key={match.id}
              href={`/admin/matches/history/${match.id}`}
              className='block'
            >
              <Card className='hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer'>
                <CardContent className='p-6'>
                  {/* Header con información del partido */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className='text-sm text-gray-500'>
                      {formatDate(new Date(match.date))}
                    </div>
                    <Badge variant='secondary' className='text-xs'>
                      Completed
                    </Badge>
                  </div>

                  {/* Contenido principal del partido */}
                  <div className='flex items-center justify-between'>
                    {/* Equipo 1 */}
                    <div className='flex flex-col items-center text-center flex-1'>
                      <div className='w-16 h-16 mb-2'>
                        <Image
                          src={match.team1Avatar || '/no-club.jpg'}
                          alt={match.team1 || 'Team 1'}
                          width={64}
                          height={64}
                          className='w-full h-full object-cover rounded-full'
                        />
                      </div>
                      <span className='font-semibold text-sm text-gray-700'>
                        {match.team1}
                      </span>
                    </div>

                    {/* Marcador */}
                    <div className='flex flex-col items-center mx-4'>
                      <div className='text-2xl font-bold text-gray-800'>
                        {match.team1Goals} : {match.team2Goals}
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>
                        Final Score
                      </div>
                    </div>

                    {/* Equipo 2 */}
                    <div className='flex flex-col items-center text-center flex-1'>
                      <div className='w-16 h-16 mb-2'>
                        <Image
                          src={match.team2Avatar || '/no-club.jpg'}
                          alt={match.team2 || 'Team 2'}
                          width={64}
                          height={64}
                          className='w-full h-full object-cover rounded-full'
                        />
                      </div>
                      <span className='font-semibold text-sm text-gray-700'>
                        {match.team2}
                      </span>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className='mt-4 pt-4 border-t border-gray-100'>
                    <div className='flex items-center justify-center text-xs text-gray-500'>
                      <span>Click to view details</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
