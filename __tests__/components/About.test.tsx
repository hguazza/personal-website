import { render, screen } from '@testing-library/react'
import About from '@/components/About'

describe('About', () => {
  it('renders the about heading', () => {
    render(<About />)
    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument()
  })

  it('renders stack badge tags', () => {
    render(<About />)
    expect(screen.getByText('LangGraph')).toBeInTheDocument()
    expect(screen.getByText('FastAPI')).toBeInTheDocument()
  })
})
