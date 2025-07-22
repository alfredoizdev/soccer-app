'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import PlayerStats from './PlayerStats'
import { Badge } from '@/components/ui/badge'

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

interface SoccerFieldProps {
  livePlayersTeam1: Player[]
  livePlayersTeam2: Player[]
  fullImage?: boolean
  heightClass?: string
}

export default function SoccerField({
  livePlayersTeam1,
  livePlayersTeam2,
  fullImage = false,
  heightClass = 'h-[750px]',
}: SoccerFieldProps) {
  // Helpers para posiciones (ajustar según el alto del field)
  const positions = {
    team2: {
      attackers: 'top-[30px]',
      mids: 'top-[140px]',
      defs: 'top-[220px]',
      gk: 'top-[300px]',
    },
    team1: {
      attackers: 'bottom-[250px]',
      mids: 'bottom-[140px]',
      defs: 'bottom-[60px]',
      gk: 'bottom-4',
    },
  }

  // Función para obtener el color del equipo
  const getTeamColor = (isTeam1: boolean) => {
    return isTeam1 ? 'bg-red-500' : 'bg-blue-500'
  }

  // Función para posicionar jugadores en línea horizontal
  const getPlayerPosition = (index: number, total: number) => {
    if (total === 1) return 'left-1/2'
    if (total === 2) return index === 0 ? 'left-1/3' : 'left-2/3'
    if (total === 3)
      return index === 0 ? 'left-1/4' : index === 1 ? 'left-1/2' : 'left-3/4'
    if (total === 4)
      return index === 0
        ? 'left-1/5'
        : index === 1
        ? 'left-2/5'
        : index === 2
        ? 'left-3/5'
        : 'left-4/5'
    return 'left-1/2'
  }

  return (
    <div
      className={
        fullImage
          ? `relative w-full ${heightClass} bg-green-600 rounded-lg mb-6 shadow-lg`
          : `relative w-full ${heightClass} bg-green-600 rounded-lg overflow-hidden mb-6 shadow-lg`
      }
    >
      <Image
        width={1000}
        height={1000}
        src='/field.png'
        alt='Soccer Field'
        className={
          fullImage
            ? 'w-full h-full object-cover'
            : 'w-full h-full object-cover object-bottom'
        }
      />

      {/* Team 2 (arriba) */}
      <div className='absolute top-0 left-0 right-0 h-1/2 pointer-events-none'>
        {livePlayersTeam2.filter((player) => player.status === 'up').length >
        0 ? (
          <>
            {/* Attackers */}
            {livePlayersTeam2
              .filter((player) => player.status === 'up')
              .filter(
                (player) =>
                  player.position?.toLowerCase().includes('attack') ||
                  player.position?.toLowerCase().includes('forward') ||
                  player.position?.toLowerCase().includes('striker')
              )
              .map((player, index, array) => (
                <div
                  key={player.id}
                  className={`absolute ${
                    positions.team2.attackers
                  } ${getPlayerPosition(
                    index,
                    array.length
                  )} transform -translate-x-1/2`}
                >
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 border-2 border-white shadow-lg'>
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback className='bg-gray-400 text-white text-xs font-bold'>
                        {player.name?.[0] || ''}
                        {player.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-xs font-bold text-white text-center mt-1 drop-shadow-lg'>
                      {player.name}
                    </div>
                    <PlayerStats player={player} />
                  </div>
                </div>
              ))}

            {/* Midfielders */}
            {livePlayersTeam2
              .filter((player) => player.status === 'up')
              .filter(
                (player) =>
                  player.position?.toLowerCase().includes('mid') ||
                  player.position?.toLowerCase().includes('center')
              )
              .map((player, index, array) => (
                <div
                  key={player.id}
                  className={`absolute ${
                    positions.team2.mids
                  } ${getPlayerPosition(
                    index,
                    array.length
                  )} transform -translate-x-1/2`}
                >
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 border-2 border-white shadow-lg'>
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback className='bg-gray-400 text-white text-xs font-bold'>
                        {player.name?.[0] || ''}
                        {player.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-xs font-bold text-white text-center mt-1 drop-shadow-lg'>
                      {player.name}
                    </div>
                    <PlayerStats player={player} />
                  </div>
                </div>
              ))}

            {/* Defenders */}
            {livePlayersTeam2
              .filter((player) => player.status === 'up')
              .filter(
                (player) =>
                  player.position?.toLowerCase().includes('def') ||
                  player.position?.toLowerCase().includes('back')
              )
              .map((player, index, array) => (
                <div
                  key={player.id}
                  className={`absolute ${
                    positions.team2.defs
                  } ${getPlayerPosition(
                    index,
                    array.length
                  )} transform -translate-x-1/2`}
                >
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 border-2 border-white shadow-lg'>
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback className='bg-gray-400 text-white text-xs font-bold'>
                        {player.name?.[0] || ''}
                        {player.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-xs font-bold text-white text-center mt-1 drop-shadow-lg'>
                      {player.name}
                    </div>
                    <PlayerStats player={player} />
                  </div>
                </div>
              ))}

            {/* Goalkeeper */}
            {livePlayersTeam2
              .filter((player) => player.status === 'up')
              .filter(
                (player) =>
                  player.position?.toLowerCase().includes('goal') ||
                  player.position?.toLowerCase().includes('keeper')
              )
              .map((player, index, array) => (
                <div
                  key={player.id}
                  className={`absolute ${
                    positions.team2.gk
                  } ${getPlayerPosition(
                    index,
                    array.length
                  )} transform -translate-x-1/2`}
                >
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 border-2 border-white shadow-lg'>
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback className='bg-gray-400 text-white text-xs font-bold'>
                        {player.name?.[0] || ''}
                        {player.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-xs font-bold text-white text-center mt-1 drop-shadow-lg'>
                      {player.name}
                    </div>
                    <PlayerStats player={player} />
                  </div>
                </div>
              ))}
          </>
        ) : (
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
            <Badge
              variant='secondary'
              className='bg-white/90 text-black text-base px-4 py-2 shadow'
            >
              No lineup registered for this team
            </Badge>
          </div>
        )}
      </div>

      {/* Team 1 (abajo) */}
      <div className='absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none'>
        {livePlayersTeam1.filter((player) => player.status === 'up').length >
        0 ? (
          <>
            {/* Attackers */}
            {livePlayersTeam1
              .filter((player) => player.status === 'up')
              .filter(
                (player) =>
                  player.position?.toLowerCase().includes('attack') ||
                  player.position?.toLowerCase().includes('forward') ||
                  player.position?.toLowerCase().includes('striker')
              )
              .map((player, index, array) => (
                <div
                  key={player.id}
                  className={`absolute ${
                    positions.team1.attackers
                  } ${getPlayerPosition(
                    index,
                    array.length
                  )} transform -translate-x-1/2`}
                >
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 border-2 border-white shadow-lg'>
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback className='bg-gray-400 text-white text-xs font-bold'>
                        {player.name?.[0] || ''}
                        {player.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-xs font-bold text-white text-center mt-1 drop-shadow-lg'>
                      {player.name}
                    </div>
                    <PlayerStats player={player} />
                  </div>
                </div>
              ))}

            {/* Midfielders */}
            {livePlayersTeam1
              .filter((player) => player.status === 'up')
              .filter(
                (player) =>
                  player.position?.toLowerCase().includes('mid') ||
                  player.position?.toLowerCase().includes('center')
              )
              .map((player, index, array) => (
                <div
                  key={player.id}
                  className={`absolute ${
                    positions.team1.mids
                  } ${getPlayerPosition(
                    index,
                    array.length
                  )} transform -translate-x-1/2`}
                >
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 border-2 border-white shadow-lg'>
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback
                        className={`${getTeamColor(
                          true
                        )} text-white text-xs font-bold`}
                      >
                        {player.jerseyNumber || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-xs font-bold text-white text-center mt-1 drop-shadow-lg'>
                      {player.name}
                    </div>
                    <PlayerStats player={player} />
                  </div>
                </div>
              ))}

            {/* Defenders */}
            {livePlayersTeam1
              .filter((player) => player.status === 'up')
              .filter(
                (player) =>
                  player.position?.toLowerCase().includes('def') ||
                  player.position?.toLowerCase().includes('back')
              )
              .map((player, index, array) => (
                <div
                  key={player.id}
                  className={`absolute ${
                    positions.team1.defs
                  } ${getPlayerPosition(
                    index,
                    array.length
                  )} transform -translate-x-1/2`}
                >
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 border-2 border-white shadow-lg'>
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback
                        className={`${getTeamColor(
                          true
                        )} text-white text-xs font-bold`}
                      >
                        {player.jerseyNumber || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-xs font-bold text-white text-center mt-1 drop-shadow-lg'>
                      {player.name}
                    </div>
                    <PlayerStats player={player} />
                  </div>
                </div>
              ))}

            {/* Goalkeeper */}
            {livePlayersTeam1
              .filter((player) => player.status === 'up')
              .filter(
                (player) =>
                  player.position?.toLowerCase().includes('goal') ||
                  player.position?.toLowerCase().includes('keeper')
              )
              .map((player, index, array) => (
                <div
                  key={player.id}
                  className={`absolute ${
                    positions.team1.gk
                  } ${getPlayerPosition(
                    index,
                    array.length
                  )} transform -translate-x-1/2`}
                >
                  <div className='flex flex-col items-center'>
                    <Avatar className='w-12 h-12 border-2 border-white shadow-lg'>
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback
                        className={`${getTeamColor(
                          true
                        )} text-white text-xs font-bold`}
                      >
                        {player.jerseyNumber || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-xs font-bold text-white text-center mt-1 drop-shadow-lg'>
                      {player.name}
                    </div>
                    <PlayerStats player={player} />
                  </div>
                </div>
              ))}
          </>
        ) : (
          <div className='absolute bottom-1/4 left-1/2 transform -translate-x-1/2'>
            <Badge
              variant='secondary'
              className='bg-white/90 text-black text-base px-4 py-2 shadow'
            >
              No lineup registered for this team
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
