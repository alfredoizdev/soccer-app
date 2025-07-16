import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartContainer } from '../ui/chart'

const COLOR_MAP = {
  'Goals Saved': '#b5e4ca', // verde pastel
  'Goals Allowed': '#101828', // azul oscuro
}

export default function GraphGoalKeeper({
  chartData,
}: {
  chartData: { name: string; value: number; fill: string }[]
}) {
  const goalsSaved = chartData.find((d) => d.name === 'Goals Saved')?.value ?? 0
  const goalsAllowed =
    chartData.find((d) => d.name === 'Goals Allowed')?.value ?? 0
  const total = goalsSaved + goalsAllowed
  const eff = total > 0 ? Math.round((goalsSaved / total) * 100) : 0

  // Ordena los datos para que Goals Allowed siempre sea primero, luego Goals Saved
  const orderedData = [
    chartData.find((d) => d.name === 'Goals Allowed'),
    chartData.find((d) => d.name === 'Goals Saved'),
  ].filter(Boolean)

  return (
    <div
      style={{
        width: 240,
        height: 280,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 220,
          height: 220,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChartContainer config={{}} style={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={orderedData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius='80%'
                innerRadius='60%'
                stroke='#fff'
                strokeWidth={2}
                isAnimationActive={false}
                label={false}
              >
                {orderedData.map((entry) => (
                  <Cell
                    key={entry?.name}
                    fill={COLOR_MAP[entry?.name as keyof typeof COLOR_MAP]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 14 }}
                formatter={(value: number, name: string) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        {/* Efectividad en el centro */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{ fontWeight: 700, fontSize: 28, color: '#222' }}
          >{`Eff ${eff}%`}</div>
        </div>
      </div>
      {/* Leyenda debajo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          marginTop: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: 6,
              background: COLOR_MAP['Goals Allowed'],
            }}
          />
          <span style={{ fontSize: 14, color: '#888' }}>Goals Allowed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: 6,
              background: COLOR_MAP['Goals Saved'],
            }}
          />
          <span style={{ fontSize: 14, color: '#888' }}>Goals Saved</span>
        </div>
      </div>
    </div>
  )
}
