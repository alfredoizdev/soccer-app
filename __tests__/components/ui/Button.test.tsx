import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant='default'>Default</Button>)
    expect(screen.getByRole('button')).toHaveClass(
      'bg-primary',
      'text-primary-foreground'
    )

    rerender(<Button variant='destructive'>Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass(
      'bg-destructive',
      'text-white'
    )

    rerender(<Button variant='outline'>Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass(
      'border',
      'bg-background',
      'shadow-xs',
      'hover:bg-accent',
      'hover:text-accent-foreground'
    )

    rerender(<Button variant='secondary'>Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass(
      'bg-secondary',
      'text-secondary-foreground'
    )

    rerender(<Button variant='ghost'>Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass(
      'hover:bg-accent',
      'hover:text-accent-foreground'
    )

    rerender(<Button variant='link'>Link</Button>)
    expect(screen.getByRole('button')).toHaveClass(
      'text-primary',
      'underline-offset-4'
    )
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size='default'>Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9', 'px-4', 'py-2')

    rerender(<Button size='sm'>Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8', 'rounded-md', 'px-3')

    rerender(<Button size='lg'>Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10', 'rounded-md', 'px-6')

    rerender(<Button size='icon'>Icon</Button>)
    expect(screen.getByRole('button')).toHaveClass('size-9')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass(
      'disabled:pointer-events-none',
      'disabled:opacity-50'
    )

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders as different elements', () => {
    render(
      <Button asChild>
        <a href='/test'>Link Button</a>
      </Button>
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveTextContent('Link Button')
  })

  it('applies custom className', () => {
    render(<Button className='custom-class'>Custom</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('renders with loading state', () => {
    render(<Button disabled>Loading...</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Loading...')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>Ref Test</Button>)

    expect(ref).toHaveBeenCalled()
  })
})
