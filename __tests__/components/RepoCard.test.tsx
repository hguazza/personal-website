import { render, screen } from '@testing-library/react'
import RepoCard from '@/components/RepoCard'
import { Repo } from '@/types'

const base: Repo = {
  title: 'langchain-ai/langchain',
  description: 'Framework for developing applications powered by language models.',
  solved: 'Structuring LLM-powered pipelines with chains and agents.',
  url: 'https://github.com/langchain-ai/langchain',
}

describe('RepoCard', () => {
  it('renders title', () => {
    render(<RepoCard repo={base} />)
    expect(screen.getByText('langchain-ai/langchain')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<RepoCard repo={base} />)
    expect(screen.getByText(/Framework for developing/)).toBeInTheDocument()
  })

  it('renders solved line', () => {
    render(<RepoCard repo={base} />)
    expect(screen.getByText(/Structuring LLM-powered/)).toBeInTheDocument()
  })

  it('renders tags when provided', () => {
    render(<RepoCard repo={{ ...base, tags: ['Python', 'LangChain'] }} />)
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('LangChain')).toBeInTheDocument()
  })

  it('links to the repo url', () => {
    render(<RepoCard repo={base} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/langchain-ai/langchain')
  })
})
