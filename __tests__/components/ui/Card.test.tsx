import { render, screen } from '@testing-library/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { describe, it, expect } from 'vitest'
import React from 'react'

describe('Card Components', () => {
  it('renders Card with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    )

    // Encontrar el elemento Card correcto (el div con data-slot="card")
    const card = screen.getByText('Card content').closest('[data-slot="card"]')
    expect(card).toHaveClass(
      'bg-card',
      'text-card-foreground',
      'flex',
      'flex-col',
      'gap-6',
      'rounded-xl',
      'border',
      'py-6',
      'shadow-sm'
    )
  })

  it('renders CardHeader with title and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Title')).toHaveClass(
      'leading-none',
      'font-semibold'
    )
    expect(screen.getByText('Card Description')).toHaveClass(
      'text-sm',
      'text-muted-foreground'
    )
  })

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>
          <p>Content paragraph</p>
        </CardContent>
      </Card>
    )

    const content = screen.getByText('Content paragraph')
    expect(content).toBeInTheDocument()
    expect(content.closest('div')).toHaveClass('px-6')
  })

  it('renders CardFooter', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    const footer = screen.getByRole('button')
    expect(footer).toBeInTheDocument()
    expect(footer.closest('div')).toHaveClass(
      'flex',
      'items-center',
      'px-6',
      '[.border-t]:pt-6'
    )
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>This is a complete card example</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content area</p>
        </CardContent>
        <CardFooter>
          <button>Save</button>
          <button>Cancel</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Complete Card')).toBeInTheDocument()
    expect(
      screen.getByText('This is a complete card example')
    ).toBeInTheDocument()
    expect(screen.getByText('Main content area')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('applies custom className to Card', () => {
    render(
      <Card className='custom-card'>
        <CardContent>Content</CardContent>
      </Card>
    )

    const card = screen.getByText('Content').closest('[data-slot="card"]')
    // El Card ahora usa clases diferentes, verificamos que el className personalizado se aplica
    expect(card).toHaveClass('custom-card')
  })

  it('applies custom className to CardHeader', () => {
    render(
      <Card>
        <CardHeader className='custom-header'>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    )

    const header = screen
      .getByText('Title')
      .closest('[data-slot="card-header"]')
    // El CardHeader ahora usa clases diferentes, verificamos que el className personalizado se aplica
    expect(header).toHaveClass('custom-header')
  })

  it('applies custom className to CardContent', () => {
    render(
      <Card>
        <CardContent className='custom-content'>Content</CardContent>
      </Card>
    )

    const content = screen.getByText('Content').closest('div')
    expect(content).toHaveClass('custom-content')
  })

  it('applies custom className to CardFooter', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter className='custom-footer'>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    const footer = screen.getByRole('button').closest('div')
    expect(footer).toHaveClass('custom-footer')
  })

  it('renders CardTitle without CardHeader', () => {
    render(
      <Card>
        <CardTitle>Standalone Title</CardTitle>
        <CardContent>Content</CardContent>
      </Card>
    )

    expect(screen.getByText('Standalone Title')).toBeInTheDocument()
    expect(screen.getByText('Standalone Title')).toHaveClass(
      'leading-none',
      'font-semibold'
    )
  })

  it('renders CardDescription without CardHeader', () => {
    render(
      <Card>
        <CardDescription>Standalone Description</CardDescription>
        <CardContent>Content</CardContent>
      </Card>
    )

    expect(screen.getByText('Standalone Description')).toBeInTheDocument()
    expect(screen.getByText('Standalone Description')).toHaveClass(
      'text-sm',
      'text-muted-foreground'
    )
  })
})
