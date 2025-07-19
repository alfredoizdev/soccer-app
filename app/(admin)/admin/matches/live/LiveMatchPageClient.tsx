'use client'
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Info } from 'lucide-react'
import { useLiveMatchStore } from '@/lib/stores/liveMatchStore'
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

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

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

  // Usar el store Zustand
  const {
    matchId,
    timer,
    isRunning,
    isHalfTime,
    isMatchEnded,
    hasUsedHalfTime,
    team1Goals,
    team2Goals,
    playerStats,
    initializeMatch,
    startMatch,
    pauseMatch,
    resumeMatch,
    endMatch,
    updateTimer,
    addGoal,
    addTeamGoal,
    addAssist,
    addPass,
    addGoalSaved,
    addGoalAllowed,
    togglePlayer,
    saveToDatabase,
    hasRegisteredPlayers,
  } = useLiveMatchStore()

  // Inicializar el partido cuando se carga el componente
  useEffect(() => {
    // Siempre inicializar si no hay matchId o si playerStats está vacío
    if (!matchId || Object.keys(playerStats).length === 0) {
      initializeMatch(
        match.id,
        initialPlayerStats,
        playersTeam1,
        playersTeam2,
        match.team1Id,
        match.team2Id
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    match.id,
    initialPlayerStats,
    matchId,
    playerStats,
    initializeMatch,
    playersTeam1,
    playersTeam2,
  ])

  // Timer effect
  useEffect(() => {
    if (!isRunning || isHalfTime) return

    const interval = setInterval(() => {
      updateTimer()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isHalfTime, updateTimer])

  // Obtener jugadores del equipo seleccionado
  const players = selectedTeam === 'team1' ? playersTeam1 : playersTeam2
  const currentTeamId = selectedTeam === 'team1' ? match.team1Id : match.team2Id

  // Handlers
  const handleStart = () => {
    startMatch()
  }

  const handleHalfTime = () => {
    if (isHalfTime) {
      resumeMatch()
    } else {
      pauseMatch()
    }
  }

  const [isEndingMatch, setIsEndingMatch] = useState(false)

  const handleEndMatch = async () => {
    if (isEndingMatch || isMatchEnded) return // Prevenir múltiples ejecuciones

    setIsEndingMatch(true)
    try {
      endMatch()
      await saveToDatabase()
    } catch (error) {
      console.error('Error ending match:', error)
    } finally {
      setIsEndingMatch(false)
    }
  }

  const handleTeamChange = (team: 'team1' | 'team2') => {
    setSelectedTeam(team)
  }

  const handleTeamGoal = (team: 'team1' | 'team2') => {
    const teamId = team === 'team1' ? match.team1Id : match.team2Id
    const teamName = team === 'team1' ? match.team1 : match.team2
    addTeamGoal(team, teamId, teamName)
  }

  return (
    <div className='w-full mx-auto py-8 px-4 max-h-[100vh] overflow-auto animate-fade-in duration-500'>
      <h1 className='text-2xl font-bold mb-4'>
        Match: {match.team1} vs {match.team2}
      </h1>

      {/* Marcador */}
      <div className='flex justify-center items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
        <div
          className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${
            selectedTeam === 'team1' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          onClick={() => handleTeamChange('team1')}
        >
          <Avatar className='w-8 h-8'>
            <AvatarImage src={match.team1Avatar} alt={match.team1} />
            <AvatarFallback>{match.team1[0]}</AvatarFallback>
          </Avatar>
          <span className='font-bold'>{match.team1}</span>
          <div className='flex items-center gap-2'>
            <div className='px-3 py-1 border rounded bg-white font-bold'>
              {team1Goals}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                handleTeamGoal('team1')
              }}
              disabled={hasRegisteredPlayers('team1')}
              title={
                hasRegisteredPlayers('team1')
                  ? 'Team has registered players - use individual player goals'
                  : 'Add team goal (for unregistered players)'
              }
            >
              +
            </Button>
          </div>
        </div>
        <span className='text-2xl font-bold'>vs</span>
        <div
          className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${
            selectedTeam === 'team2' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          onClick={() => handleTeamChange('team2')}
        >
          <div className='flex items-center gap-2'>
            <div className='px-3 py-1 border rounded bg-white font-bold'>
              {team2Goals}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                handleTeamGoal('team2')
              }}
              disabled={hasRegisteredPlayers('team2')}
              title={
                hasRegisteredPlayers('team2')
                  ? 'Team has registered players - use individual player goals'
                  : 'Add team goal (for unregistered players)'
              }
            >
              +
            </Button>
          </div>
          <span className='font-bold'>{match.team2}</span>
          <Avatar className='w-8 h-8'>
            <AvatarImage src={match.team2Avatar} alt={match.team2} />
            <AvatarFallback>{match.team2[0]}</AvatarFallback>
          </Avatar>
        </div>

        {/* End Match Button */}
        {!isMatchEnded && (
          <div className='ml-4'>
            <Button
              onClick={handleEndMatch}
              variant='ghost'
              className='bg-destructive/20 text-destructive hover:bg-destructive/30'
              disabled={isEndingMatch || timer === 0 || isHalfTime}
              title={
                timer === 0
                  ? 'Match has not started yet'
                  : isHalfTime
                  ? 'Match is paused during half-time'
                  : 'End the match'
              }
            >
              {isEndingMatch ? 'Ending Match...' : 'End Match'}
            </Button>
          </div>
        )}
        {isMatchEnded && (
          <div className='ml-4'>
            <Link href='/admin/matches/history'>
              <Button variant='outline'>View History</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Controles del partido */}
      <div className='flex items-center justify-center gap-4 mb-8'>
        <div className='flex items-center gap-2'>
          <span className='text-3xl font-mono'>⏱️ {formatTime(timer)}</span>
        </div>
        {!isHalfTime && !isMatchEnded && (
          <Button onClick={handleStart} disabled={isRunning}>
            Start
          </Button>
        )}
        {!isMatchEnded && (
          <>
            {/* Solo mostrar Half Time si no se ha usado después del Resume */}
            {!isHalfTime && !hasUsedHalfTime && (
              <Button onClick={handleHalfTime} variant='outline'>
                Half Time
              </Button>
            )}
            {/* Mostrar Resume solo si está en Half Time */}
            {isHalfTime && (
              <Button
                onClick={handleHalfTime}
                variant='default'
                className='bg-orange-500 hover:bg-orange-600'
              >
                Resume Match
              </Button>
            )}
          </>
        )}
      </div>

      {/* Half Time Banner */}
      {isHalfTime && (
        <div className='text-center mb-6'>
          <div className='bg-orange-100 text-orange-800 px-6 py-3 rounded-lg inline-block'>
            <span className='text-lg font-semibold'>HALF TIME</span>
          </div>
        </div>
      )}

      {/* Jugadores */}
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
          players.map((p) => {
            const playerStat = playerStats[p.id] || {
              id: p.id,
              isPlaying: true,
              timePlayed: 0,
              goals: 0,
              assists: 0,
              goalsSaved: 0,
              goalsAllowed: 0,
              passesCompleted: 0,
            }

            return (
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
                      Time played: {formatTime(playerStat.timePlayed)}
                    </div>
                  </div>
                </div>
                <div className='w-3xs flex justify-center items-center mt-4'>
                  <Button
                    variant={playerStat.isPlaying ? 'default' : 'outline'}
                    onClick={() => {
                      const team = selectedTeam
                      const teamId = currentTeamId
                      const playerName = `${p.name} ${p.lastName}`
                      togglePlayer(p.id, team, teamId, playerName)
                    }}
                    className='w-full'
                  >
                    {playerStat.isPlaying ? 'Down' : 'Up'}
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
                          disabled={!playerStat.isPlaying}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            addGoalSaved(p.id, team, teamId, playerName)
                          }}
                        >
                          {playerStat.goalsSaved}
                        </Button>
                      </div>
                      <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                        <span className='text-xs text-center'>
                          Goals allowed
                        </span>
                        <Button
                          variant='outline'
                          size='icon'
                          disabled={!playerStat.isPlaying}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            addGoalAllowed(p.id, team, teamId, playerName)
                          }}
                        >
                          {playerStat.goalsAllowed}
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
                          disabled={!playerStat.isPlaying}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            addGoal(p.id, team, teamId, playerName)
                          }}
                        >
                          {playerStat.goals}
                        </Button>
                      </div>
                      <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                        <span className='text-xs text-center'>Assists</span>
                        <Button
                          variant='outline'
                          size='icon'
                          disabled={!playerStat.isPlaying}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            addAssist(p.id, team, teamId, playerName)
                          }}
                        >
                          {playerStat.assists}
                        </Button>
                      </div>
                      <div className='flex flex-col justify-center items-center gap-2 w-1/3 bg-gray-100 rounded-md p-2'>
                        <span className='text-xs text-center'>Passes</span>
                        <Button
                          variant='outline'
                          size='icon'
                          disabled={!playerStat.isPlaying}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            addPass(p.id, team, teamId, playerName)
                          }}
                        >
                          {playerStat.passesCompleted}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
