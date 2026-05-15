# Resources Notion Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `lib/resources.ts` arrays with four Notion databases so resources can be added directly in Notion and appear on the `/resources` page.

**Architecture:** A new `lib/resources-notion.ts` exports four async fetch functions (`getPapers`, `getRepos`, `getVideos`, `getArticles`), each querying its own Notion database filtered by `Published: true`. `app/resources/page.tsx` becomes an async server component that fetches all four in parallel and passes results to `ResourceTabs` — no changes to any card component or `ResourceTabs` itself. `lib/resources.ts` is deleted.

**Tech Stack:** Next.js 15 App Router, `@notionhq/client` (already installed), TypeScript, Jest + `@testing-library/react`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `lib/resources-notion.ts` | Four typed async fetch functions |
| Create | `__tests__/lib/resources-notion.test.ts` | Unit tests with mocked Notion client |
| Modify | `app/resources/page.tsx` | Async server component, parallel fetch, revalidate |
| Modify | `.env.example` | Document four new database ID env vars |
| Delete | `lib/resources.ts` | Replaced by resources-notion.ts |
| Delete | `__tests__/lib/resources.test.ts` | Replaced by resources-notion.test.ts |

---

### Task 1: Create lib/resources-notion.ts

**Files:**
- Create: `lib/resources-notion.ts`
- Create: `__tests__/lib/resources-notion.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/resources-notion.test.ts`:

```ts
jest.mock('@notionhq/client', () => ({
  Client: jest.fn(),
  isFullPage: jest.fn().mockReturnValue(true),
}))

import { getPapers, getRepos, getVideos, getArticles } from '@/lib/resources-notion'
import { Client } from '@notionhq/client'

const mockQuery = jest.fn()

;(Client as jest.Mock).mockImplementation(() => ({
  databases: { query: mockQuery },
}))

const originalEnv = process.env

beforeEach(() => {
  jest.clearAllMocks()
  process.env = {
    ...originalEnv,
    NOTION_PAPERS_DB_ID: 'papers-db-id',
    NOTION_REPOS_DB_ID: 'repos-db-id',
    NOTION_VIDEOS_DB_ID: 'videos-db-id',
    NOTION_ARTICLES_DB_ID: 'articles-db-id',
  }
})

afterEach(() => {
  process.env = originalEnv
})

// ── getPapers ──────────────────────────────────────────────────────────────

describe('getPapers', () => {
  it('returns [] when NOTION_PAPERS_DB_ID is not set', async () => {
    delete process.env.NOTION_PAPERS_DB_ID
    expect(await getPapers()).toEqual([])
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('returns [] when Notion returns no results', async () => {
    mockQuery.mockResolvedValue({ results: [] })
    expect(await getPapers()).toEqual([])
  })

  it('maps a full Notion page to a Paper', async () => {
    mockQuery.mockResolvedValue({
      results: [{
        id: 'p1',
        properties: {
          Name:        { title: [{ plain_text: 'Attention Is All You Need' }] },
          Description: { rich_text: [{ plain_text: 'The transformer paper.' }] },
          Solved:      { rich_text: [{ plain_text: 'Understanding attention.' }] },
          URL:         { url: 'https://arxiv.org/abs/1706.03762' },
          Authors:     { rich_text: [{ plain_text: 'Vaswani et al.' }] },
          Year:        { number: 2017 },
        },
      }],
    })
    expect(await getPapers()).toEqual([{
      title:       'Attention Is All You Need',
      description: 'The transformer paper.',
      solved:      'Understanding attention.',
      url:         'https://arxiv.org/abs/1706.03762',
      authors:     'Vaswani et al.',
      year:        2017,
    }])
  })

  it('omits optional fields when they are blank', async () => {
    mockQuery.mockResolvedValue({
      results: [{
        id: 'p2',
        properties: {
          Name:        { title: [{ plain_text: 'No Meta Paper' }] },
          Description: { rich_text: [{ plain_text: 'Desc.' }] },
          Solved:      { rich_text: [{ plain_text: 'Solved.' }] },
          URL:         { url: null },
          Authors:     { rich_text: [] },
          Year:        { number: null },
        },
      }],
    })
    const result = await getPapers()
    expect(result[0].url).toBeUndefined()
    expect(result[0].authors).toBeUndefined()
    expect(result[0].year).toBeUndefined()
  })
})

// ── getRepos ───────────────────────────────────────────────────────────────

describe('getRepos', () => {
  it('returns [] when NOTION_REPOS_DB_ID is not set', async () => {
    delete process.env.NOTION_REPOS_DB_ID
    expect(await getRepos()).toEqual([])
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('maps a full Notion page to a Repo', async () => {
    mockQuery.mockResolvedValue({
      results: [{
        id: 'r1',
        properties: {
          Name:        { title: [{ plain_text: 'langchain-ai/langchain' }] },
          Description: { rich_text: [{ plain_text: 'LLM framework.' }] },
          Solved:      { rich_text: [{ plain_text: 'Structuring pipelines.' }] },
          URL:         { url: 'https://github.com/langchain-ai/langchain' },
          Tags:        { multi_select: [{ name: 'Python' }, { name: 'LangChain' }] },
        },
      }],
    })
    expect(await getRepos()).toEqual([{
      title:       'langchain-ai/langchain',
      description: 'LLM framework.',
      solved:      'Structuring pipelines.',
      url:         'https://github.com/langchain-ai/langchain',
      tags:        ['Python', 'LangChain'],
    }])
  })
})

// ── getVideos ──────────────────────────────────────────────────────────────

describe('getVideos', () => {
  it('returns [] when NOTION_VIDEOS_DB_ID is not set', async () => {
    delete process.env.NOTION_VIDEOS_DB_ID
    expect(await getVideos()).toEqual([])
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('maps a full Notion page to a Video', async () => {
    mockQuery.mockResolvedValue({
      results: [{
        id: 'v1',
        properties: {
          Name:        { title: [{ plain_text: "Let's build GPT" }] },
          Description: { rich_text: [{ plain_text: 'GPT from scratch.' }] },
          Solved:      { rich_text: [{ plain_text: 'Understanding transformers.' }] },
          URL:         { url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY' },
          Channel:     { rich_text: [{ plain_text: 'Andrej Karpathy' }] },
        },
      }],
    })
    expect(await getVideos()).toEqual([{
      title:       "Let's build GPT",
      description: 'GPT from scratch.',
      solved:      'Understanding transformers.',
      url:         'https://www.youtube.com/watch?v=kCc8FmEb1nY',
      channel:     'Andrej Karpathy',
    }])
  })
})

// ── getArticles ────────────────────────────────────────────────────────────

describe('getArticles', () => {
  it('returns [] when NOTION_ARTICLES_DB_ID is not set', async () => {
    delete process.env.NOTION_ARTICLES_DB_ID
    expect(await getArticles()).toEqual([])
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('maps a full Notion page to an Article', async () => {
    mockQuery.mockResolvedValue({
      results: [{
        id: 'a1',
        properties: {
          Name:        { title: [{ plain_text: 'The Illustrated Transformer' }] },
          Description: { rich_text: [{ plain_text: 'Visual guide.' }] },
          Solved:      { rich_text: [{ plain_text: 'Grasping attention.' }] },
          URL:         { url: 'https://jalammar.github.io/illustrated-transformer/' },
          Source:      { rich_text: [{ plain_text: 'Jay Alammar' }] },
        },
      }],
    })
    expect(await getArticles()).toEqual([{
      title:       'The Illustrated Transformer',
      description: 'Visual guide.',
      solved:      'Grasping attention.',
      url:         'https://jalammar.github.io/illustrated-transformer/',
      source:      'Jay Alammar',
    }])
  })

  it('omits source when blank', async () => {
    mockQuery.mockResolvedValue({
      results: [{
        id: 'a2',
        properties: {
          Name:        { title: [{ plain_text: 'No Source Article' }] },
          Description: { rich_text: [{ plain_text: 'Desc.' }] },
          Solved:      { rich_text: [{ plain_text: 'Solved.' }] },
          URL:         { url: null },
          Source:      { rich_text: [] },
        },
      }],
    })
    const result = await getArticles()
    expect(result[0].source).toBeUndefined()
    expect(result[0].url).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/lib/resources-notion.test.ts --no-coverage`
Expected: FAIL — "Cannot find module '@/lib/resources-notion'"

- [ ] **Step 3: Create lib/resources-notion.ts**

```ts
import { Client, isFullPage } from '@notionhq/client'
import { Paper, Repo, Video, Article } from '@/types'

function makeClient() {
  return new Client({ auth: process.env.NOTION_API_KEY })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richText(prop: any): string {
  return prop?.rich_text?.[0]?.plain_text ?? ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function optionalUrl(prop: any): string | undefined {
  return prop?.url ?? undefined
}

export async function getPapers(): Promise<Paper[]> {
  if (!process.env.NOTION_PAPERS_DB_ID) return []
  const notion = makeClient()
  const { results } = await notion.databases.query({
    database_id: process.env.NOTION_PAPERS_DB_ID,
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })
  return results.filter(isFullPage).map(page => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (page as any).properties
    return {
      title:       p.Name?.title[0]?.plain_text ?? '',
      description: richText(p.Description),
      solved:      richText(p.Solved),
      url:         optionalUrl(p.URL),
      authors:     richText(p.Authors) || undefined,
      year:        p.Year?.number ?? undefined,
    }
  })
}

export async function getRepos(): Promise<Repo[]> {
  if (!process.env.NOTION_REPOS_DB_ID) return []
  const notion = makeClient()
  const { results } = await notion.databases.query({
    database_id: process.env.NOTION_REPOS_DB_ID,
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })
  return results.filter(isFullPage).map(page => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (page as any).properties
    return {
      title:       p.Name?.title[0]?.plain_text ?? '',
      description: richText(p.Description),
      solved:      richText(p.Solved),
      url:         p.URL?.url ?? '',
      tags:        p.Tags?.multi_select?.map((t: { name: string }) => t.name) ?? [],
    }
  })
}

export async function getVideos(): Promise<Video[]> {
  if (!process.env.NOTION_VIDEOS_DB_ID) return []
  const notion = makeClient()
  const { results } = await notion.databases.query({
    database_id: process.env.NOTION_VIDEOS_DB_ID,
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })
  return results.filter(isFullPage).map(page => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (page as any).properties
    return {
      title:       p.Name?.title[0]?.plain_text ?? '',
      description: richText(p.Description),
      solved:      richText(p.Solved),
      url:         p.URL?.url ?? '',
      channel:     richText(p.Channel),
    }
  })
}

export async function getArticles(): Promise<Article[]> {
  if (!process.env.NOTION_ARTICLES_DB_ID) return []
  const notion = makeClient()
  const { results } = await notion.databases.query({
    database_id: process.env.NOTION_ARTICLES_DB_ID,
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })
  return results.filter(isFullPage).map(page => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (page as any).properties
    return {
      title:       p.Name?.title[0]?.plain_text ?? '',
      description: richText(p.Description),
      solved:      richText(p.Solved),
      url:         optionalUrl(p.URL),
      source:      richText(p.Source) || undefined,
    }
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/lib/resources-notion.test.ts --no-coverage`
Expected: PASS — 11 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/resources-notion.ts __tests__/lib/resources-notion.test.ts
git commit -m "feat: add lib/resources-notion.ts with four Notion fetch functions"
```

---

### Task 2: Update app/resources/page.tsx

**Files:**
- Modify: `app/resources/page.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import { Suspense } from 'react'
import ResourceTabs from '@/components/ResourceTabs'
import { getPapers, getRepos, getVideos, getArticles } from '@/lib/resources-notion'

export const revalidate = 3600

export const metadata = {
  title: 'Resources — Henrique Guazzelli',
  description: 'Papers, repos, videos, and articles that shaped how I think and build.',
}

export default async function ResourcesPage() {
  const [papers, repos, videos, articles] = await Promise.all([
    getPapers(), getRepos(), getVideos(), getArticles(),
  ])

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="mb-4 font-mono text-4xl font-bold text-text-primary">Resources</h1>
      <p className="mb-12 text-text-secondary">
        Papers, repos, videos, and articles that shaped how I think and build.
      </p>
      <Suspense fallback={<div className="h-96" />}>
        <ResourceTabs
          papers={papers}
          repos={repos}
          videos={videos}
          articles={articles}
        />
      </Suspense>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no new errors (pre-existing error in `__tests__/lib/notion.test.ts` is unrelated — ignore it)

- [ ] **Step 3: Commit**

```bash
git add app/resources/page.tsx
git commit -m "feat: make resources page async with Notion data fetching"
```

---

### Task 3: Cleanup and env docs

**Files:**
- Delete: `lib/resources.ts`
- Delete: `__tests__/lib/resources.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: Delete the old static files**

```bash
rm lib/resources.ts __tests__/lib/resources.test.ts
```

- [ ] **Step 2: Update .env.example**

Replace the contents of `.env.example` with:

```
NOTION_API_KEY=
NOTION_DATABASE_ID=
NEXT_PUBLIC_CAL_LINK=
NOTION_PAPERS_DB_ID=
NOTION_REPOS_DB_ID=
NOTION_VIDEOS_DB_ID=
NOTION_ARTICLES_DB_ID=
```

- [ ] **Step 3: Run full test suite**

Run: `npx jest --no-coverage`
Expected: all remaining tests pass, no failures related to missing `lib/resources`

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove static resources.ts, document new Notion env vars"
```

- [ ] **Step 6: Push**

```bash
git push
```
