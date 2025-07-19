import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

function HelloVitest() {
  return <h1>Hello from Vitest!</h1>
}

describe('HelloVitest', () => {
  it('renders greeting', () => {
    render(<HelloVitest />)
    expect(screen.getByText('Hello from Vitest!')).toBeInTheDocument()
  })
})
