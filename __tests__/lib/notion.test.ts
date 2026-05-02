jest.mock('@notionhq/client', () => ({
  Client: jest.fn(),
  isFullPage: jest.fn().mockReturnValue(true),
}))
jest.mock('notion-to-md')

import { getPosts, getPost } from '@/lib/notion'
import { Client, isFullPage } from '@notionhq/client'
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
  beforeEach(() => { jest.clearAllMocks() })

  it('returns mapped posts from Notion', async () => {
    mockQuery.mockResolvedValue({ results: [mockPage] })
    ;(isFullPage as unknown as jest.Mock).mockReturnValue(true)
    ;(Client as jest.Mock).mockImplementation(() => ({
      databases: { query: mockQuery },
    }))
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
    ;(Client as jest.Mock).mockImplementation(() => ({
      databases: { query: mockQuery },
    }))
    const posts = await getPosts()
    expect(posts).toHaveLength(0)
  })
})

describe('getPost', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('returns null when post not found', async () => {
    mockQuery.mockResolvedValue({ results: [] })
    ;(Client as jest.Mock).mockImplementation(() => ({
      databases: { query: mockQuery },
    }))
    ;(NotionToMarkdown as jest.Mock).mockImplementation(() => ({
      pageToMarkdown: mockPageToMarkdown,
      toMarkdownString: mockToMarkdownString,
    }))
    const result = await getPost('missing-slug')
    expect(result).toBeNull()
  })

  it('returns post with markdown content and queries by slug', async () => {
    mockQuery.mockResolvedValue({ results: [mockPage] })
    ;(isFullPage as unknown as jest.Mock).mockReturnValue(true)
    ;(Client as jest.Mock).mockImplementation(() => ({
      databases: { query: mockQuery },
    }))
    ;(NotionToMarkdown as jest.Mock).mockImplementation(() => ({
      pageToMarkdown: mockPageToMarkdown,
      toMarkdownString: mockToMarkdownString,
    }))
    mockPageToMarkdown.mockResolvedValue([])
    mockToMarkdownString.mockReturnValue({ parent: '# Test content' })
    const result = await getPost('test-post')
    expect(result).not.toBeNull()
    expect(result!.post.title).toBe('Test Post')
    expect(result!.markdown).toBe('# Test content')
    expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({
      filter: expect.objectContaining({
        and: expect.arrayContaining([
          { property: 'Slug', rich_text: { equals: 'test-post' } }
        ])
      })
    }))
  })
})
