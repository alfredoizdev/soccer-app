'use client'
import * as React from 'react'
import { Pie, PieChart, Label } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

interface PlayerEfficiencyDonutProps {
  goals: number
  assists: number
  passesCompleted: number
  minutesPlayed: number
}

const chartConfig: ChartConfig = {
  efficiency: {
    label: 'Efficiency',
    color: '#7be495', // verde pastel
  },
  remainder: {
    label: 'Remainder',
    color: '#b0b0b0', // gris medio
  },
}

export default function PlayerEfficiencyDonut({
  goals,
  assists,
  passesCompleted,
  minutesPlayed,
}: PlayerEfficiencyDonutProps) {
  // Calcular eficiencia como porcentaje
  const efficiency =
    minutesPlayed > 0
      ? ((goals + assists + passesCompleted) / minutesPlayed) * 100
      : 0
  const efficiencyDisplay = Math.round(efficiency)
  const chartData = [
    { name: 'efficiency', value: efficiencyDisplay, fill: '#7be495' },
    {
      name: 'remainder',
      value: 100 - efficiencyDisplay,
      fill: '#b0b0b0',
    },
  ]

  return (
    <Card className='flex flex-col rounded-none'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Player Efficiency</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 pb-0 flex flex-col items-center justify-center'>
        <div className='w-full flex justify-center'>
          <ChartContainer
            config={chartConfig}
            className='w-full max-w-xs aspect-square'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                innerRadius={60}
                strokeWidth={5}
                startAngle={90}
                endAngle={-270}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor='middle'
                          dominantBaseline='middle'
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className='fill-foreground text-3xl font-bold'
                          >
                            {efficiencyDisplay}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className='fill-muted-foreground text-base'
                          >
                            Efficiency
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className='text-xs text-gray-400 mt-2 text-center w-full'>
          Efficiency is calculated as (Goals + Assists + Passes Completed)
          divided by Minutes Played. Higher percentage means more actions per
          minute.
        </div>
      </CardContent>
    </Card>
  )
}
