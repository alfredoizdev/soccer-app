import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PostCard from '@/components/members/PostCard'
import { PostType } from '@/types/PostType'

describe('PostCard', () => {
  const basePost: PostType = {
    id: '1',
    title: 'Test Post',
    content: 'This is a test post',
    userId: 'user-1',
    slug: 'test-post',
    createdAt: new Date(),
  }

  it('renders title, content and fallback avatar', () => {
    render(<PostCard post={basePost} />)
    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('This is a test post')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('renders user avatar and name', () => {
    const post: PostType = {
      ...basePost,
      userName: 'Jane Doe',
      userAvatar: '/avatar.jpg',
    }
    render(<PostCard post={post} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders image media', () => {
    const post: PostType = {
      ...basePost,
      mediaUrl: '/test.jpg',
      mediaType: 'image',
    }
    render(<PostCard post={post} />)
    expect(screen.getByAltText('Test Post')).toBeInTheDocument()
  })

  it('renders video media', () => {
    const post: PostType = {
      ...basePost,
      mediaUrl: '/test.mp4',
      mediaType: 'video',
    }
    render(<PostCard post={post} />)
    const video = screen.getByTestId('post-video')
    expect(video).toBeInTheDocument()
  })

  it('shows No media if no mediaUrl', () => {
    render(<PostCard post={basePost} />)
    expect(screen.getByText('No media')).toBeInTheDocument()
  })
})
