import { render, screen } from '@testing-library/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { describe, it, expect } from 'vitest'
import React from 'react'

describe('Table Components', () => {
  it('renders basic table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('applies correct classes to Table', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const table = screen.getByText('Content').closest('table')
    expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm')
  })

  it('applies correct classes to TableHeader', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )

    const header = screen.getByText('Header').closest('thead')
    expect(header).toHaveClass('[&_tr]:border-b')
  })

  it('applies correct classes to TableBody', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const body = screen.getByText('Content').closest('tbody')
    expect(body).toHaveClass('[&_tr:last-child]:border-0')
  })

  it('applies correct classes to TableRow', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const row = screen.getByText('Content').closest('tr')
    expect(row).toHaveClass(
      'border-b',
      'transition-colors',
      'hover:bg-muted/50',
      'data-[state=selected]:bg-muted'
    )
  })

  it('applies correct classes to TableHead', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )

    const head = screen.getByText('Header')
    expect(head).toHaveClass(
      'text-foreground',
      'h-10',
      'px-2',
      'text-left',
      'align-middle',
      'font-medium',
      'whitespace-nowrap',
      '[&:has([role=checkbox])]:pr-0',
      '[&>[role=checkbox]]:translate-y-[2px]'
    )
  })

  it('applies correct classes to TableCell', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const cell = screen.getByText('Content')
    expect(cell).toHaveClass(
      'p-2',
      'align-middle',
      'whitespace-nowrap',
      '[&:has([role=checkbox])]:pr-0',
      '[&>[role=checkbox]]:translate-y-[2px]'
    )
  })

  it('renders multiple rows correctly', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('applies custom className to Table', () => {
    render(
      <Table className='custom-table'>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const table = screen.getByText('Content').closest('table')
    expect(table).toHaveClass('custom-table')
  })

  it('applies custom className to TableRow', () => {
    render(
      <Table>
        <TableBody>
          <TableRow className='custom-row'>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const row = screen.getByText('Content').closest('tr')
    expect(row).toHaveClass('custom-row')
  })

  it('applies custom className to TableCell', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className='custom-cell'>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    const cell = screen.getByText('Content')
    expect(cell).toHaveClass('custom-cell')
  })

  it('renders table with caption', () => {
    render(
      <Table>
        <caption>User List</caption>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByText('User List')).toBeInTheDocument()
  })

  it('handles empty table body', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{/* Empty body */}</TableBody>
      </Table>
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders table with complex content', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>
              <span className='badge'>Active</span>
            </TableCell>
            <TableCell>
              <button>Edit</button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})
