import { render, screen } from '@testing-library/react'
import ResourceTabs from '@/components/ResourceTabs'

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/resources',
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const emptyProps = {
  papers: [],
  repos: [],
  videos: [],
  articles: [],
}

describe('ResourceTabs', () => {
  it('renders all four tab labels', () => {
    render(<ResourceTabs {...emptyProps} />)
    expect(screen.getByRole('button', { name: /papers/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /github repos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /youtube videos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /articles/i })).toBeInTheDocument()
  })

  it('shows empty state when no items in active tab', () => {
    render(<ResourceTabs {...emptyProps} />)
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
  })
})
