import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TeamPlayersSection from '@/components/members/TeamPlayersSection'

// Mock de las acciones
vi.mock('@/lib/actions/auth.action', () => ({
  userAuth: vi.fn(),
}))

vi.mock('@/lib/actions/player.action', () => ({
  getPlayersByOrganizationAction: vi.fn(),
}))

vi.mock('@/lib/actions/organization.action', () => ({
  getOrganizationByUserId: vi.fn(),
}))

// Mock de Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

// Mock de Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

describe('TeamPlayersSection', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'user' as const,
    avatar: null,
    organizationId: undefined,
  }

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Team',
    description: 'Test team description',
    avatar: '',
  }

  const mockPlayers = [
    {
      id: 'player-1',
      name: 'John',
      lastName: 'Doe',
      age: 25,
      avatar: '/avatar1.jpg',
      userId: 'user-1',
      organizationId: 'org-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      jerseyNumber: 10,
      position: 'Forward',
      totalGoals: 15,
      totalAssists: 8,
      totalPassesCompleted: 100,
    },
    {
      id: 'player-2',
      name: 'Jane',
      lastName: 'Smith',
      age: 23,
      avatar: null,
      userId: 'user-2',
      organizationId: 'org-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      jerseyNumber: 7,
      position: 'Midfielder',
      totalGoals: 5,
      totalAssists: 12,
      totalPassesCompleted: 80,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows login message when user is not authenticated', async () => {
    const { userAuth } = await import('@/lib/actions/auth.action')
    vi.mocked(userAuth).mockResolvedValue(null)

    render(await TeamPlayersSection())
    expect(screen.getByText('Please log in.')).toBeInTheDocument()
  })

  it('shows join team message when user is not registered to any team', async () => {
    const { userAuth } = await import('@/lib/actions/auth.action')
    const { getOrganizationByUserId } = await import(
      '@/lib/actions/organization.action'
    )

    vi.mocked(userAuth).mockResolvedValue(mockUser)
    vi.mocked(getOrganizationByUserId).mockResolvedValue({
      data: null,
      error: null,
    })

    render(await TeamPlayersSection())

    expect(screen.getByText('Not registered to any team')).toBeInTheDocument()
    expect(
      screen.getByText('You need to join a team to see your teammates.')
    ).toBeInTheDocument()
    expect(screen.getByText('Join a team')).toBeInTheDocument()
  })

  it('shows no players message when team has no players', async () => {
    const { userAuth } = await import('@/lib/actions/auth.action')
    const { getOrganizationByUserId } = await import(
      '@/lib/actions/organization.action'
    )
    const { getPlayersByOrganizationAction } = await import(
      '@/lib/actions/player.action'
    )

    vi.mocked(userAuth).mockResolvedValue(mockUser)
    vi.mocked(getOrganizationByUserId).mockResolvedValue({
      data: mockOrganization,
      error: null,
    })
    vi.mocked(getPlayersByOrganizationAction).mockResolvedValue({
      data: [],
      error: null,
    })

    render(await TeamPlayersSection())

    expect(screen.getByText('No players in Test Team')).toBeInTheDocument()
    expect(
      screen.getByText('There are no players registered in your team yet.')
    ).toBeInTheDocument()
  })

  it('renders team players when user has a team with players', async () => {
    const { userAuth } = await import('@/lib/actions/auth.action')
    const { getOrganizationByUserId } = await import(
      '@/lib/actions/organization.action'
    )
    const { getPlayersByOrganizationAction } = await import(
      '@/lib/actions/player.action'
    )

    vi.mocked(userAuth).mockResolvedValue(mockUser)
    vi.mocked(getOrganizationByUserId).mockResolvedValue({
      data: mockOrganization,
      error: null,
    })
    vi.mocked(getPlayersByOrganizationAction).mockResolvedValue({
      data: mockPlayers,
      error: null,
    })

    render(await TeamPlayersSection())

    expect(screen.getByText('Test Team')).toBeInTheDocument()
    expect(screen.getByText('Your team players')).toBeInTheDocument()
    expect(screen.getByText('2 players')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('#10')).toBeInTheDocument()
    expect(screen.getByText('#7')).toBeInTheDocument()
  })

  it('displays player stats correctly', async () => {
    const { userAuth } = await import('@/lib/actions/auth.action')
    const { getOrganizationByUserId } = await import(
      '@/lib/actions/organization.action'
    )
    const { getPlayersByOrganizationAction } = await import(
      '@/lib/actions/player.action'
    )

    vi.mocked(userAuth).mockResolvedValue(mockUser)
    vi.mocked(getOrganizationByUserId).mockResolvedValue({
      data: mockOrganization,
      error: null,
    })
    vi.mocked(getPlayersByOrganizationAction).mockResolvedValue({
      data: mockPlayers,
      error: null,
    })

    render(await TeamPlayersSection())

    expect(screen.getByText('15')).toBeInTheDocument() // Goals
    expect(screen.getByText('8')).toBeInTheDocument() // Assists
    expect(screen.getByText('5')).toBeInTheDocument() // Goals for second player
    expect(screen.getByText('12')).toBeInTheDocument() // Assists for second player
  })

  it('handles players without jersey numbers', async () => {
    const playersWithoutJersey = [
      {
        ...mockPlayers[0],
        jerseyNumber: null,
      },
    ]

    const { userAuth } = await import('@/lib/actions/auth.action')
    const { getOrganizationByUserId } = await import(
      '@/lib/actions/organization.action'
    )
    const { getPlayersByOrganizationAction } = await import(
      '@/lib/actions/player.action'
    )

    vi.mocked(userAuth).mockResolvedValue(mockUser)
    vi.mocked(getOrganizationByUserId).mockResolvedValue({
      data: mockOrganization,
      error: null,
    })
    vi.mocked(getPlayersByOrganizationAction).mockResolvedValue({
      data: playersWithoutJersey,
      error: null,
    })

    render(await TeamPlayersSection())

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    // No debería mostrar el badge de jersey number
    expect(screen.queryByText('#null')).not.toBeInTheDocument()
  })
})
