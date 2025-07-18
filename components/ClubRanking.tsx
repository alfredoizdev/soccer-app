import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFutbol } from '@fortawesome/free-regular-svg-icons'
import { faSocks } from '@fortawesome/free-solid-svg-icons'

export type ClubRankingPlayer = {
  id: string
  name: string
  lastName: string
  avatar?: string | null
  jerseyNumber?: number | null
  position?: string | null
  goals: number
  assists: number
  passesCompleted: number
  duelsWon: number
  duelsLost: number
  minutesPlayed: number
}

interface ClubRankingProps {
  ranking: ClubRankingPlayer[]
  currentPlayerId: string
}

export default function ClubRanking({
  ranking,
  currentPlayerId,
}: ClubRankingProps) {
  if (!ranking.length) return null
  return (
    <div className='w-full'>
      <div className='bg-white rounded-lg p-4 shadow-sm'>
        <h2 className='text-xl font-bold mb-2 text-center'>Club Ranking</h2>
        <div className='flex flex-col gap-2'>
          {ranking.map((p, idx) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 p-2 rounded ${
                p.id === currentPlayerId ? 'bg-blue-50 font-bold' : ''
              }`}
            >
              <span className='w-5 text-right'>{idx + 1}.</span>
              <Image
                src={p.avatar || '/no-profile.webp'}
                alt={p.name}
                width={32}
                height={32}
                className='rounded-full object-cover border w-8 h-8'
              />
              <span className='flex-1 truncate'>
                {p.name} {p.lastName}
                {p.jerseyNumber ? (
                  <span className='text-gray-400 ml-1'>#{p.jerseyNumber}</span>
                ) : null}
              </span>
              {/* Goles y asistencias mejor alineados, colores más suaves y separador */}
              <span className='flex items-center gap-1 text-gray-700 font-semibold'>
                <FontAwesomeIcon icon={faFutbol} className='w-4 h-4' />
                {p.goals}
              </span>
              <span className='mx-2 text-gray-300 font-bold'>|</span>
              <span className='flex items-center gap-1 text-gray-400 font-semibold'>
                <FontAwesomeIcon icon={faSocks} className='w-4 h-4' />
                {p.assists}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
