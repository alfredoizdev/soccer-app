'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFutbol, faSocks, faShield } from '@fortawesome/free-solid-svg-icons'

interface Player {
  id: string
  name: string
  lastName: string
  avatar?: string | null
  jerseyNumber?: number | null
  position?: string | null
  status?: string | null
  goals?: number
  assists?: number
  saves?: number
  goalsAllowed?: number
}

interface TeamsInfoProps {
  teamName: string
  teamAvatar: string
  players: Player[]
}

export default function TeamsInfo({
  teamName,
  teamAvatar,
  players,
}: TeamsInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Avatar className='w-6 h-6'>
            <AvatarImage src={teamAvatar || '/no-club.jpg'} alt={teamName} />
            <AvatarFallback>{teamName.charAt(0)}</AvatarFallback>
          </Avatar>
          {teamName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {players.map((player) => (
            <div
              key={player.id}
              className='flex items-center gap-3 p-2 rounded-lg bg-gray-50'
            >
              <Avatar className='w-8 h-8'>
                <AvatarImage
                  src={player.avatar || '/no-profile.webp'}
                  alt={`${player.name} ${player.lastName}`}
                />
                <AvatarFallback className='text-xs'>
                  {player.name[0]}
                  {player.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='font-medium text-sm'>
                  {player.name} {player.lastName}
                </div>
                <div className='text-xs text-gray-500'>
                  #{player.jerseyNumber} • {player.position}
                </div>
                {/* Mostrar estadísticas del jugador */}
                <div className='flex gap-2 mt-1 text-xs'>
                  {player.goals !== undefined && player.goals > 0 && (
                    <span className='flex items-center gap-1 bg-green-50 border border-green-200 px-1 py-0.5 rounded text-xs font-bold text-green-600'>
                      <FontAwesomeIcon
                        icon={faFutbol}
                        className='w-3 h-3 text-green-600'
                      />
                      {player.goals}
                    </span>
                  )}
                  {player.assists !== undefined && player.assists > 0 && (
                    <span className='flex items-center gap-1 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded text-xs font-bold text-blue-600'>
                      <FontAwesomeIcon
                        icon={faSocks}
                        className='w-3 h-3 text-blue-600'
                      />
                      {player.assists}
                    </span>
                  )}
                  {player.position?.toLowerCase().includes('goal') &&
                    player.goalsAllowed !== undefined &&
                    player.goalsAllowed > 0 && (
                      <span className='flex items-center gap-1 bg-red-50 border border-red-200 px-1 py-0.5 rounded text-xs font-bold text-red-600'>
                        <FontAwesomeIcon
                          icon={faShield}
                          className='w-3 h-3 text-red-600'
                        />
                        {player.goalsAllowed}
                      </span>
                    )}
                  {player.position?.toLowerCase().includes('goal') &&
                    player.saves !== undefined &&
                    player.saves > 0 && (
                      <span className='flex items-center gap-1 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded text-xs font-bold text-blue-600'>
                        <FontAwesomeIcon
                          icon={faShield}
                          className='w-3 h-3 text-blue-600'
                        />
                        {player.saves}
                      </span>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
