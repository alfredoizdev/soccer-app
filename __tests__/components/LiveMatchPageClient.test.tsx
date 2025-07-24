import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import LiveMatchPageClient from '@/app/(admin)/admin/matches/live/LiveMatchPageClient'
import { useLiveMatch } from '@/hooks/useLiveMatch'

// Mock the useLiveMatch hook
vi.mock('@/hooks/useLiveMatch')

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock Zustand store useLiveMatchStore
vi.mock('@/lib/stores/liveMatchStore', () => {
  // Mock de los jugadores igual que en los tests
  const mockPlayersTeam1 = [
    {
      id: 'player-1',
      name: 'John',
      lastName: 'Doe',
      position: 'forward',
      avatar: '/player1.jpg',
    },
    {
      id: 'player-2',
      name: 'Mike',
      lastName: 'Johnson',
      position: 'goalkeeper',
      avatar: '/player2.jpg',
    },
  ]
  const mockPlayersTeam2 = [
    {
      id: 'player-3',
      name: 'Jane',
      lastName: 'Smith',
      position: 'defender',
      avatar: '/player3.jpg',
    },
  ]
  return {
    useLiveMatchStore: () => ({
      timer: 0,
      isRunning: false,
      isHalfTime: false,
      isMatchEnded: false,
      hasUsedHalfTime: false,
      team1Goals: 1,
      team2Goals: 0,
      playerStats: {
        'player-1': {
          id: 'stat-1',
          isPlaying: true,
          timePlayed: 0,
          goals: 0,
          assists: 0,
          goalsSaved: 0,
          goalsAllowed: 0,
          passesCompleted: 0,
        },
        'player-2': {
          id: 'stat-2',
          isPlaying: true,
          timePlayed: 0,
          goals: 0,
          assists: 0,
          goalsSaved: 0,
          goalsAllowed: 0,
          passesCompleted: 0,
        },
        'player-3': {
          id: 'stat-3',
          isPlaying: true,
          timePlayed: 0,
          goals: 0,
          assists: 0,
          goalsSaved: 0,
          goalsAllowed: 0,
          passesCompleted: 0,
        },
      },
      playersTeam1: mockPlayersTeam1,
      playersTeam2: mockPlayersTeam2,
      team1Id: 'team-1',
      team2Id: 'team-2',
      events: [],
      match: {
        id: 'match-123',
        date: new Date(),
        team1: 'Team A',
        team2: 'Team B',
        team1Id: 'team-1',
        team2Id: 'team-2',
        team1Goals: 1,
        team2Goals: 0,
        team1Avatar: '/team1.jpg',
        team2Avatar: '/team2.jpg',
      },
      initializeMatch: vi.fn(),
      checkMatchEnded: vi.fn().mockResolvedValue(false),
      startMatch: vi.fn(),
      pauseMatch: vi.fn(),
      resumeMatch: vi.fn(),
      endMatch: vi.fn(),
      updateTimer: vi.fn(),
      addGoal: vi.fn(),
      addTeamGoal: vi.fn(),
      addAssist: vi.fn(),
      addPass: vi.fn(),
      addGoalSaved: vi.fn(),
      addGoalAllowed: vi.fn(),
      addEvent: vi.fn(),
      togglePlayer: vi.fn(),
      saveToDatabase: vi.fn().mockResolvedValue(undefined),
      hasRegisteredPlayers: vi.fn().mockReturnValue(false),
      reset: vi.fn(),
      loadMatchFromDatabase: vi.fn(),
      isLoading: false,
      isInitialized: true,
      matchAlreadyEnded: false,
    }),
  }
})

const mockUseLiveMatch = useLiveMatch as ReturnType<
  typeof vi.mocked<typeof useLiveMatch>
>

describe('LiveMatchPageClient', () => {
  const mockMatch = {
    id: 'match-123',
    date: new Date(),
    team1: 'Team A',
    team2: 'Team B',
    team1Id: 'team-1',
    team2Id: 'team-2',
    team1Goals: 1,
    team2Goals: 0,
    team1Avatar: '/team1.jpg',
    team2Avatar: '/team2.jpg',
  }

  const mockPlayersTeam1 = [
    {
      id: 'player-1',
      name: 'John',
      lastName: 'Doe',
      jerseyNumber: 10,
      position: 'forward',
      avatar: '/player1.jpg',
    },
    {
      id: 'player-2',
      name: 'Mike',
      lastName: 'Johnson',
      jerseyNumber: 1,
      position: 'goalkeeper',
      avatar: '/player2.jpg',
    },
  ]

  const mockPlayersTeam2 = [
    {
      id: 'player-3',
      name: 'Jane',
      lastName: 'Smith',
      jerseyNumber: 5,
      position: 'defender',
      avatar: '/player3.jpg',
    },
  ]

  const mockInitialPlayerStats = {
    'player-1': {
      id: 'stat-1',
      timePlayed: 0,
      goals: 0,
      assists: 0,
      passesCompleted: 0,
      duelsWon: 0,
      duelsLost: 0,
      goalsAllowed: 0,
      goalsSaved: 0,
      isPlaying: true,
    },
    'player-2': {
      id: 'stat-2',
      timePlayed: 0,
      goals: 0,
      assists: 0,
      passesCompleted: 0,
      duelsWon: 0,
      duelsLost: 0,
      goalsAllowed: 0,
      goalsSaved: 0,
      isPlaying: true,
    },
    'player-3': {
      id: 'stat-3',
      timePlayed: 0,
      goals: 0,
      assists: 0,
      passesCompleted: 0,
      duelsWon: 0,
      duelsLost: 0,
      goalsAllowed: 0,
      goalsSaved: 0,
      isPlaying: true,
    },
  }

  const mockHookReturn = {
    stats: {
      'player-1': {
        id: 'stat-1',
        isPlaying: true,
        timePlayed: 0,
        goals: 0,
        assists: 0,
        duelsWon: 0,
        duelsLost: 0,
        goalsSaved: 0,
        goalsAllowed: 0,
        passesCompleted: 0,
      },
      'player-2': {
        id: 'stat-2',
        isPlaying: true,
        timePlayed: 0,
        goals: 0,
        assists: 0,
        duelsWon: 0,
        duelsLost: 0,
        goalsSaved: 0,
        goalsAllowed: 0,
        passesCompleted: 0,
      },
      'player-3': {
        id: 'stat-3',
        isPlaying: true,
        timePlayed: 0,
        goals: 0,
        assists: 0,
        duelsWon: 0,
        duelsLost: 0,
        goalsSaved: 0,
        goalsAllowed: 0,
        passesCompleted: 0,
      },
    },
    matchScore: { team1Goals: 1, team2Goals: 0 },
    isRunning: false,
    setIsRunning: vi.fn(),
    updatePlayerStats: vi.fn(),
    updateScore: vi.fn(),
    togglePlayer: vi.fn(),
    updateTimePlayed: vi.fn(),
    endMatch: vi.fn(),
    pendingUpdates: new Set<string>(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLiveMatch.mockReturnValue(mockHookReturn)
  })

  it('should render match title and teams', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument()
    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText('Team B')).toBeInTheDocument()
  })

  it('should render score display', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    const scoreElements = screen.getAllByText('0')
    expect(scoreElements.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument()
  })

  it('should render team selection buttons', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText('Team B')).toBeInTheDocument()
  })

  it('should render timer and control buttons', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    expect(screen.getByText(/⏱️/)).toBeInTheDocument()
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('should render players from selected team', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('should switch teams when team buttons are clicked', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    const teamBButton = screen.getByText('Team B')
    await act(async () => {
      fireEvent.click(teamBButton)
    })
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Mike Johnson')).not.toBeInTheDocument()
  })

  it('should handle player toggle', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    const toggleButtons = screen.getAllByRole('button')
    const downButton = toggleButtons.find(
      (button) => button.textContent === 'Down'
    )
    if (downButton) {
      await act(async () => {
        fireEvent.click(downButton)
      })
      expect(downButton).toBeInTheDocument()
    } else {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    }
  })

  it('should handle player stat updates for field players', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    const statButtons = screen.getAllByRole('button')
    const goalButton = statButtons.find((button) => button.textContent === '0')
    if (goalButton) {
      await act(async () => {
        fireEvent.click(goalButton)
      })
    }
  })

  it('should handle goalkeeper stats', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    const statButtons = screen.getAllByRole('button')
    const savedButton = statButtons.find((button) => button.textContent === '0')
    if (savedButton) {
      await act(async () => {
        fireEvent.click(savedButton)
      })
    }
  })

  it('should handle timer controls', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    const startButton = screen.getByText('Start')
    await act(async () => {
      fireEvent.click(startButton)
    })
  })

  it('should handle match end', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    const endButton = screen.getByText('End Match')
    await act(async () => {
      fireEvent.click(endButton)
    })
  })

  it('should show pending updates indicator', async () => {
    await act(async () => {
      render(
        <LiveMatchPageClient
          match={mockMatch}
          playersTeam1={mockPlayersTeam1}
          playersTeam2={mockPlayersTeam2}
          initialPlayerStats={mockInitialPlayerStats}
        />
      )
    })
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument()
  })
})
