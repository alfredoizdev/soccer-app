import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  updateLivePlayerStats,
  updateLiveMatchScore,
  endLiveMatch,
  debugLiveMatchData,
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

  // Update player stat with debouncing
  const updatePlayerStat = useCallback(
    (playerId: string, statType: keyof PlayerStat, value: number) => {
      setStats((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [statType]: value,
        },
      }))

      setPendingUpdates((prev) => new Set(prev).add(playerId))

      // Send only the fields that can be updated
      const currentPlayerStats = stats[playerId]
      const updatedStats = {
        isPlaying: currentPlayerStats.isPlaying,
        timePlayed: currentPlayerStats.timePlayed,
        goals: currentPlayerStats.goals,
        assists: currentPlayerStats.assists,
        passesCompleted: currentPlayerStats.passesCompleted,
        goalsAllowed: currentPlayerStats.goalsAllowed,
        goalsSaved: currentPlayerStats.goalsSaved,
        [statType]: value,
      }

      debouncedUpdate(playerId, updatedStats)
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

  // Save time played periodically
  useEffect(() => {
    if (!isRunning) return

    const saveInterval = setInterval(async () => {
      for (const playerId in stats) {
        const playerStat = stats[playerId]
        if (playerStat.isPlaying) {
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

      // Debug: Verificar el estado de los datos cada 30 segundos
      try {
        await debugLiveMatchData(matchId)
      } catch (error) {
        console.error('Error in debug function:', error)
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(saveInterval)
  }, [isRunning, stats, matchId])

  // Update time played for playing players
  const updateTimePlayed = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev }
      for (const id in updated) {
        if (updated[id].isPlaying) {
          updated[id].timePlayed += 1
        }
      }
      return updated
    })
  }, [])

  return {
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
  }
}
