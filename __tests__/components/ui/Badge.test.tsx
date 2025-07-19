import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'

describe('Badge Component', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'border',
      'px-2',
      'py-0.5',
      'text-xs',
      'font-medium',
      'w-fit',
      'whitespace-nowrap',
      'shrink-0'
    )
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant='default'>Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass(
      'border-transparent',
      'bg-primary',
      'text-primary-foreground',
      '[a&]:hover:bg-primary/90'
    )

    rerender(<Badge variant='secondary'>Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass(
      'border-transparent',
      'bg-secondary',
      'text-secondary-foreground',
      '[a&]:hover:bg-secondary/90'
    )

    rerender(<Badge variant='destructive'>Destructive</Badge>)
    expect(screen.getByText('Destructive')).toHaveClass(
      'border-transparent',
      'bg-destructive',
      'text-white',
      '[a&]:hover:bg-destructive/90'
    )

    rerender(<Badge variant='outline'>Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('text-foreground')
  })

  it('applies custom className', () => {
    render(<Badge className='custom-badge'>Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
  })

  it('renders with children content', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    )

    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('renders as different elements', () => {
    render(
      <Badge asChild>
        <a href='/test'>Link Badge</a>
      </Badge>
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveTextContent('Link Badge')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Badge onClick={handleClick}>Clickable</Badge>)

    const badge = screen.getByText('Clickable')
    badge.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies focus styles', () => {
    render(<Badge tabIndex={0}>Focusable</Badge>)

    const badge = screen.getByText('Focusable')
    expect(badge).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  it('renders with different content types', () => {
    render(<Badge>123</Badge>)
    expect(screen.getByText('123')).toBeInTheDocument()

    render(<Badge>Status: Active</Badge>)
    expect(screen.getByText('Status: Active')).toBeInTheDocument()
  })

  it('maintains accessibility attributes', () => {
    render(
      <Badge role='status' aria-label='Status badge'>
        Status
      </Badge>
    )

    const badge = screen.getByRole('status')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Status badge')
  })
})
