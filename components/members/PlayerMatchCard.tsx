import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface PlayerMatchCardProps {
  team1: { name: string; avatar: string; goals?: number }
  team2: { name: string; avatar: string; goals?: number }
  stats: {
    minutesPlayed: number
    goals: number
    assists: number
    passesCompleted: number
    duelsWon: number
    duelsLost: number
    jerseyNumber?: number // dorsal del jugador
  }
  date: Date | string
}

export default function PlayerMatchCard({
  team1,
  team2,
  stats,
  date,
}: PlayerMatchCardProps) {
  return (
    <div className='mb-6 border-b pb-4 bg-gray-100 p-4 rounded-lg'>
      <div className='font-medium mb-1 text-center'>
        {new Date(date).toLocaleDateString()}
      </div>
      <div className='flex items-center justify-center gap-4 mb-2'>
        <div className='flex flex-col items-center'>
          <Image
            src={team1.avatar || '/no-profile.webp'}
            alt={team1.name || 'Team 1'}
            width={40}
            height={40}
            className='rounded-full border object-cover w-10 h-10'
          />
          <span className='text-xs mt-1'>{team1.name || ''}</span>
          {typeof team1.goals === 'number' && (
            <span className='text-xs font-bold text-green-700'>
              {team1.goals}
            </span>
          )}
        </div>
        <span className='font-bold text-lg text-gray-600'>vs</span>
        <div className='flex flex-col items-center'>
          <Image
            src={team2.avatar || '/no-profile.webp'}
            alt={team2.name || 'Team 2'}
            width={40}
            height={40}
            className='rounded-full border object-cover w-10 h-10'
          />
          <span className='text-xs mt-1'>{team2.name || ''}</span>
          {typeof team2.goals === 'number' && (
            <span className='text-xs font-bold text-green-700'>
              {team2.goals}
            </span>
          )}
        </div>
      </div>
      <div className='flex justify-center mb-2'>
        {typeof stats.jerseyNumber === 'number' && (
          <Badge variant='secondary'>Dorsal: {stats.jerseyNumber}</Badge>
        )}
      </div>
      <div className='flex flex-wrap gap-4 text-sm justify-center'>
        <Badge variant='default'>Minutes: {stats.minutesPlayed}</Badge>
        <Badge variant='default'>Goals: {stats.goals}</Badge>
        <Badge variant='default'>Assists: {stats.assists}</Badge>
        <Badge variant='default'>Passes: {stats.passesCompleted}</Badge>
        <Badge variant='default'>Duels Won: {stats.duelsWon}</Badge>
        <Badge variant='default'>Duels Lost: {stats.duelsLost}</Badge>
      </div>
    </div>
  )
}
