import { render, screen } from '@testing-library/react'
import ProjectCard from '@/components/ProjectCard'
import { Project } from '@/types'

const mockProject: Project = {
  title: 'Fraud Detection Agent',
  description: 'Detected R$5M+ in fraud.',
  stack: ['Elasticsearch', 'Python'],
  highlight: 'R$5M+ fraud detected',
}

describe('ProjectCard', () => {
  it('renders project title', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText('Fraud Detection Agent')).toBeInTheDocument()
  })

  it('renders project description', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText('Detected R$5M+ in fraud.')).toBeInTheDocument()
  })

  it('renders stack tags', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText('Elasticsearch')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('renders highlight badge when present', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText('R$5M+ fraud detected')).toBeInTheDocument()
  })
})
