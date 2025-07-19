import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlayerForm from '@/components/admin/PlayerForm'

// Mock the server actions
vi.mock('@/lib/actions/player.action', () => ({
  createPlayerAction: vi.fn(),
  updatePlayerAction: vi.fn(),
}))

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock the Image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => <img src={src} alt={alt} {...props} />,
}))

// Mock the useSubmitForm hook
vi.mock('@/hooks/useSubmitForm', () => ({
  default: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => fn),
    errors: {},
    handleFormSubmit: vi.fn(),
    handleImageChange: vi.fn(),
    handleClearImage: vi.fn(),
    isSubmitting: false,
    imagePreview: null,
    actionResult: null,
    setValue: vi.fn(),
  })),
}))

// Mock the UserSearch component
vi.mock('@/components/admin/UserSearch', () => ({
  default: () => <div data-testid='user-search'>User Search Component</div>,
}))

describe('PlayerForm', () => {
  const mockProps = {
    action: 'create' as const,
    fixedOrganizationId: 'org-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Player Form', () => {
    it('should render create player form', () => {
      render(<PlayerForm {...mockProps} />)

      // Check that the form renders
      expect(screen.getByTestId('user-search')).toBeInTheDocument()
    })

    it('should render with correct props', () => {
      render(<PlayerForm {...mockProps} />)

      // Check that the form renders without crashing
      expect(screen.getByText(/parent/i)).toBeInTheDocument()
    })
  })

  describe('Update Player Form', () => {
    const mockUpdateProps = {
      action: 'update' as const,
      fixedOrganizationId: 'org-123',
      player: {
        id: 'player-123',
        name: 'John',
        lastName: 'Doe',
        avatar: '/test-avatar.jpg',
        age: 15,
        position: 'Forward',
        userId: 'user-123',
        user: {
          id: 'user-123',
          name: 'Parent',
          lastName: 'User',
          email: 'parent@test.com',
          password: 'password',
          role: 'user' as const,
          status: 'active' as const,
        },
      },
    }

    it('should render update player form', () => {
      render(<PlayerForm {...mockUpdateProps} />)

      // Check that the form renders
      expect(screen.getAllByText(/parent/i)).toHaveLength(2)
    })
  })

  describe('Form Structure', () => {
    it('should render all required form elements', () => {
      render(<PlayerForm {...mockProps} />)

      // Check that key elements are present
      expect(screen.getByText(/parent/i)).toBeInTheDocument()
    })
  })
})
