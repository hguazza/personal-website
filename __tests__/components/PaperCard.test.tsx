import { render, screen } from '@testing-library/react'
import PaperCard from '@/components/PaperCard'
import { Paper } from '@/types'

const base: Paper = {
  title: 'Attention Is All You Need',
  description: 'Introduces the Transformer architecture based solely on attention mechanisms.',
  solved: 'Understanding the foundation of modern LLMs.',
}

describe('PaperCard', () => {
  it('renders title', () => {
    render(<PaperCard paper={base} />)
    expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<PaperCard paper={base} />)
    expect(screen.getByText(/Introduces the Transformer/)).toBeInTheDocument()
  })

  it('renders solved line', () => {
    render(<PaperCard paper={base} />)
    expect(screen.getByText(/Understanding the foundation/)).toBeInTheDocument()
  })

  it('renders authors when provided', () => {
    render(<PaperCard paper={{ ...base, authors: 'Vaswani et al.' }} />)
    expect(screen.getByText(/Vaswani et al\./)).toBeInTheDocument()
  })

  it('renders year when provided', () => {
    render(<PaperCard paper={{ ...base, year: 2017 }} />)
    expect(screen.getByText(/2017/)).toBeInTheDocument()
  })

  it('renders as anchor when url provided', () => {
    render(<PaperCard paper={{ ...base, url: 'https://arxiv.org/abs/1706.03762' }} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://arxiv.org/abs/1706.03762')
  })

  it('renders without anchor when no url', () => {
    render(<PaperCard paper={base} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
