'use client'

import { ChartContainer } from '@/components/ui/chart'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts'

interface PlayerStatsChartProps {
  goals: number
  assists: number
  passesCompleted: number
  duelsWon: number
  duelsLost: number
}

const chartConfig = {
  Goals: { label: 'Goals', color: '#3b82f6' },
  Assists: { label: 'Assists', color: '#10b981' },
  Passes: { label: 'Passes Completed', color: '#f59e42' },
  DuelsWon: { label: 'Duels Won', color: '#6366f1' },
  DuelsLost: { label: 'Duels Lost', color: '#ef4444' },
}

export default function PlayerStatsChart({
  goals,
  assists,
  passesCompleted,
  duelsWon,
  duelsLost,
}: PlayerStatsChartProps) {
  const data = [
    { stat: 'Goals', value: goals },
    { stat: 'Assists', value: assists },
    { stat: 'Passes', value: passesCompleted },
    { stat: 'DuelsWon', value: duelsWon },
    { stat: 'DuelsLost', value: duelsLost },
  ]

  return (
    <div className='w-full max-w-md mx-auto mb-8'>
      <ChartContainer config={chartConfig}>
        <RadarChart data={data} outerRadius={90}>
          <PolarGrid />
          <PolarAngleAxis dataKey='stat' />
          <PolarRadiusAxis
            angle={30}
            domain={[
              0,
              Math.max(goals, assists, passesCompleted, duelsWon, duelsLost, 5),
            ]}
            tick={false}
            axisLine={false}
            tickLine={false}
          />
          <Radar
            name='Player Stats'
            dataKey='value'
            stroke='#3b82f6'
            fill='#3b82f6'
            fillOpacity={0.4}
          />
          <Tooltip />
        </RadarChart>
      </ChartContainer>
    </div>
  )
}
