'use client'
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Info } from 'lucide-react'
import { useLiveMatch } from '@/hooks/useLiveMatch'
import Link from 'next/link'

type Player = {
  id: string
  name: string
  lastName: string
  avatar?: string | null
  jerseyNumber?: number | null
  position?: string | null
}

type Match = {
  id: string
  date: string | Date
  team1: string
  team2: string
  team1Id: string
  team2Id: string
  team1Goals: number
  team2Goals: number
  team1Avatar: string
  team2Avatar: string
}

type PlayerStat = {
  id: string
  isPlaying: boolean
  timePlayed: number // segundos
  lastUpTimestamp?: number
  goals: number
  assists: number
  goalsSaved: number
  goalsAllowed: number
  passesCompleted: number
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

const MATCH_DURATION = 90 * 60 // 90 minutos en segundos

export default function LiveMatchPageClient({
  match,
  playersTeam1,
  playersTeam2,
  initialPlayerStats,
}: {
  match: Match
  playersTeam1: Player[]
  playersTeam2: Player[]
  initialPlayerStats: Record<
    string,
    {
      id: string
      timePlayed: number
      goals: number
      assists: number
      passesCompleted: number
      goalsAllowed: number
      goalsSaved: number
      isPlaying: boolean
    }
  >
}) {
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2'>('team1')
  const players = selectedTeam === 'team1' ? playersTeam1 : playersTeam2

  // Inicializar stats para TODOS los jugadores desde la base de datos
  const allPlayers = [...playersTeam1, ...playersTeam2]
  const initialStats: Record<string, PlayerStat> = Object.fromEntries(
    allPlayers.map((p) => {
      const dbStats = initialPlayerStats[p.id]
      return [
        p.id,
        {
          id: dbStats?.id || '',
          isPlaying: dbStats?.isPlaying || true,
          timePlayed: dbStats?.timePlayed || 0, // Ya está en segundos
          goals: dbStats?.goals || 0,
          assists: dbStats?.assists || 0,

          goalsSaved: dbStats?.goalsSaved || 0,
          goalsAllowed: dbStats?.goalsAllowed || 0,
          passesCompleted: dbStats?.passesCompleted || 0,
        },
      ]
    })
  )

  const [timer, setTimer] = useState(0)
  const [duration, setDuration] = useState(MATCH_DURATION)

  // Usar el hook personalizado para manejar las estadísticas
  const {
    stats,
    matchScore,
    isRunning,
    setIsRunning,
    updatePlayerStat,
    updateScore,
    togglePlayer,
    updateTimePlayed,
    endMatch,
    pendingUpdates,
  } = useLiveMatch(match.id, initialStats, {
    team1Goals: match.team1Goals,
    team2Goals: match.team2Goals,
  })

  // Timer global
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev < duration) return prev + 1
        setIsRunning(false)
        return prev
      })
      // Actualizar tiempo jugado de los jugadores
      updateTimePlayed()
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, duration, setIsRunning, updateTimePlayed])

  // Acciones de timer global
  const handleStart = () => setIsRunning(true)
  const handleSetDuration = (min: number) => {
    setDuration(min * 60)
    setTimer(0)
    setIsRunning(false)
  }

  // Acciones de jugador
  const togglePlaying = (id: string) => {
    togglePlayer(id)
  }

  // Función para cambiar de equipo
  const handleTeamChange = (team: 'team1' | 'team2') => {
    setSelectedTeam(team)
  }

  return (
    <div className='w-full mx-auto py-8 px-4 max-h-[100vh] overflow-auto animate-fade-in duration-500'>
      <h1 className='text-2xl font-bold mb-4'>
        Match: {match.team1} vs {match.team2}
      </h1>

      {/* Marcador */}
      <div className='flex justify-center items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <Avatar className='w-8 h-8'>
            <AvatarImage src={match.team1Avatar} alt={match.team1} />
            <AvatarFallback>{match.team1[0]}</AvatarFallback>
          </Avatar>
          <span className='font-bold'>{match.team1}</span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => updateScore('team1', matchScore.team1Goals + 1)}
          >
            {matchScore.team1Goals}
          </Button>
        </div>
        <span className='text-2xl font-bold'>vs</span>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => updateScore('team2', matchScore.team2Goals + 1)}
          >
            {matchScore.team2Goals}
          </Button>
          <span className='font-bold'>{match.team2}</span>
          <Avatar className='w-8 h-8'>
            <AvatarImage src={match.team2Avatar} alt={match.team2} />
            <AvatarFallback>{match.team2[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className='flex gap-4 justify-center mb-6'>
        <Button
          variant={selectedTeam === 'team1' ? 'default' : 'outline'}
          onClick={() => handleTeamChange('team1')}
          className='flex items-center gap-2'
        >
          <Avatar className='w-6 h-6'>
            <AvatarImage
              src={match.team1Avatar || '/no-club.jpg'}
              alt={match.team1}
              className='w-6 h-6 object-cover'
            />
            <AvatarFallback>{match.team1[0]}</AvatarFallback>
          </Avatar>
          {match.team1}
        </Button>
        <Button
          variant={selectedTeam === 'team2' ? 'default' : 'outline'}
          onClick={() => handleTeamChange('team2')}
          className='flex items-center gap-2'
        >
          <Avatar className='w-6 h-6'>
            <AvatarImage
              className='w-6 h-6 object-cover'
              src={match.team2Avatar || '/no-club.jpg'}
              alt={match.team2}
            />
            <AvatarFallback>{match.team2[0]}</AvatarFallback>
          </Avatar>
          {match.team2}
        </Button>
      </div>
      <div className='flex items-center gap-4 mb-8'>
        <span className='text-3xl font-mono'>⏱️ {formatTime(timer)}</span>
        <Button onClick={handleStart} disabled={isRunning}>
          Start
        </Button>
        <Button
          onClick={() => endMatch()}
          variant='ghost'
          className='bg-destructive/20 text-destructive'
        >
          End of the match
        </Button>
        <Link href='/admin/matches/history'>
          <Button variant='outline'>View History</Button>
        </Link>
        <Button onClick={() => handleSetDuration(45)}>Set 45 min</Button>
        <Button onClick={() => handleSetDuration(90)}>Set 90 min</Button>
      </div>
      <div className='flex flex-col gap-6 sm:max-h-[100vh] max-h-[400px] overflow-y-auto'>
        {players.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-60'>
            <Info className='w-12 h-12 text-gray-400 mb-4' />
            <span className='text-lg text-gray-500 text-center'>
              This club has no lineup available.
              <br />
              Please contact the administrator or check the team configuration.
            </span>
          </div>
        ) : (
          players.map((p) => (
            <Card
              key={p.id}
              className='p-4 mt-5 flex flex-col gap-2 relative justify-center items-center'
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
                      (
                      {p.position
                        ? p.position.charAt(0).toUpperCase() +
                          p.position.slice(1)
                        : ''}
                      )
                    </span>
                  </div>
                  <div className='text-xs text-gray-500'>
                    Time played: {formatTime(stats[p.id]?.timePlayed || 0)}
                    {pendingUpdates.has(p.id) && (
                      <span className='ml-2 text-blue-500'>●</span>
                    )}
                  </div>
                </div>
              </div>
              <div className='w-3xs flex justify-center items-center mt-4'>
                <Button
                  variant={stats[p.id]?.isPlaying ? 'default' : 'outline'}
                  onClick={() => togglePlaying(p.id)}
                  className='w-full'
                >
                  {stats[p.id]?.isPlaying ? 'Down' : 'Up'}
                </Button>
              </div>
              <div className='flex gap-2 mt-2 w-full'>
                {p.position === 'goalkeeper' ? (
                  <div className='flex gap-2 w-full justify-center items-center'>
                    <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                      <span className='text-xs text-center'>Goals saved</span>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() =>
                          updatePlayerStat(
                            p.id,
                            'goalsSaved',
                            (stats[p.id]?.goalsSaved || 0) + 1
                          )
                        }
                      >
                        {stats[p.id]?.goalsSaved || 0}
                      </Button>
                    </div>
                    <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                      <span className='text-xs text-center'>Goals allowed</span>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() =>
                          updatePlayerStat(
                            p.id,
                            'goalsAllowed',
                            (stats[p.id]?.goalsAllowed || 0) + 1
                          )
                        }
                      >
                        {stats[p.id]?.goalsAllowed || 0}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                      <span className='text-xs text-center'>Goles</span>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => {
                          updatePlayerStat(
                            p.id,
                            'goals',
                            (stats[p.id]?.goals || 0) + 1
                          )
                          // Automáticamente sumar al marcador del equipo correspondiente
                          if (selectedTeam === 'team1') {
                            updateScore('team1', matchScore.team1Goals + 1)
                          } else {
                            updateScore('team2', matchScore.team2Goals + 1)
                          }
                        }}
                      >
                        {stats[p.id]?.goals || 0}
                      </Button>
                    </div>
                    <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                      <span className='text-xs text-center'>Assists</span>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() =>
                          updatePlayerStat(
                            p.id,
                            'assists',
                            (stats[p.id]?.assists || 0) + 1
                          )
                        }
                      >
                        {stats[p.id]?.assists || 0}
                      </Button>
                    </div>
                    <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                      <span className='text-xs text-center'>Passes</span>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() =>
                          updatePlayerStat(
                            p.id,
                            'passesCompleted',
                            (stats[p.id]?.passesCompleted || 0) + 1
                          )
                        }
                      >
                        {stats[p.id]?.passesCompleted || 0}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
