import { NextResponse } from 'next/server'

// Helper function to get random number between min and max
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper function to get random player from team
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRandomPlayer(players: any[], teamId: string) {
  const teamPlayers = players.filter((p) => p.organizationId === teamId)
  return teamPlayers[Math.floor(Math.random() * teamPlayers.length)]
}

export async function POST() {
  try {
    console.log('🚀 Starting random automatic match test...')

    // 1. Get existing matches first
    console.log('📝 Looking for existing matches...')
    const { getAllMatchesWithTeams } = await import(
      '@/lib/actions/matches.action'
    )
    const existingMatches = await getAllMatchesWithTeams()

    if (existingMatches.length === 0) {
      return NextResponse.json(
        {
          error:
            'You must create a match first to run this test. Go to /admin/matches/new to create a match.',
        },
        { status: 400 }
      )
    }

    // Check if there are any active matches (without final scores)
    const activeMatches = existingMatches.filter(
      (match) => match.team1Goals === 0 && match.team2Goals === 0
    )

    if (activeMatches.length === 0) {
      return NextResponse.json(
        {
          error:
            'You must create an active match (without final scores) to run this test. Go to /admin/matches/new to create a match.',
        },
        { status: 400 }
      )
    }

    // Use the first available active match
    const selectedMatch = activeMatches[0]
    console.log(`✅ Using existing match: ${selectedMatch.id}`)

    // Get players for this match
    const { getPlayersAction } = await import('@/lib/actions/player.action')
    const playersRes = await getPlayersAction()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let players: any[] = []
    if (playersRes.data) {
      players = playersRes.data.filter(
        (player) =>
          player.organizationId === selectedMatch.team1Id ||
          player.organizationId === selectedMatch.team2Id
      )
    }

    const match = {
      id: selectedMatch.id,
      team1Id: selectedMatch.team1Id,
      team2Id: selectedMatch.team2Id,
    }

    console.log(`👥 Players found: ${players.length}`)

    // 3. Initialize live data
    console.log('🎯 Initializing live data...')
    const { initializeLiveMatchData } = await import(
      '@/lib/actions/matches.action'
    )
    await initializeLiveMatchData(match.id)

    // 4. Generate random events
    console.log('🎲 Generating random events...')

    const events: Array<{
      minute: number
      type:
        | 'goal'
        | 'assist'
        | 'pass'
        | 'goal_saved'
        | 'goal_allowed'
        | 'half_time'
        | 'resume'
      player?: {
        id: string
        name: string
        lastName: string
        organizationId: string | null
      }
      team: string
      teamId: string
    }> = []

    // Generate random events for first half (1-5 minutes)
    for (let i = 0; i < getRandomInt(5, 8); i++) {
      const minute = getRandomInt(1, 5)
      const team = Math.random() > 0.5 ? 'team1' : 'team2'
      const teamId = team === 'team1' ? match.team1Id : match.team2Id
      const player = getRandomPlayer(players, teamId)

      if (player) {
        const random = Math.random()
        let eventType:
          | 'goal'
          | 'assist'
          | 'pass'
          | 'goal_saved'
          | 'goal_allowed'

        if (random > 0.7) {
          eventType = 'goal'
        } else if (random > 0.5) {
          eventType = 'pass'
        } else if (random > 0.3) {
          eventType = 'assist'
        } else if (random > 0.15) {
          eventType = 'goal_saved'
        } else {
          eventType = 'goal_allowed'
        }

        events.push({ minute, type: eventType, player, team, teamId })
      }
    }

    // Add half time at 5 minutes
    events.push({ minute: 5, type: 'half_time', team: 'both', teamId: '' })

    // Add resume at 6 minutes
    events.push({ minute: 6, type: 'resume', team: 'both', teamId: '' })

    // Generate random events for second half (6-10 minutes)
    for (let i = 0; i < getRandomInt(4, 7); i++) {
      const minute = getRandomInt(6, 10)
      const team = Math.random() > 0.5 ? 'team1' : 'team2'
      const teamId = team === 'team1' ? match.team1Id : match.team2Id
      const player = getRandomPlayer(players, teamId)

      if (player) {
        const random = Math.random()
        let eventType:
          | 'goal'
          | 'assist'
          | 'pass'
          | 'goal_saved'
          | 'goal_allowed'

        if (random > 0.7) {
          eventType = 'goal'
        } else if (random > 0.5) {
          eventType = 'pass'
        } else if (random > 0.3) {
          eventType = 'assist'
        } else if (random > 0.15) {
          eventType = 'goal_saved'
        } else {
          eventType = 'goal_allowed'
        }

        events.push({ minute, type: eventType, player, team, teamId })
      }
    }

    // Sort events by minute
    events.sort((a, b) => a.minute - b.minute)

    console.log(`📊 Generated ${events.length} random events`)

    // 5. Execute events
    console.log('🎯 Executing events...')

    let team1Goals = 0
    let team2Goals = 0
    const playerStats: Record<
      string,
      {
        goals: number
        assists: number
        passes: number
        timePlayed: number
        goalsSaved: number
        goalsAllowed: number
      }
    > = {}

    // Initialize player stats
    players.forEach((player) => {
      playerStats[player.id] = {
        goals: 0,
        assists: 0,
        passes: 0,
        timePlayed: 0,
        goalsSaved: 0,
        goalsAllowed: 0,
      }
    })

    for (const event of events) {
      const { updateLivePlayerStats, createMatchEvent } = await import(
        '@/lib/actions/matches.action'
      )

      if (event.type === 'half_time') {
        console.log(`⏸️ Min ${event.minute} - Half Time`)
        // Create half time event for test simulation
        await createMatchEvent({
          matchId: match.id,
          eventType: 'substitution',
          minute: event.minute,
          teamId: match.team1Id, // Use team1Id as default
          description: 'Half Time - Match Paused',
          playerId: undefined, // No player for half time events
        })
      } else if (event.type === 'resume') {
        console.log(`▶️ Min ${event.minute} - Resume Match`)
        // Create resume event for test simulation
        await createMatchEvent({
          matchId: match.id,
          eventType: 'substitution',
          minute: event.minute,
          teamId: match.team1Id, // Use team1Id as default
          description: 'Match Resumed',
          playerId: undefined, // No player for resume events
        })
      } else if (event.player) {
        // Update player time played
        const timePlayed = event.minute * 60 // Convert to seconds
        playerStats[event.player.id].timePlayed = Math.max(
          playerStats[event.player.id].timePlayed,
          timePlayed
        )

        if (event.type === 'goal') {
          console.log(
            `🥅 Min ${event.minute} - ${event.player.name} ${event.player.lastName} scored`
          )
          playerStats[event.player.id].goals++
          if (event.team === 'team1') team1Goals++
          else team2Goals++

          await updateLivePlayerStats({
            matchId: match.id,
            playerId: event.player.id,
            stats: {
              goals: playerStats[event.player.id].goals,
              timePlayed: playerStats[event.player.id].timePlayed,
            },
          })

          await createMatchEvent({
            matchId: match.id,
            playerId: event.player.id,
            eventType: 'goal',
            minute: event.minute,
            teamId: event.teamId,
            description: `${event.player.name} ${event.player.lastName} scored a goal`,
          })
        } else if (event.type === 'assist') {
          console.log(
            `🎯 Min ${event.minute} - ${event.player.name} ${event.player.lastName} assist`
          )
          playerStats[event.player.id].assists++

          await updateLivePlayerStats({
            matchId: match.id,
            playerId: event.player.id,
            stats: {
              assists: playerStats[event.player.id].assists,
              timePlayed: playerStats[event.player.id].timePlayed,
            },
          })

          await createMatchEvent({
            matchId: match.id,
            playerId: event.player.id,
            eventType: 'assist',
            minute: event.minute,
            teamId: event.teamId,
            description: `${event.player.name} ${event.player.lastName} provided an assist`,
          })
        } else if (event.type === 'pass') {
          console.log(
            `⚽ Min ${event.minute} - ${event.player.name} ${event.player.lastName} pass`
          )
          playerStats[event.player.id].passes++

          await updateLivePlayerStats({
            matchId: match.id,
            playerId: event.player.id,
            stats: {
              passesCompleted: playerStats[event.player.id].passes,
              timePlayed: playerStats[event.player.id].timePlayed,
            },
          })

          await createMatchEvent({
            matchId: match.id,
            playerId: event.player.id,
            eventType: 'pass',
            minute: event.minute,
            teamId: event.teamId,
            description: `${event.player.name} ${event.player.lastName} completed a pass`,
          })
        } else if (event.type === 'goal_saved') {
          console.log(
            `🥅 Min ${event.minute} - ${event.player.name} ${event.player.lastName} saved a goal`
          )

          await updateLivePlayerStats({
            matchId: match.id,
            playerId: event.player.id,
            stats: {
              goalsSaved: (playerStats[event.player.id].goalsSaved || 0) + 1,
              timePlayed: playerStats[event.player.id].timePlayed,
            },
          })

          await createMatchEvent({
            matchId: match.id,
            playerId: event.player.id,
            eventType: 'goal_saved',
            minute: event.minute,
            teamId: event.teamId,
            description: `${event.player.name} ${event.player.lastName} saved a goal`,
          })
        } else if (event.type === 'goal_allowed') {
          console.log(
            `🥅 Min ${event.minute} - ${event.player.name} ${event.player.lastName} allowed a goal`
          )

          await updateLivePlayerStats({
            matchId: match.id,
            playerId: event.player.id,
            stats: {
              goalsAllowed:
                (playerStats[event.player.id].goalsAllowed || 0) + 1,
              timePlayed: playerStats[event.player.id].timePlayed,
            },
          })

          await createMatchEvent({
            matchId: match.id,
            playerId: event.player.id,
            eventType: 'goal_allowed',
            minute: event.minute,
            teamId: event.teamId,
            description: `${event.player.name} ${event.player.lastName} allowed a goal`,
          })
        }
      }
    }

    // 6. Update final score
    console.log(`📊 Final Score: ${team1Goals}-${team2Goals}`)
    const { updateLiveMatchScore } = await import(
      '@/lib/actions/matches.action'
    )
    await updateLiveMatchScore({
      matchId: match.id,
      team1Goals,
      team2Goals,
    })

    // 7. End match
    console.log('🏁 Ending match...')
    const { endLiveMatch } = await import('@/lib/actions/matches.action')
    await endLiveMatch(match.id)

    console.log('✅ Random test completed successfully')

    return NextResponse.json({
      success: true,
      matchId: match.id,
      playersCount: players.length,
      eventsCount: events.length,
      finalScore: `${team1Goals}-${team2Goals}`,
      message: 'Random automatic test completed',
    })
  } catch (error) {
    console.error('❌ Error in random automatic test:', error)
    return NextResponse.json(
      { error: `Error executing random automatic test: ${error}` },
      { status: 500 }
    )
  }
}
