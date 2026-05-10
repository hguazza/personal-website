import { render, screen } from '@testing-library/react'
import ArticleCard from '@/components/ArticleCard'
import { Article } from '@/types'

const base: Article = {
  title: 'The Illustrated Transformer',
  description: 'A visual guide to the Transformer architecture.',
  solved: 'Understanding attention mechanisms intuitively.',
}

describe('ArticleCard', () => {
  it('renders title', () => {
    render(<ArticleCard article={base} />)
    expect(screen.getByText('The Illustrated Transformer')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<ArticleCard article={base} />)
    expect(screen.getByText('A visual guide to the Transformer architecture.')).toBeInTheDocument()
  })

  it('renders solved line', () => {
    render(<ArticleCard article={base} />)
    expect(screen.getByText(/Understanding attention mechanisms intuitively\./)).toBeInTheDocument()
  })

  it('renders source when provided', () => {
    render(<ArticleCard article={{ ...base, source: 'Jay Alammar' }} />)
    expect(screen.getByText('Jay Alammar')).toBeInTheDocument()
  })

  it('renders as anchor when url provided', () => {
    render(<ArticleCard article={{ ...base, url: 'https://example.com' }} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })

  it('renders without anchor when no url', () => {
    render(<ArticleCard article={base} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
