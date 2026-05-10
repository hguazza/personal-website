import { render, screen } from '@testing-library/react'
import VideoCard from '@/components/VideoCard'
import { Video } from '@/types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const base: Video = {
  title: 'Let\'s build GPT: from scratch, in code, slowly',
  description: 'Andrej Karpathy builds a GPT model from scratch in PyTorch.',
  solved: 'Understanding how transformers are implemented under the hood.',
  url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
  channel: 'Andrej Karpathy',
}

describe('VideoCard', () => {
  it('renders title', () => {
    render(<VideoCard video={base} />)
    expect(screen.getByText(/Let's build GPT/)).toBeInTheDocument()
  })

  it('renders channel name', () => {
    render(<VideoCard video={base} />)
    expect(screen.getByText('Andrej Karpathy')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<VideoCard video={base} />)
    expect(screen.getByText(/Andrej Karpathy builds a GPT/)).toBeInTheDocument()
  })

  it('renders solved line', () => {
    render(<VideoCard video={base} />)
    expect(screen.getByText(/Understanding how transformers/)).toBeInTheDocument()
  })

  it('links to the video url', () => {
    render(<VideoCard video={base} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=kCc8FmEb1nY')
  })

  it('renders thumbnail with correct src', () => {
    render(<VideoCard video={base} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://img.youtube.com/vi/kCc8FmEb1nY/mqdefault.jpg')
  })

  it('extracts id from youtu.be short urls', () => {
    render(<VideoCard video={{ ...base, url: 'https://youtu.be/kCc8FmEb1nY' }} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://img.youtube.com/vi/kCc8FmEb1nY/mqdefault.jpg')
  })
})
