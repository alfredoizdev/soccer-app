'use client'
import React from 'react'
import { Card } from '../ui/card'
import PlayerStatsChart from './PlayerStatsChart'
import GraphGoalKeeper from './GrapGoalKeeper'

export type PlayerStatsAdminProps = {
  position: string
  stats: {
    minutesPlayed: number
    goals: number
    assists: number
    passesCompleted: number
    duelsWon: number
    duelsLost: number
    goalsAllowed?: number
    goalsSaved?: number
  }
}

const PlayerStatsAdmin: React.FC<PlayerStatsAdminProps> = ({
  position,
  stats,
}) => {
  // Normaliza la posición para ser más tolerante
  const normalizedPosition = position.replace(/\s+/g, '').toLowerCase()

  let statItems: { label: string; value: number | string }[] = []
  let chartData: { name: string; value: number; fill: string }[] = []

  if (normalizedPosition === 'goalkeeper') {
    statItems = [
      { label: 'Minutes Played', value: stats.minutesPlayed },
      { label: 'Goals Allowed', value: stats.goalsAllowed ?? 0 },
      { label: 'Goals Saved', value: stats.goalsSaved ?? 0 },
    ]
    chartData = [
      {
        name: 'Goals Allowed',
        value: stats.goalsAllowed ?? 0,
        fill: '#ef4444',
      },
      { name: 'Goals Saved', value: stats.goalsSaved ?? 0, fill: '#10b981' },
    ]
  } else if (normalizedPosition === 'defender') {
    statItems = [
      { label: 'Minutes Played', value: stats.minutesPlayed },
      { label: 'Goals Allowed', value: stats.goalsAllowed ?? 0 },
      { label: 'Goals', value: stats.goals },
      { label: 'Assists', value: stats.assists },
      { label: 'Passes Completed', value: stats.passesCompleted },
      { label: 'Duels Won', value: stats.duelsWon },
      { label: 'Duels Lost', value: stats.duelsLost },
    ]
    chartData = [
      { name: 'Duels Won', value: stats.duelsWon, fill: '#10b981' },
      { name: 'Duels Lost', value: stats.duelsLost, fill: '#ef4444' },
    ]
  } else {
    statItems = [
      { label: 'Minutes Played', value: stats.minutesPlayed },
      { label: 'Goals', value: stats.goals },
      { label: 'Assists', value: stats.assists },
      { label: 'Passes Completed', value: stats.passesCompleted },
      { label: 'Duels Won', value: stats.duelsWon },
      { label: 'Duels Lost', value: stats.duelsLost },
    ]
    chartData = [
      { name: 'Duels Won', value: stats.duelsWon, fill: '#10b981' },
      { name: 'Duels Lost', value: stats.duelsLost, fill: '#ef4444' },
    ]
  }

  return (
    <div className='mb-6'>
      {chartData.length > 1 && normalizedPosition !== 'goalkeeper' && (
        <div className='max-w-xs mx-auto'>
          <PlayerStatsChart
            goals={stats.goals}
            assists={stats.assists}
            passesCompleted={stats.passesCompleted}
            duelsWon={stats.duelsWon}
            duelsLost={stats.duelsLost}
          />
        </div>
      )}
      {chartData.length > 1 && normalizedPosition === 'goalkeeper' && (
        <div className='max-w-xs mx-auto'>
          <GraphGoalKeeper chartData={chartData} />
        </div>
      )}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-4'>
        {statItems.map((item) => (
          <Card key={item.label} className='p-4 text-center'>
            <div className='text-xs text-gray-500'>{item.label}</div>
            <div className='text-xl font-bold'>{item.value}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PlayerStatsAdmin
