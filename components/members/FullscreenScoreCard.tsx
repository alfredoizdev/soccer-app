'use client'

import Image from 'next/image'

interface FullscreenScoreCardProps {
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

export default function FullscreenScoreCard({
  match,
  liveScore,
  matchStatus,
  currentMinute = 0,
}: FullscreenScoreCardProps) {
  return (
    <div className='w-full'>
      <div className='bg-white border-b border-gray-200 p-2 md:p-4'>
        <div className='text-center mb-2 md:mb-3'>
          <h3 className='text-xs md:text-sm font-semibold text-gray-700'>
            Live Score
          </h3>
        </div>

        <div className='flex items-center justify-center gap-2 md:gap-4'>
          {/* Equipo 1 */}
          <div className='text-center flex-1'>
            <div className='w-8 h-8 md:w-12 md:h-12 mb-1 md:mb-2 mx-auto'>
              <Image
                src={match.team1Avatar || '/no-club.jpg'}
                alt={match.team1}
                width={48}
                height={48}
                className='w-full h-full object-cover rounded-full border-2 border-gray-200'
              />
            </div>
            <h4 className='font-medium text-xs text-gray-800 truncate'>
              {match.team1}
            </h4>
          </div>

          {/* Marcador central */}
          <div className='flex flex-col items-center'>
            <div className='text-lg md:text-2xl font-bold text-gray-800 mb-1'>
              {liveScore.team1Goals} : {liveScore.team2Goals}
            </div>
            <div className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
              {matchStatus === 'live' ? 'Live' : 'Final'}
            </div>
            {matchStatus === 'live' && (
              <div className='text-xs text-red-500 mt-1'>
                {currentMinute}&apos;
              </div>
            )}
          </div>

          {/* Equipo 2 */}
          <div className='text-center flex-1'>
            <div className='w-8 h-8 md:w-12 md:h-12 mb-1 md:mb-2 mx-auto'>
              <Image
                src={match.team2Avatar || '/no-club.jpg'}
                alt={match.team2}
                width={48}
                height={48}
                className='w-full h-full object-cover rounded-full border-2 border-gray-200'
              />
            </div>
            <h4 className='font-medium text-xs text-gray-800 truncate'>
              {match.team2}
            </h4>
          </div>
        </div>
      </div>
    </div>
  )
}
