'use client'
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Info } from 'lucide-react'
import { useLiveMatchStore } from '@/lib/stores/liveMatchStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { socket } from '@/app/socket'

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
  const [isLoading, setIsLoading] = useState(true)
  const [matchAlreadyEnded, setMatchAlreadyEnded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    socket.on('connect', () => {
      // Socket connected
    })

    socket.on('disconnect', () => {
      // Socket disconnected
    })
  }, [])

  // Usar el store Zustand
  const {
    timer,
    isRunning,
    isHalfTime,
    isMatchEnded,
    hasUsedHalfTime,
    team1Goals,
    team2Goals,
    playerStats,
    initializeMatch,
    checkMatchEnded,
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
    reset,
  } = useLiveMatchStore()

  // Inicializar el partido cuando se carga el componente (solo una vez)
  useEffect(() => {
    if (isInitialized) return

    const initializeMatchData = async () => {
      // Siempre resetear para limpiar datos del partido anterior
      reset()

      setIsLoading(true)

      // Verificar si el partido ya terminó en la BD
      const isEnded = await checkMatchEnded(match.id)

      if (isEnded) {
        setMatchAlreadyEnded(true)
        setIsLoading(false)
        setIsInitialized(true)
        return
      }

      // Inicializar el partido con los datos correctos
      initializeMatch(
        match.id,
        initialPlayerStats,
        playersTeam1,
        playersTeam2,
        match.team1Id,
        match.team2Id
      )

      setIsLoading(false)
      setIsInitialized(true)
    }

    initializeMatchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.id, isInitialized])

  // Timer effect
  useEffect(() => {
    if (!isRunning || isHalfTime) return

    const interval = setInterval(() => {
      updateTimer()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isHalfTime, updateTimer])

  const [isEndingMatch, setIsEndingMatch] = useState(false)

  // Si el partido ya terminó, mostrar mensaje
  if (matchAlreadyEnded) {
    return (
      <div className='w-full mx-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6'>
        <div className='text-center'>
          <h1 className='text-lg sm:text-xl md:text-2xl font-bold mb-4'>
            {match.team1} vs {match.team2}
          </h1>
          <div className='bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg'>
            <p className='font-semibold'>This match has already ended</p>
            <p className='text-sm mt-1'>
              You cannot restart a match that has already finished.
            </p>
          </div>
          <div className='mt-4'>
            <Link href='/admin/matches/history'>
              <Button variant='outline'>View Match History</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className='w-full mx-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6'>
        <div className='text-center'>
          <p>Loading match...</p>
        </div>
      </div>
    )
  }

  // Obtener jugadores del equipo seleccionado
  const players = selectedTeam === 'team1' ? playersTeam1 : playersTeam2
  const currentTeamId = selectedTeam === 'team1' ? match.team1Id : match.team2Id

  // Handlers
  const handleStart = () => {
    startMatch()
    socket.emit('match:start', { matchId: match.id })
  }

  const handleHalfTime = () => {
    if (isHalfTime) {
      resumeMatch()
    } else {
      pauseMatch()
    }
  }

  const handleEndMatch = async () => {
    if (isEndingMatch || isMatchEnded) return // Prevenir múltiples ejecuciones

    setIsEndingMatch(true)
    try {
      endMatch()
      socket.emit('match:end', { matchId: match.id })
      await saveToDatabase()

      // Refresh the page to update player stats
      router.refresh()
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

    // Obtener el equipo contrario para buscar el portero
    const opposingTeam = team === 'team1' ? playersTeam2 : playersTeam1
    const goalkeeper = opposingTeam.find(
      (player) => player.position === 'goalkeeper'
    )

    addTeamGoal(team, teamId, teamName)

    socket.emit('match:goal', { matchId: match.id, teamId, teamName })

    // Si hay un portero en el equipo contrario, emitir evento de goal_allowed
    if (goalkeeper) {
      const opposingTeamId = team === 'team1' ? match.team2Id : match.team1Id
      socket.emit('match:goal_allowed', {
        matchId: match.id,
        teamId: opposingTeamId,
        playerId: goalkeeper.id,
        playerName: `${goalkeeper.name} ${goalkeeper.lastName}`,
      })
    }
  }

  // NUEVOS HANDLERS PARA EMITIR EVENTOS DE JUGADOR
  const handleAddGoal = (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    addGoal(playerId, team, teamId, playerName)
    socket.emit('match:goal', {
      matchId: match.id,
      teamId,
      playerId,
      playerName,
    })
  }

  const handleAddAssist = (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    addAssist(playerId, team, teamId, playerName)
    socket.emit('match:assist', {
      matchId: match.id,
      teamId,
      playerId,
      playerName,
    })
  }

  const handleAddPass = (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    addPass(playerId, team, teamId, playerName)
    socket.emit('match:pass', {
      matchId: match.id,
      teamId,
      playerId,
      playerName,
    })
  }

  const handleAddGoalSaved = (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    addGoalSaved(playerId, team, teamId, playerName)
    socket.emit('match:goal_saved', {
      matchId: match.id,
      teamId,
      playerId,
      playerName,
    })
  }

  const handleAddGoalAllowed = (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    addGoalAllowed(playerId, team, teamId, playerName)
    socket.emit('match:goal_allowed', {
      matchId: match.id,
      teamId,
      playerId,
      playerName,
    })
  }

  const handleTogglePlayer = (
    playerId: string,
    team: 'team1' | 'team2',
    teamId: string,
    playerName: string
  ) => {
    // Obtener el nuevo estado antes de llamar a togglePlayer
    const current = playerStats[playerId]
    const newStatus = current && current.isPlaying ? 'down' : 'up'
    togglePlayer(playerId, team, teamId, playerName)
    socket.emit('match:player_toggle', {
      matchId: match.id,
      teamId,
      playerId,
      playerName,
      eventType: newStatus,
    })
  }

  return (
    <div className='w-full mx-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 max-h-[100vh] overflow-auto animate-fade-in duration-500'>
      {/* Título responsivo */}
      <h1 className='text-lg sm:text-xl md:text-2xl font-bold mb-4 text-center sm:text-left'>
        {match.team1} vs {match.team2}
      </h1>

      {/* Marcador responsivo */}
      <div className='flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg'>
        {/* Equipo 1 */}
        <div
          className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors w-full sm:w-auto justify-center sm:justify-start ${
            selectedTeam === 'team1' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          onClick={() => handleTeamChange('team1')}
        >
          <Avatar className='w-6 h-6 sm:w-8 sm:h-8'>
            <AvatarImage src={match.team1Avatar} alt={match.team1} />
            <AvatarFallback>{match.team1[0]}</AvatarFallback>
          </Avatar>
          <span className='font-bold text-sm sm:text-base truncate'>
            {match.team1}
          </span>
          <div className='flex items-center gap-1 sm:gap-2'>
            <div className='px-2 sm:px-3 py-1 border rounded bg-white font-bold text-sm sm:text-base'>
              {team1Goals}
            </div>
            <Button
              variant='outline'
              size='sm'
              className='h-6 w-6 sm:h-8 sm:w-8 p-0'
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

        {/* VS */}
        <span className='text-lg sm:text-xl md:text-2xl font-bold'>vs</span>

        {/* Equipo 2 */}
        <div
          className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors w-full sm:w-auto justify-center sm:justify-start ${
            selectedTeam === 'team2' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          onClick={() => handleTeamChange('team2')}
        >
          <div className='flex items-center gap-1 sm:gap-2'>
            <div className='px-2 sm:px-3 py-1 border rounded bg-white font-bold text-sm sm:text-base'>
              {team2Goals}
            </div>
            <Button
              variant='outline'
              size='sm'
              className='h-6 w-6 sm:h-8 sm:w-8 p-0'
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
          <span className='font-bold text-sm sm:text-base truncate'>
            {match.team2}
          </span>
          <Avatar className='w-6 h-6 sm:w-8 sm:h-8'>
            <AvatarImage src={match.team2Avatar} alt={match.team2} />
            <AvatarFallback>{match.team2[0]}</AvatarFallback>
          </Avatar>
        </div>

        {/* End Match Button */}
        {!isMatchEnded && (
          <div className='mt-2 sm:mt-0 sm:ml-4'>
            <Button
              onClick={handleEndMatch}
              variant='ghost'
              size='sm'
              className='bg-destructive/20 text-destructive hover:bg-destructive/30 text-xs sm:text-sm'
              disabled={isEndingMatch || timer === 0 || isHalfTime}
              title={
                timer === 0
                  ? 'Match has not started yet'
                  : isHalfTime
                  ? 'Match is paused during half-time'
                  : 'End the match'
              }
            >
              {isEndingMatch ? 'Ending...' : 'End Match'}
            </Button>
          </div>
        )}
        {isMatchEnded && (
          <div className='mt-2 sm:mt-0 sm:ml-4'>
            <Link href='/admin/matches/history'>
              <Button
                variant='outline'
                size='sm'
                className='text-xs sm:text-sm'
              >
                View History
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Controles del partido responsivos */}
      <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8'>
        <div className='flex items-center gap-2'>
          <span className='text-xl sm:text-2xl md:text-3xl font-mono'>
            ⏱️ {formatTime(timer)}
          </span>
        </div>
        <div className='flex flex-wrap gap-2 justify-center'>
          {!isHalfTime && !isMatchEnded && (
            <Button
              onClick={handleStart}
              disabled={isRunning}
              size='sm'
              className='text-xs sm:text-sm'
            >
              Start
            </Button>
          )}

          {!isMatchEnded && (
            <>
              {/* Solo mostrar Half Time si no se ha usado después del Resume */}
              {!isHalfTime && !hasUsedHalfTime && (
                <Button
                  onClick={handleHalfTime}
                  variant='outline'
                  size='sm'
                  className='text-xs sm:text-sm'
                >
                  Half Time
                </Button>
              )}
              {/* Mostrar Resume solo si está en Half Time */}
              {isHalfTime && (
                <Button
                  onClick={handleHalfTime}
                  variant='default'
                  size='sm'
                  className='bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm'
                >
                  Resume Match
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Half Time Banner */}
      {isHalfTime && (
        <div className='text-center mb-4 sm:mb-6'>
          <div className='bg-orange-100 text-orange-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg inline-block'>
            <span className='text-base sm:text-lg font-semibold'>
              HALF TIME
            </span>
          </div>
        </div>
      )}

      {/* Jugadores responsivos */}
      <div className='flex flex-col gap-4 sm:gap-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto'>
        {players.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-40 sm:h-60'>
            <Info className='w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-4' />
            <span className='text-sm sm:text-lg text-gray-500 text-center px-4'>
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
                className='p-3 sm:p-4 mt-3 sm:mt-5 flex flex-col gap-2 relative justify-center items-center'
              >
                <div className='absolute top-[-15px] sm:top-[-20px] left-[50%] -translate-x-1/2'>
                  <Avatar className='w-12 h-12 sm:w-16 sm:h-16'>
                    <AvatarImage
                      className='w-12 h-12 sm:w-16 sm:h-16 object-cover'
                      src={p.avatar || '/no-profile.webp'}
                      alt={p.name}
                    />
                    <AvatarFallback className='text-xs sm:text-sm'>
                      {p.name[0]}
                      {p.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className='flex items-center gap-2 sm:gap-4 mt-8 sm:mt-10'>
                  <div className='text-center sm:text-left'>
                    <div className='font-semibold text-sm sm:text-base'>
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
                <div className='w-full flex justify-center items-center mt-3 sm:mt-4'>
                  <Button
                    variant={playerStat.isPlaying ? 'default' : 'outline'}
                    onClick={() => {
                      const team = selectedTeam
                      const teamId = currentTeamId
                      const playerName = `${p.name} ${p.lastName}`
                      handleTogglePlayer(p.id, team, teamId, playerName)
                    }}
                    disabled={!isRunning}
                    className='w-full max-w-[120px] text-xs sm:text-sm'
                  >
                    {playerStat.isPlaying ? 'Down' : 'Up'}
                  </Button>
                </div>
                <div className='flex gap-1 sm:gap-2 mt-2 w-full'>
                  {p.position === 'goalkeeper' ? (
                    <div className='flex gap-1 sm:gap-2 w-full justify-center items-center'>
                      <div className='flex flex-col justify-center items-center gap-1 sm:gap-2 w-1/2 bg-gray-100 rounded-md p-1 sm:p-2'>
                        <span className='text-xs text-center'>Goals saved</span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-6 w-6 sm:h-8 sm:w-8'
                          disabled={!playerStat.isPlaying || !isRunning}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            handleAddGoalSaved(p.id, team, teamId, playerName)
                          }}
                        >
                          <span className='text-xs'>
                            {playerStat.goalsSaved}
                          </span>
                        </Button>
                      </div>
                      <div className='flex flex-col justify-center items-center gap-1 sm:gap-2 w-1/2 bg-gray-100 rounded-md p-1 sm:p-2'>
                        <span className='text-xs text-center'>
                          Goals allowed
                        </span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-6 w-6 sm:h-8 sm:w-8'
                          disabled={!playerStat.isPlaying || !isRunning}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            handleAddGoalAllowed(p.id, team, teamId, playerName)
                          }}
                        >
                          <span className='text-xs'>
                            {playerStat.goalsAllowed}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='flex flex-col justify-center items-center gap-1 sm:gap-2 w-1/3 bg-gray-100 rounded-md p-1 sm:p-2'>
                        <span className='text-xs text-center'>Goals</span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-6 w-6 sm:h-8 sm:w-8'
                          disabled={!playerStat.isPlaying || !isRunning}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            handleAddGoal(p.id, team, teamId, playerName)
                          }}
                        >
                          <span className='text-xs'>{playerStat.goals}</span>
                        </Button>
                      </div>
                      <div className='flex flex-col justify-center items-center gap-1 sm:gap-2 w-1/3 bg-gray-100 rounded-md p-1 sm:p-2'>
                        <span className='text-xs text-center'>Assists</span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-6 w-6 sm:h-8 sm:w-8'
                          disabled={!playerStat.isPlaying || !isRunning}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            handleAddAssist(p.id, team, teamId, playerName)
                          }}
                        >
                          <span className='text-xs'>{playerStat.assists}</span>
                        </Button>
                      </div>
                      <div className='flex flex-col justify-center items-center gap-1 sm:gap-2 w-1/3 bg-gray-100 rounded-md p-1 sm:p-2'>
                        <span className='text-xs text-center'>Passes</span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-6 w-6 sm:h-8 sm:w-8'
                          disabled={!playerStat.isPlaying || !isRunning}
                          onClick={() => {
                            const team = selectedTeam
                            const teamId = currentTeamId
                            const playerName = `${p.name} ${p.lastName}`
                            handleAddPass(p.id, team, teamId, playerName)
                          }}
                        >
                          <span className='text-xs'>
                            {playerStat.passesCompleted}
                          </span>
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
