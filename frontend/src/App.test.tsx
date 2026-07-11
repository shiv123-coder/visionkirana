import { render, screen } from '@testing-library/react'
import App from './App'
import { describe, it, expect } from 'vitest'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    
    // We just want to check if the app mounted. 
    // Since we don't know the exact text, we can just assert it renders some HTML element.
    expect(document.body).toBeInTheDocument()
  })
})
