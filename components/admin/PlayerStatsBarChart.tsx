'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface PlayerStatsBarChartProps {
  goalsPerMatch: number
  assistsPerMatch: number
  minutesPerMatch: number
  passesPerMatch: number
}

const chartConfig: ChartConfig = {
  value: {
    label: 'Value',
    color: 'var(--chart-1)',
  },
}

export default function PlayerStatsPerformance({
  goalsPerMatch,
  assistsPerMatch,
  minutesPerMatch,
  passesPerMatch,
}: PlayerStatsBarChartProps) {
  const chartData = [
    { stat: 'Goals/Match', value: Number(goalsPerMatch.toFixed(1)) },
    { stat: 'Assists/Match', value: Number(assistsPerMatch.toFixed(1)) },
    { stat: 'Min/Match', value: Number(minutesPerMatch.toFixed(1)) },
    { stat: 'Passes/Match', value: Number(passesPerMatch.toFixed(1)) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Averages</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            width={350}
            height={220}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='stat'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey='value' fill='var(--color-desktop)' radius={8}>
              {/* Mostrar valores encima de cada barra */}
              {chartData.map((entry, index) => (
                <text
                  key={index}
                  x={70 + index * 55}
                  y={200 - entry.value * 1.7} // Ajusta el factor según escala
                  fill='#888'
                  fontSize={12}
                  textAnchor='middle'
                >
                  {entry.value}
                </text>
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        {/* Explicación de cómo leer el gráfico */}
        <div className='text-xs text-gray-400 mt-2'>
          This chart shows the player&apos;s average performance per match.
          Higher bars indicate better performance in that stat. Compare the
          height of each bar to quickly identify strengths and weaknesses.
        </div>
      </CardContent>
    </Card>
  )
}
