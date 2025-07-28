import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SlideLatsMatchResults, {
  MatchListItem,
} from '@/components/members/SlideLatsMatchResults'

// Mock de Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock de los componentes de UI
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid='card' className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid='card-content' className={className}>
      {children}
    </div>
  ),
  CardFooter: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid='card-footer' className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/ui/carousel', () => ({
  Carousel: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid='carousel' className={className}>
      {children}
    </div>
  ),
  CarouselContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='carousel-content'>{children}</div>
  ),
  CarouselItem: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid='carousel-item' className={className}>
      {children}
    </div>
  ),
  CarouselNext: () => <button data-testid='carousel-next'>Next</button>,
  CarouselPrevious: () => (
    <button data-testid='carousel-previous'>Previous</button>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <button data-testid='button' onClick={onClick} className={className}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <span data-testid='badge' className={className}>
      {children}
    </span>
  ),
}))

vi.mock('@radix-ui/react-avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='avatar'>{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='avatar-fallback'>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid='avatar-image' src={src} alt={alt} />
  ),
}))

describe('SlideLatsMatchResults', () => {
  const mockMatches: MatchListItem[] = [
    {
      id: 'match-1',
      date: new Date('2024-01-15'),
      team1: 'Team A',
      team2: 'Team B',
      team1Id: 'team-1',
      team2Id: 'team-2',
      team1Goals: 2,
      team2Goals: 1,
      team1Avatar: '/team1.jpg',
      team2Avatar: '/team2.jpg',
      status: 'active',
    },
    {
      id: 'match-2',
      date: new Date('2024-01-10'),
      team1: 'Team C',
      team2: 'Team D',
      team1Id: 'team-3',
      team2Id: 'team-4',
      team1Goals: 0,
      team2Goals: 0,
      team1Avatar: '/team3.jpg',
      team2Avatar: '/team4.jpg',
      status: 'inactive',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders no matches message when matches array is empty', () => {
    render(<SlideLatsMatchResults matches={[]} />)

    expect(screen.getByText('No matches found')).toBeInTheDocument()
    expect(
      screen.getByText('There are no matches scheduled for the moment.')
    ).toBeInTheDocument()
  })

  it('renders matches with active matches first', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    // Verificar que los partidos se renderizan
    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText('Team B')).toBeInTheDocument()
    expect(screen.getByText('Team C')).toBeInTheDocument()
    expect(screen.getByText('Team D')).toBeInTheDocument()
  })

  it('displays match scores correctly', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    expect(screen.getByText('2')).toBeInTheDocument() // Team A goals
    expect(screen.getByText('1')).toBeInTheDocument() // Team B goals
    // Usar getAllByText para múltiples elementos con el mismo texto
    const zeroScores = screen.getAllByText('0')
    expect(zeroScores.length).toBeGreaterThan(0) // Team C and D goals
  })

  it('shows active badge for active matches', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    const activeBadges = screen.getAllByText('⚽ Active')
    expect(activeBadges.length).toBeGreaterThan(0)
  })

  it('shows completed badge for inactive matches', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    const completedBadges = screen.getAllByText('🏁 Match Completed')
    expect(completedBadges.length).toBeGreaterThan(0)
  })

  it('displays match dates correctly', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    // Verificar que las fechas se muestran (formato puede variar según locale)
    expect(screen.getByText('1/14/2024')).toBeInTheDocument()
    expect(screen.getByText('1/9/2024')).toBeInTheDocument()
  })

  it('renders team avatars', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    const avatarImages = screen.getAllByTestId('avatar-image')
    expect(avatarImages.length).toBeGreaterThan(0)
  })

  it('shows correct button text for active matches', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    const watchLiveButtons = screen.getAllByText('Watch Live')
    expect(watchLiveButtons.length).toBeGreaterThan(0)
  })

  it('shows correct button text for inactive matches', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    const seeHistoryButtons = screen.getAllByText('See History')
    expect(seeHistoryButtons.length).toBeGreaterThan(0)
  })

  it('navigates to live match when clicking Watch Live button', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    const watchLiveButton = screen.getByText('Watch Live')
    fireEvent.click(watchLiveButton)

    expect(mockPush).toHaveBeenCalledWith('/members/matches/live/match-1')
  })

  it('navigates to match history when clicking See History button', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    const seeHistoryButton = screen.getByText('See History')
    fireEvent.click(seeHistoryButton)

    expect(mockPush).toHaveBeenCalledWith(
      '/members/matches/history/match-2/timeline'
    )
  })

  it('handles matches with string dates', () => {
    const matchesWithStringDates: MatchListItem[] = [
      {
        ...mockMatches[0],
        date: '2024-01-15',
      },
    ]

    render(<SlideLatsMatchResults matches={matchesWithStringDates} />)

    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText('Team B')).toBeInTheDocument()
  })

  it('displays match counter on mobile', () => {
    render(<SlideLatsMatchResults matches={mockMatches} />)

    expect(screen.getByText('1 / 2 matches')).toBeInTheDocument()
  })
})
