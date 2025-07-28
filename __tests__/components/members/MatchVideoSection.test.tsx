import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MatchVideoSection from '@/components/members/MatchVideoSection'

// Mock de lucide-react
vi.mock('lucide-react', () => ({
  Video: ({ className }: { className?: string }) => (
    <div data-testid='video-icon' className={className} />
  ),
  Play: ({ className }: { className?: string }) => (
    <div data-testid='play-icon' className={className} />
  ),
}))

describe('MatchVideoSection', () => {
  const defaultProps = {
    matchId: 'match-123',
    team1Name: 'Team A',
    team2Name: 'Team B',
  }

  it('renders match video section with correct title', () => {
    render(<MatchVideoSection {...defaultProps} />)

    expect(screen.getByText('Match Highlights')).toBeInTheDocument()
    expect(screen.getByTestId('video-icon')).toBeInTheDocument()
  })

  it('displays team names in the description', () => {
    render(<MatchVideoSection {...defaultProps} />)

    expect(
      screen.getByText('Team A vs Team B - Match Highlights')
    ).toBeInTheDocument()
  })

  it('renders video element', () => {
    render(<MatchVideoSection {...defaultProps} />)

    const video = screen.getByTestId('video-element')
    expect(video).toBeInTheDocument()
  })

  it('shows thumbnail overlay when video is not playing', () => {
    render(<MatchVideoSection {...defaultProps} />)

    expect(screen.getByTestId('play-icon')).toBeInTheDocument()
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument()
    expect(screen.getByText('Click to play highlights')).toBeInTheDocument()
  })

  it('renders with different team names', () => {
    const props = {
      matchId: 'match-456',
      team1Name: 'Real Madrid',
      team2Name: 'Barcelona',
    }

    render(<MatchVideoSection {...props} />)

    expect(
      screen.getByText('Real Madrid vs Barcelona - Match Highlights')
    ).toBeInTheDocument()
    expect(screen.getByText('Real Madrid vs Barcelona')).toBeInTheDocument()
  })
})
