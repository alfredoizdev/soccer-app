'use client'

import { faSocks, faShield, faFutbol } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

interface PlayerStatsProps {
  player: Player
}

export default function PlayerStats({ player }: PlayerStatsProps) {
  const isGoalkeeper = player.position?.toLowerCase().includes('goal')

  // Solo mostrar estadísticas si hay valores mayores a 0
  const hasStats =
    (player.goals && player.goals > 0) ||
    (player.assists && player.assists > 0) ||
    (isGoalkeeper && player.saves && player.saves > 0) ||
    (isGoalkeeper && player.goalsAllowed && player.goalsAllowed > 0)

  // Si no hay estadísticas, no mostrar nada
  if (!hasStats) {
    return null
  }

  return (
    <div className='flex items-center gap-1 mt-1'>
      {/* Goles - mismo icono y color que timeline */}
      {player.goals && player.goals > 0 && (
        <div className='flex items-center gap-1 bg-green-50 border border-green-200 px-1 py-0.5 rounded text-xs font-bold text-green-600'>
          <FontAwesomeIcon icon={faFutbol} className='w-3 h-3 text-green-600' />
          {player.goals}
        </div>
      )}

      {/* Asistencias - mismo icono y color que timeline */}
      {player.assists && player.assists > 0 && (
        <div className='flex items-center gap-1 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded text-xs font-bold text-blue-600'>
          <FontAwesomeIcon icon={faSocks} className='w-3 h-3 text-blue-600' />
          {player.assists}
        </div>
      )}

      {/* Estadísticas específicas del portero */}
      {isGoalkeeper && (
        <>
          {/* Paradas - mismo icono y color que timeline goal_saved */}
          {player.saves && player.saves > 0 && (
            <div className='flex items-center gap-1 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded text-xs font-bold text-blue-600'>
              <FontAwesomeIcon
                icon={faShield}
                className='w-3 h-3 text-blue-600'
              />
              {player.saves}
            </div>
          )}

          {/* Goles permitidos - mismo icono y color que timeline goal_allowed */}
          {player.goalsAllowed && player.goalsAllowed > 0 && (
            <div className='flex items-center gap-1 bg-red-50 border border-red-200 px-1 py-0.5 rounded text-xs font-bold text-red-600'>
              <FontAwesomeIcon
                icon={faShield}
                className='w-3 h-3 text-red-600'
              />
              {player.goalsAllowed}
            </div>
          )}
        </>
      )}
    </div>
  )
}
