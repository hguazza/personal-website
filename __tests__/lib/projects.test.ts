import { projects } from '@/lib/projects'

describe('projects data', () => {
  it('returns an array of projects', () => {
    expect(Array.isArray(projects)).toBe(true)
    expect(projects.length).toBeGreaterThan(0)
  })

  it('each project has required fields', () => {
    projects.forEach(p => {
      expect(p.title).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(Array.isArray(p.stack)).toBe(true)
    })
  })
})
