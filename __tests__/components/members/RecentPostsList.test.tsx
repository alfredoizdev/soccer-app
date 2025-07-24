import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RecentPostsList from '@/components/members/RecentPostsList'
import { PostType } from '@/types/PostType'

describe('RecentPostsList', () => {
  const basePost: PostType = {
    id: '1',
    title: 'Test Post',
    content: 'This is a test post',
    userId: 'user-1',
    slug: 'test-post',
    createdAt: new Date(),
  }

  it('renders a list of posts', () => {
    const posts: PostType[] = [
      { ...basePost, id: '1', title: 'Post 1' },
      { ...basePost, id: '2', title: 'Post 2' },
      { ...basePost, id: '3', title: 'Post 3' },
      { ...basePost, id: '4', title: 'Post 4' },
    ]
    render(<RecentPostsList posts={posts} />)
    expect(screen.getByText('Others posts')).toBeInTheDocument()
    expect(screen.getByText('Post 1')).toBeInTheDocument()
    expect(screen.getByText('Post 2')).toBeInTheDocument()
  })

  it('renders user avatar and name', () => {
    const posts: PostType[] = [
      { ...basePost, id: '1', userName: 'Jane Doe', userAvatar: '/avatar.jpg' },
    ]
    render(<RecentPostsList posts={posts} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders image media', () => {
    const posts: PostType[] = [
      { ...basePost, id: '1', mediaUrl: '/test.jpg', mediaType: 'image' },
    ]
    render(<RecentPostsList posts={posts} />)
    expect(screen.getByAltText('Test Post')).toBeInTheDocument()
  })

  it('renders video media', () => {
    const posts: PostType[] = [
      { ...basePost, id: '1', mediaUrl: '/test.mp4', mediaType: 'video' },
    ]
    render(<RecentPostsList posts={posts} />)
    const video = screen.getByTestId('post-video')
    expect(video).toBeInTheDocument()
  })

  it('returns null if no posts', () => {
    render(<RecentPostsList posts={[]} />)
    expect(screen.queryByText('Others posts')).not.toBeInTheDocument()
  })
})
