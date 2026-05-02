jest.mock('@notionhq/client')
jest.mock('notion-to-md')

import { getPosts, getPost } from '@/lib/notion'
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

const mockQuery = jest.fn()
const mockPageToMarkdown = jest.fn()
const mockToMarkdownString = jest.fn()

;(Client as jest.Mock).mockImplementation(() => ({
  databases: { query: mockQuery },
}))

;(NotionToMarkdown as jest.Mock).mockImplementation(() => ({
  pageToMarkdown: mockPageToMarkdown,
  toMarkdownString: mockToMarkdownString,
}))

const mockPage = {
  id: 'page-1',
  cover: null,
  properties: {
    Title: { title: [{ plain_text: 'Test Post' }] },
    Slug: { rich_text: [{ plain_text: 'test-post' }] },
    Date: { date: { start: '2026-01-01' } },
    Tags: { multi_select: [{ name: 'AI' }, { name: 'Engineering' }] },
  },
}

describe('getPosts', () => {
  it('returns mapped posts from Notion', async () => {
    mockQuery.mockResolvedValue({ results: [mockPage] })
    const posts = await getPosts()
    expect(posts).toHaveLength(1)
    expect(posts[0]).toEqual({
      id: 'page-1',
      title: 'Test Post',
      slug: 'test-post',
      date: '2026-01-01',
      tags: ['AI', 'Engineering'],
      cover: null,
    })
  })

  it('returns empty array when no published posts', async () => {
    mockQuery.mockResolvedValue({ results: [] })
    const posts = await getPosts()
    expect(posts).toHaveLength(0)
  })
})

describe('getPost', () => {
  it('returns null when post not found', async () => {
    mockQuery.mockResolvedValue({ results: [] })
    const result = await getPost('missing-slug')
    expect(result).toBeNull()
  })

  it('returns post with markdown content', async () => {
    mockQuery.mockResolvedValue({ results: [mockPage] })
    mockPageToMarkdown.mockResolvedValue([])
    mockToMarkdownString.mockReturnValue({ parent: '# Test content' })
    const result = await getPost('test-post')
    expect(result).not.toBeNull()
    expect(result!.post.title).toBe('Test Post')
    expect(result!.markdown).toBe('# Test content')
  })
})
