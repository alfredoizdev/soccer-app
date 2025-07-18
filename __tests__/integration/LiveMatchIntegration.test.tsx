import { render, screen, fireEvent } from '@testing-library/react'
import LiveMatchPageClient from '@/app/(admin)/admin/matches/live/LiveMatchPageClient'
import { useLiveMatch } from '@/hooks/useLiveMatch'

// Mock the useLiveMatch hook
jest.mock('@/hooks/useLiveMatch')

const mockUseLiveMatch = useLiveMatch as jest.MockedFunction<
  typeof useLiveMatch
>

describe('Live Match Integration Test', () => {
  const mockMatch = {
    id: 'match-123',
    date: new Date(),
    team1: 'Barcelona',
    team2: 'Real Madrid',
    team1Id: 'team-1',
    team2Id: 'team-2',
    team1Goals: 0,
    team2Goals: 0,
    team1Avatar: '/barcelona.jpg',
    team2Avatar: '/madrid.jpg',
  }

  const mockPlayersTeam1 = [
    {
      id: 'player-1',
      name: 'Lionel',
      lastName: 'Messi',
      jerseyNumber: 10,
      position: 'forward',
      avatar: '/messi.jpg',
    },
    {
      id: 'player-2',
      name: 'Marc-André',
      lastName: 'ter Stegen',
      jerseyNumber: 1,
      position: 'goalkeeper',
      avatar: '/terstegen.jpg',
    },
  ]

  const mockPlayersTeam2 = [
    {
      id: 'player-3',
      name: 'Karim',
      lastName: 'Benzema',
      jerseyNumber: 9,
      position: 'forward',
      avatar: '/benzema.jpg',
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

  it('should simulate a complete live match session', async () => {
    // Mock hook with real functionality simulation
    const mockSetIsRunning = jest.fn()
    const mockUpdatePlayerStat = jest.fn()
    const mockUpdateScore = jest.fn()
    const mockTogglePlayer = jest.fn()
    const mockEndMatch = jest.fn()

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
      matchScore: { team1Goals: 0, team2Goals: 0 },
      isRunning: false,
      setIsRunning: mockSetIsRunning,
      updatePlayerStat: mockUpdatePlayerStat,
      updateScore: mockUpdateScore,
      togglePlayer: mockTogglePlayer,
      updateTimePlayed: jest.fn(),
      endMatch: mockEndMatch,
      pendingUpdates: new Set<string>(),
    }

    mockUseLiveMatch.mockReturnValue(mockHookReturn)

    render(
      <LiveMatchPageClient
        match={mockMatch}
        playersTeam1={mockPlayersTeam1}
        playersTeam2={mockPlayersTeam2}
        initialPlayerStats={mockInitialPlayerStats}
      />
    )

    // 1. Verificar que se renderiza correctamente
    expect(
      screen.getByText('Match: Barcelona vs Real Madrid')
    ).toBeInTheDocument()
    expect(screen.getByText('Lionel Messi')).toBeInTheDocument()
    expect(screen.getByText('Marc-André ter Stegen')).toBeInTheDocument()

    // 2. Simular inicio del partido
    const startButton = screen.getByText('Start')
    fireEvent.click(startButton)
    expect(mockSetIsRunning).toHaveBeenCalledWith(true)

    // 3. Simular cambio de equipo
    const team2Button = screen.getByRole('button', { name: /Real Madrid/i })
    fireEvent.click(team2Button)
    expect(screen.getByText('Karim Benzema')).toBeInTheDocument()

    // 4. Simular gol de Messi
    const team1Button = screen.getByText('Barcelona')
    fireEvent.click(team1Button) // Volver a equipo 1

    const goalsButton = screen.getAllByText('0')[0] // Botón de goles de Messi
    fireEvent.click(goalsButton)

    expect(mockUpdatePlayerStat).toHaveBeenCalledWith('player-1', 'goals', 1)
    expect(mockUpdateScore).toHaveBeenCalledWith('team1', 1)

    // 5. Simular asistencia
    const assistsButton = screen.getAllByText('0')[1] // Botón de asistencias
    fireEvent.click(assistsButton)
    expect(mockUpdatePlayerStat).toHaveBeenCalledWith('player-1', 'assists', 1)

    // 6. Simular toggle de jugador
    const toggleButton = screen.getByText('Down') // Messi está jugando
    fireEvent.click(toggleButton)
    expect(mockTogglePlayer).toHaveBeenCalledWith('player-1')

    // 7. Simular fin del partido
    const endMatchButton = screen.getByText('End of the match')
    fireEvent.click(endMatchButton)
    expect(mockEndMatch).toHaveBeenCalled()

    // 8. Verificar que todos los controles están presentes
    expect(screen.getByText('Set 45 min')).toBeInTheDocument()
    expect(screen.getByText('Set 90 min')).toBeInTheDocument()
    expect(screen.getByText('View History')).toBeInTheDocument()
  })

  it('should handle goalkeeper stats correctly', () => {
    const mockHookReturn = {
      stats: {
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
      },
      matchScore: { team1Goals: 0, team2Goals: 0 },
      isRunning: false,
      setIsRunning: jest.fn(),
      updatePlayerStat: jest.fn(),
      updateScore: jest.fn(),
      togglePlayer: jest.fn(),
      updateTimePlayed: jest.fn(),
      endMatch: jest.fn(),
      pendingUpdates: new Set<string>(),
    }

    mockUseLiveMatch.mockReturnValue(mockHookReturn)

    render(
      <LiveMatchPageClient
        match={mockMatch}
        playersTeam1={[mockPlayersTeam1[1]]} // Solo el portero
        playersTeam2={[]}
        initialPlayerStats={{ 'player-2': mockInitialPlayerStats['player-2'] }}
      />
    )

    // Verificar que aparecen las estadísticas de portero
    expect(screen.getByText('Goals saved')).toBeInTheDocument()
    expect(screen.getByText('Goals allowed')).toBeInTheDocument()

    // Verificar que NO aparecen estadísticas de campo
    expect(screen.queryByText('Goles')).not.toBeInTheDocument()
    expect(screen.queryByText('Assists')).not.toBeInTheDocument()
  })

  it('should show empty state when no players', () => {
    const mockHookReturn = {
      stats: {},
      matchScore: { team1Goals: 0, team2Goals: 0 },
      isRunning: false,
      setIsRunning: jest.fn(),
      updatePlayerStat: jest.fn(),
      updateScore: jest.fn(),
      togglePlayer: jest.fn(),
      updateTimePlayed: jest.fn(),
      endMatch: jest.fn(),
      pendingUpdates: new Set<string>(),
    }

    mockUseLiveMatch.mockReturnValue(mockHookReturn)

    render(
      <LiveMatchPageClient
        match={mockMatch}
        playersTeam1={[]}
        playersTeam2={[]}
        initialPlayerStats={{}}
      />
    )

    expect(
      screen.getByText(/This club has no lineup available/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Please contact the administrator/)
    ).toBeInTheDocument()
  })
})
