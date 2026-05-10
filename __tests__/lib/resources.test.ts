import { papers, repos, videos, articles } from '@/lib/resources'

describe('resources data', () => {
  it('exports papers array', () => {
    expect(Array.isArray(papers)).toBe(true)
  })

  it('exports repos array', () => {
    expect(Array.isArray(repos)).toBe(true)
  })

  it('exports videos array', () => {
    expect(Array.isArray(videos)).toBe(true)
  })

  it('exports articles array', () => {
    expect(Array.isArray(articles)).toBe(true)
  })
})
