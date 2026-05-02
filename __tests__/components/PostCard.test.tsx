import { render, screen } from '@testing-library/react'
import PostCard from '@/components/PostCard'
import { Post } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockPost: Post = {
  id: '1',
  title: 'Building a Voice AI System',
  slug: 'building-voice-ai',
  date: '2026-04-01',
  tags: ['Voice AI', 'LangGraph'],
  cover: null,
}

describe('PostCard', () => {
  it('renders post title', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('Building a Voice AI System')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(/apr(il)?\s*1,?\s*2026/i)).toBeInTheDocument()
  })

  it('links to the correct blog post URL', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/building-voice-ai')
  })

  it('renders tags', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('Voice AI')).toBeInTheDocument()
    expect(screen.getByText('LangGraph')).toBeInTheDocument()
  })
})
