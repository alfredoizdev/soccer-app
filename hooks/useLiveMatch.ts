import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  updateLivePlayerStats,
  updateLiveMatchScore,
  endLiveMatch,
} from '@/lib/actions/matches.action'

interface PlayerStat {
  id: string
  isPlaying: boolean
  timePlayed: number
  goals: number
  assists: number
  goalsSaved: number
  goalsAllowed: number
  passesCompleted: number
}

interface MatchScore {
  team1Goals: number
  team2Goals: number
}

export function useLiveMatch(
  matchId: string,
  initialStats: Record<string, PlayerStat>,
  initialScore: MatchScore
) {
  const [stats, setStats] = useState<Record<string, PlayerStat>>(initialStats)
  const [matchScore, setMatchScore] = useState<MatchScore>(initialScore)
  const [isRunning, setIsRunning] = useState(false)
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set())

  // Debounced update function
  const debouncedUpdate = useCallback(
    (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let timeout: any
      return async (playerId: string, updates: Partial<PlayerStat>) => {
        clearTimeout(timeout)
        timeout = setTimeout(async () => {
          try {
            await updateLivePlayerStats({
              matchId,
              playerId,
              stats: updates,
            })
            setPendingUpdates((prev) => {
              const newSet = new Set(prev)
              newSet.delete(playerId)
              return newSet
            })
          } catch (error) {
            console.error('Error updating player stats:', error)
            toast.error('Failed to update player stats')
          }
        }, 1000)
      }
    })(),
    [matchId]
  )

  // Update player stats
  const updatePlayerStats = useCallback(
    (playerId: string, updates: Partial<PlayerStat>) => {
      setStats((prev) => ({
        ...prev,
        [playerId]: { ...prev[playerId], ...updates },
      }))

      setPendingUpdates((prev) => new Set(prev).add(playerId))
      debouncedUpdate(playerId, updates)
    },
    [debouncedUpdate, stats]
  )

  // Toggle player playing status
  const togglePlayer = useCallback(
    (playerId: string) => {
      const newIsPlaying = !stats[playerId]?.isPlaying
      setStats((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          isPlaying: newIsPlaying,
        },
      }))

      // Actualizar en la base de datos inmediatamente con solo los campos actualizables
      const currentPlayerStats = stats[playerId]
      const updatedStats = {
        isPlaying: newIsPlaying,
        timePlayed: currentPlayerStats.timePlayed,
        goals: currentPlayerStats.goals,
        assists: currentPlayerStats.assists,
        passesCompleted: currentPlayerStats.passesCompleted,
        goalsAllowed: currentPlayerStats.goalsAllowed,
        goalsSaved: currentPlayerStats.goalsSaved,
      }

      updateLivePlayerStats({
        matchId,
        playerId,
        stats: updatedStats,
      }).catch((error) => {
        console.error('Error updating player status:', error)
      })
    },
    [matchId, stats]
  )

  // Update match score
  const updateScore = useCallback(
    async (team: 'team1' | 'team2', goals: number) => {
      try {
        const newScore = {
          team1Goals: team === 'team1' ? goals : matchScore.team1Goals,
          team2Goals: team === 'team2' ? goals : matchScore.team2Goals,
        }

        await updateLiveMatchScore({
          matchId,
          team1Goals: newScore.team1Goals,
          team2Goals: newScore.team2Goals,
        })

        setMatchScore(newScore)
        toast.success('Score updated successfully')
      } catch (error) {
        toast.error('Failed to update score')
        console.error('Error updating score:', error)
      }
    },
    [matchId, matchScore]
  )

  // End match and transfer data to permanent tables
  const endMatch = useCallback(async () => {
    try {
      await endLiveMatch(matchId)
      setIsRunning(false)
      toast.success('Match ended successfully')
    } catch (error) {
      toast.error('Failed to end match')
      console.error('Error ending match:', error)
    }
  }, [matchId])

  // Update time played for all playing players
  const updateTimePlayed = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev }
      for (const playerId in updated) {
        if (updated[playerId].isPlaying) {
          updated[playerId].timePlayed += 1
        }
      }
      return updated
    })
  }, [])

  // Save time played periodically - REDUCIDO A UNA VEZ POR MINUTO
  useEffect(() => {
    if (!isRunning) return

    const saveInterval = setInterval(async () => {
      // Solo guardar si hay cambios pendientes o cada 60 segundos
      const hasPendingUpdates = pendingUpdates.size > 0

      if (hasPendingUpdates) {
        for (const playerId of pendingUpdates) {
          const playerStat = stats[playerId]
          if (playerStat && playerStat.isPlaying) {
            try {
              // Send only the fields that can be updated
              const updateableStats = {
                isPlaying: playerStat.isPlaying,
                timePlayed: playerStat.timePlayed,
                goals: playerStat.goals,
                assists: playerStat.assists,
                passesCompleted: playerStat.passesCompleted,
                goalsAllowed: playerStat.goalsAllowed,
                goalsSaved: playerStat.goalsSaved,
              }

              await updateLivePlayerStats({
                matchId,
                playerId,
                stats: updateableStats,
              })
            } catch (error) {
              console.error('Error saving player time:', error)
            }
          }
        }

        // Limpiar pending updates después de guardar
        setPendingUpdates(new Set())
      }
    }, 60000) // Save every 60 seconds instead of 30

    return () => clearInterval(saveInterval)
  }, [isRunning, stats, matchId, pendingUpdates])

  return {
    stats,
    matchScore,
    isRunning,
    setIsRunning,
    updatePlayerStats,
    togglePlayer,
    updateScore,
    endMatch,
    updateTimePlayed,
    pendingUpdates,
  }
}
