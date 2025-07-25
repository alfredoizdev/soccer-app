'use client'
import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// Mock de jugadores participantes
const players = [
  {
    id: '1',
    name: 'Juan',
    lastName: 'Pérez',
    avatar: '/no-profile.webp',
    jerseyNumber: 10,
    position: 'goalkeeper',
  },
  {
    id: '2',
    name: 'Pedro',
    lastName: 'Ruiz',
    avatar: '/no-profile.webp',
    jerseyNumber: 7,
    position: 'attack',
  },
  {
    id: '3',
    name: 'Luis',
    lastName: 'Gómez',
    avatar: '/no-profile.webp',
    jerseyNumber: 5,
    position: 'midfielder',
  },
]

type PlayerStat = {
  isPlaying: boolean
  timePlayed: number // segundos
  lastUpTimestamp?: number
  goals: number
  assists: number
  duelsWon: number
  duelsLost: number
  goalsSaved: number
  goalsAllowed: number
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

const initialStats: Record<string, PlayerStat> = {
  '1': {
    isPlaying: true,
    timePlayed: 0,
    goals: 0,
    assists: 0,
    duelsWon: 0,
    duelsLost: 0,
    goalsSaved: 0,
    goalsAllowed: 0,
  },
  '2': {
    isPlaying: false,
    timePlayed: 0,
    goals: 0,
    assists: 0,
    duelsWon: 0,
    duelsLost: 0,
    goalsSaved: 0,
    goalsAllowed: 0,
  },
  '3': {
    isPlaying: true,
    timePlayed: 0,
    goals: 0,
    assists: 0,
    duelsWon: 0,
    duelsLost: 0,
    goalsSaved: 0,
    goalsAllowed: 0,
  },
}

const MATCH_DURATION = 90 * 60 // 90 minutos en segundos

const LiveMatchPage = () => {
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [duration, setDuration] = useState(MATCH_DURATION)
  const [stats, setStats] = useState(initialStats)

  // Timer global
  React.useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev < duration) return prev + 1
        setIsRunning(false)
        return prev
      })
      // Sumar tiempo jugado a los jugadores en cancha
      setStats((prevStats) => {
        const updated = { ...prevStats }
        for (const id in updated) {
          if (updated[id].isPlaying) {
            updated[id].timePlayed += 1
          }
        }
        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, duration])

  // Acciones de timer global
  const handleStart = () => setIsRunning(true)
  const handleSetDuration = (min: number) => {
    setDuration(min * 60)
    setTimer(0)
    setIsRunning(false)
    setStats(initialStats)
  }

  // Acciones de jugador
  const togglePlaying = (id: string) => {
    setStats((prev) => {
      const s = { ...prev }
      s[id].isPlaying = !s[id].isPlaying
      return s
    })
  }

  return (
    <div className='w-full mx-auto py-8 px-4 animate-fade-in duration-500'>
      <h1 className='text-2xl font-bold mb-4'>Partido: Club A vs Club B</h1>
      <div className='flex items-center gap-4 mb-8'>
        <span className='text-3xl font-mono'>⏱️ {formatTime(timer)}</span>
        <Button onClick={handleStart} disabled={isRunning}>
          Start
        </Button>
        <Button
          onClick={() => setIsRunning(false)}
          variant='ghost'
          className='bg-destructive/20 text-destructive'
        >
          End of the match
        </Button>
        <Button onClick={() => handleSetDuration(45)}>Set 45 min</Button>
        <Button onClick={() => handleSetDuration(90)}>Set 90 min</Button>
      </div>
      {/* Cambiar grid a flex-col para mostrar las tarjetas en fila (row) */}
      <div className='flex flex-col gap-6'>
        {players.map((p) => (
          <Card
            key={p.id}
            className='p-4 flex flex-col gap-2 relative justify-center items-center rounded-none'
          >
            <div className='absolute top-[-20px] left-[50%] -translate-x-1/2'>
              <Avatar className='w-16 h-16'>
                <AvatarImage
                  className='w-16 h-16 object-cover'
                  src={p.avatar || '/no-profile.webp'}
                  alt={p.name}
                />
                <AvatarFallback>
                  {p.name[0]}
                  {p.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className='flex items-center gap-4 mt-10'>
              <div>
                <div className='font-semibold'>
                  {p.name} {p.lastName}{' '}
                  <span className='text-gray-400'>#{p.jerseyNumber}</span>
                  <span className='text-gray-400'>
                    {' '}
                    ({p.position.charAt(0).toUpperCase() + p.position.slice(1)})
                  </span>
                </div>
                <div className='text-xs text-gray-500'>
                  Time played: {formatTime(stats[p.id].timePlayed)}
                </div>
              </div>
            </div>
            <div className='w-3xs flex justify-center items-center mt-4'>
              <Button
                variant={stats[p.id].isPlaying ? 'default' : 'outline'}
                onClick={() => togglePlaying(p.id)}
                className='w-full'
              >
                {stats[p.id].isPlaying ? 'Down' : 'Up'}
              </Button>
            </div>
            <div className='flex gap-2 mt-2 w-full'>
              {p.position === 'goalkeeper' ? (
                <div className='flex gap-2 w-full justify-center items-center'>
                  <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                    <span className='text-xs text-center'>Goals saved</span>
                    <Button variant='outline' size='icon'>
                      0
                    </Button>
                  </div>
                  <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                    <span className='text-xs text-center'>Goals allowed</span>
                    <Button variant='outline' size='icon'>
                      0
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                    <span className='text-xs text-center'>Goles</span>
                    <Button variant='outline' size='icon'>
                      0
                    </Button>
                  </div>
                  <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                    <span className='text-xs text-center'>Assists</span>
                    <Button variant='outline' size='icon'>
                      0
                    </Button>
                  </div>
                  <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                    <span className='text-xs text-center'>Passes</span>
                    <Button variant='outline' size='icon'>
                      0
                    </Button>
                  </div>
                  <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                    <span className='text-xs text-center'>Lost duels</span>
                    <Button variant='outline' size='icon'>
                      0
                    </Button>
                  </div>
                  <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                    <span className='text-xs text-center'>Won duels</span>
                    <Button variant='outline' size='icon'>
                      0
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default LiveMatchPage
