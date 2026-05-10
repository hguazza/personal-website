import { render, screen } from '@testing-library/react'
import Nav from '@/components/Nav'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Nav', () => {
  it('renders site name', () => {
    render(<Nav />)
    expect(screen.getByText('hmg')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Nav />)
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects')
    expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: /resources/i })).toHaveAttribute('href', '/resources')
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
  })
})
