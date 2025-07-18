import { render, screen } from '@testing-library/react'
import { notFound } from 'next/navigation'
import LiveMatchPage from '@/app/(admin)/admin/matches/live/[id]/page'
import {
  getLiveMatchData,
  initializeLiveMatchData,
} from '@/lib/actions/matches.action'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

// Mock the actions
jest.mock('@/lib/actions/matches.action')

// Mock the LiveMatchPageClient component
jest.mock('@/app/(admin)/admin/matches/live/LiveMatchPageClient', () => {
  return function MockLiveMatchPageClient(props: any) {
    return (
      <div data-testid='live-match-client'>
        <h1>Live Match Client</h1>
        <p>
          Match: {props.match?.team1} vs {props.match?.team2}
        </p>
      </div>
    )
  }
})

const mockGetLiveMatchData = getLiveMatchData as jest.MockedFunction<
  typeof getLiveMatchData
>
const mockInitializeLiveMatchData =
  initializeLiveMatchData as jest.MockedFunction<typeof initializeLiveMatchData>
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>

describe('LiveMatchPage', () => {
  const mockParams = Promise.resolve({ id: 'match-123' })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render match data when live data exists', async () => {
    const mockData = {
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
      playersTeam1: [],
      playersTeam2: [],
      liveData: {},
    }

    mockGetLiveMatchData.mockResolvedValue(mockData)

    const page = await LiveMatchPage({ params: mockParams })
    render(page)

    expect(mockGetLiveMatchData).toHaveBeenCalledWith('match-123')
    expect(screen.getByTestId('live-match-client')).toBeInTheDocument()
    expect(screen.getByText('Match: Team A vs Team B')).toBeInTheDocument()
  })

  it('should initialize live data when no data exists', async () => {
    mockGetLiveMatchData
      .mockResolvedValueOnce(null) // First call returns no data
      .mockResolvedValueOnce({
        match: {
          id: 'match-123',
          date: new Date(),
          team1: 'Team A',
          team2: 'Team B',
          team1Id: 'team-1',
          team2Id: 'team-2',
          team1Goals: 0,
          team2Goals: 0,
          team1Avatar: '/team1.jpg',
          team2Avatar: '/team2.jpg',
        },
        playersTeam1: [],
        playersTeam2: [],
        liveData: {},
      })

    mockInitializeLiveMatchData.mockResolvedValue(undefined)

    const page = await LiveMatchPage({ params: mockParams })
    render(page)

    expect(mockGetLiveMatchData).toHaveBeenCalledWith('match-123')
    expect(mockInitializeLiveMatchData).toHaveBeenCalledWith('match-123')
    expect(screen.getByTestId('live-match-client')).toBeInTheDocument()
  })

  it('should show error page when initialization fails', async () => {
    mockGetLiveMatchData.mockResolvedValue(null)
    mockInitializeLiveMatchData.mockRejectedValue(new Error('Database error'))

    const page = await LiveMatchPage({ params: mockParams })
    render(page)

    expect(screen.getByText('Match Not Found')).toBeInTheDocument()
    expect(
      screen.getByText(/The match you're looking for doesn't exist/)
    ).toBeInTheDocument()
    expect(screen.getByText('Match ID: match-123')).toBeInTheDocument()
    expect(screen.getByText('Go to Matches')).toBeInTheDocument()
    expect(screen.getByText('View History')).toBeInTheDocument()
  })

  it('should call notFound when no id is provided', async () => {
    const emptyParams = Promise.resolve({ id: '' })

    await LiveMatchPage({ params: emptyParams })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should call notFound when data loading fails after initialization', async () => {
    mockGetLiveMatchData.mockResolvedValueOnce(null).mockResolvedValueOnce(null) // Still no data after initialization

    mockInitializeLiveMatchData.mockResolvedValue(undefined)

    await LiveMatchPage({ params: mockParams })

    expect(mockNotFound).toHaveBeenCalled()
  })
})
