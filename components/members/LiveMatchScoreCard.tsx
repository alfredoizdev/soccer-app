'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface LiveMatchScoreCardProps {
  match: {
    id: string
    team1: string
    team2: string
    team1Id: string
    team2Id: string
    team1Goals: number
    team2Goals: number
    team1Avatar: string
    team2Avatar: string
  }
  liveScore: {
    team1Goals: number
    team2Goals: number
  }
  matchStatus: 'not-started' | 'live' | 'ended'
  currentMinute?: number
}

export default function LiveMatchScoreCard({
  match,
  liveScore,
  matchStatus,
  currentMinute = 0,
}: LiveMatchScoreCardProps) {
  return (
    <div className='w-full mb-5'>
      <Card className='border-2 border-gray-200 shadow-sm rounded-none'>
        <CardHeader className='text-center pb-3'>
          <CardTitle className='text-lg text-gray-700'>Live Score</CardTitle>
        </CardHeader>
        <CardContent className='pb-6'>
          <div className='flex flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 lg:space-x-12'>
            {/* Equipo 1 */}
            <div className='text-center flex-1'>
              <div className='w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-3 mx-auto'>
                <Image
                  src={match.team1Avatar || '/no-club.jpg'}
                  alt={match.team1}
                  width={96}
                  height={96}
                  className='w-full h-full object-cover rounded-full border-4 border-white shadow-sm'
                />
              </div>
              <h3 className='font-bold text-sm sm:text-base md:text-lg text-gray-800'>
                {match.team1}
              </h3>
            </div>

            {/* Marcador central */}
            <div className='flex flex-col items-center'>
              <div className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2'>
                {liveScore.team1Goals} : {liveScore.team2Goals}
              </div>
              <div className='text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 sm:px-4 py-1 sm:py-2 rounded-full'>
                {matchStatus === 'live' ? 'Live Score' : 'Final Score'}
              </div>
              {matchStatus === 'live' && (
                <div className='text-xs sm:text-sm text-red-500 px-3 sm:px-4 py-1 sm:py-2 rounded-full mt-2'>
                  {currentMinute}&apos;
                </div>
              )}
            </div>

            {/* Equipo 2 */}
            <div className='text-center flex-1'>
              <div className='w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-3 mx-auto'>
                <Image
                  src={match.team2Avatar || '/no-club.jpg'}
                  alt={match.team2}
                  width={96}
                  height={96}
                  className='w-full h-full object-cover rounded-full border-4 border-white shadow-sm'
                />
              </div>
              <h3 className='font-bold text-sm sm:text-base md:text-lg text-gray-800'>
                {match.team2}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
