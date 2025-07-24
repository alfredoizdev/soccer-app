/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PostForm from '@/components/members/PostForm'

let mockErrors = {}
vi.mock('@/hooks/useSubmitForm', () => {
  return {
    __esModule: true,
    default: (opts: any) => {
      const values = opts?.defaultValues || {}
      return {
        register: (name: string) => ({
          name,
          value: values[name] || '',
          onChange: vi.fn(),
        }),
        handleSubmit: (fn: (...args: unknown[]) => unknown) => fn,
        errors: mockErrors,
        handleFormSubmit: vi.fn(),
        isSubmitting: false,
        actionResult: undefined,
        setValue: vi.fn(),
      }
    },
  }
})

describe('PostForm', () => {
  it('renders create mode and submits valid data', async () => {
    render(<PostForm mode='create' userId='user-1' />)
    const titleInput = screen.getByLabelText(/title/i)
    const contentInput = screen.getByLabelText(/content/i)
    const submitButton = screen.getByRole('button', { name: /create post/i })

    fireEvent.change(titleInput, { target: { value: 'Test Post' } })
    fireEvent.change(contentInput, {
      target: { value: 'This is a test content for the post.' },
    })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('shows validation errors for empty fields', async () => {
    mockErrors = {
      title: { message: 'Title is required' },
      content: { message: 'Content is required' },
    }
    render(<PostForm mode='create' userId='user-1' />)
    const submitButton = screen.getByRole('button', { name: /create post/i })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/content is required/i)).toBeInTheDocument()
    })
    mockErrors = {}
  })

  it('renders update mode with initial data', () => {
    render(
      <PostForm
        mode='update'
        userId='user-1'
        postId='post-1'
        initialData={{
          title: 'Initial Title',
          content: 'Initial content',
          mediaUrl: '/test.jpg',
          mediaType: 'image',
        }}
      />
    )
    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Initial content')).toBeInTheDocument()
  })
})
