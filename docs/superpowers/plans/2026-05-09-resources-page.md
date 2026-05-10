# Resources Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/articles` with a `/resources` page featuring four tabbed categories (Papers, GitHub Repos, YouTube Videos, Articles) backed by a static TypeScript data file.

**Architecture:** A server component (`app/resources/page.tsx`) imports all four data arrays and passes them as props to a single `'use client'` tab component (`ResourceTabs.tsx`), which manages active tab state locally and syncs it to the URL via `?tab=<category>`. Each category renders its own card component. `ResourceTabs` is wrapped in `<Suspense>` because it uses `useSearchParams`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, `@testing-library/react`, Jest

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `types/index.ts` | Replace old `Article`; add `Paper`, `Repo`, `Video`, `Article` |
| Create | `lib/resources.ts` | Four named data arrays |
| Modify | `next.config.ts` | Allow `img.youtube.com` for thumbnails |
| Rewrite | `components/ArticleCard.tsx` | Add `source` field |
| Create | `components/PaperCard.tsx` | Paper card with authors + year |
| Create | `components/RepoCard.tsx` | Repo card with tag pills |
| Create | `components/VideoCard.tsx` | Video card with auto-derived thumbnail |
| Create | `components/ResourceTabs.tsx` | Tab bar + URL sync + active grid |
| Create | `app/resources/page.tsx` | Server component, wraps tabs in Suspense |
| Modify | `components/Nav.tsx` | Articles → Resources |
| Modify | `__tests__/components/Nav.test.tsx` | Update link assertion |
| Create | `__tests__/components/ArticleCard.test.tsx` | ArticleCard tests |
| Create | `__tests__/components/PaperCard.test.tsx` | PaperCard tests |
| Create | `__tests__/components/RepoCard.test.tsx` | RepoCard tests |
| Create | `__tests__/components/VideoCard.test.tsx` | VideoCard tests |
| Create | `__tests__/components/ResourceTabs.test.tsx` | ResourceTabs tests |
| Delete | `app/articles/page.tsx` + dir | Replaced by /resources |
| Delete | `lib/articles.ts` | Replaced by lib/resources.ts |

---

### Task 1: Update types

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Replace the file contents**

```ts
export interface Post {
  id: string
  title: string
  slug: string
  date: string
  tags: string[]
  cover: string | null
}

export interface Project {
  title: string
  description: string
  stack: string[]
  highlight?: string
}

export interface Paper {
  title: string
  description: string
  solved: string
  url?: string
  authors?: string
  year?: number
}

export interface Repo {
  title: string
  description: string
  solved: string
  url: string
  tags?: string[]
}

export interface Video {
  title: string
  description: string
  solved: string
  url: string
  channel: string
}

export interface Article {
  title: string
  description: string
  solved: string
  url?: string
  source?: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "feat: add Paper, Repo, Video types; update Article type"
```

---

### Task 2: Create data layer

**Files:**
- Create: `lib/resources.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/resources.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/lib/resources.test.ts --no-coverage`
Expected: FAIL — "Cannot find module '@/lib/resources'"

- [ ] **Step 3: Create lib/resources.ts**

```ts
import { Paper, Repo, Video, Article } from '@/types'

export const papers: Paper[] = []

export const repos: Repo[] = []

export const videos: Video[] = []

export const articles: Article[] = []
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/lib/resources.test.ts --no-coverage`
Expected: PASS — 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/resources.ts __tests__/lib/resources.test.ts
git commit -m "feat: add lib/resources.ts with four typed data arrays"
```

---

### Task 3: Allow YouTube thumbnails in Next.js config

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add img.youtube.com to remotePatterns**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.notion.so' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "feat: allow img.youtube.com for video thumbnails"
```

---

### Task 4: Rewrite ArticleCard

**Files:**
- Rewrite: `components/ArticleCard.tsx`
- Create: `__tests__/components/ArticleCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/ArticleCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ArticleCard from '@/components/ArticleCard'
import { Article } from '@/types'

const base: Article = {
  title: 'The Illustrated Transformer',
  description: 'A visual guide to the Transformer architecture.',
  solved: 'Understanding attention mechanisms intuitively.',
}

describe('ArticleCard', () => {
  it('renders title', () => {
    render(<ArticleCard article={base} />)
    expect(screen.getByText('The Illustrated Transformer')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<ArticleCard article={base} />)
    expect(screen.getByText('A visual guide to the Transformer architecture.')).toBeInTheDocument()
  })

  it('renders solved line', () => {
    render(<ArticleCard article={base} />)
    expect(screen.getByText(/Understanding attention mechanisms intuitively\./)).toBeInTheDocument()
  })

  it('renders source when provided', () => {
    render(<ArticleCard article={{ ...base, source: 'Jay Alammar' }} />)
    expect(screen.getByText('Jay Alammar')).toBeInTheDocument()
  })

  it('renders as anchor when url provided', () => {
    render(<ArticleCard article={{ ...base, url: 'https://example.com' }} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })

  it('renders without anchor when no url', () => {
    render(<ArticleCard article={base} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/components/ArticleCard.test.tsx --no-coverage`
Expected: FAIL — several assertions fail due to missing `source` field

- [ ] **Step 3: Rewrite ArticleCard.tsx**

```tsx
import { Article } from '@/types'

export default function ArticleCard({ article }: { article: Article }) {
  const inner = (
    <article className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      {article.source && (
        <p className="mb-1 font-mono text-xs text-accent">{article.source}</p>
      )}
      <h2 className="mb-2 font-mono text-base font-semibold text-text-primary group-hover:text-accent transition-colors">
        {article.title}
      </h2>
      <p className="mb-4 text-sm text-text-secondary leading-relaxed">
        {article.description}
      </p>
      <p className="text-xs text-text-secondary">
        <span className="font-mono text-accent">solved →</span>{' '}
        {article.solved}
      </p>
    </article>
  )

  if (article.url) {
    return (
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="group block">
        {inner}
      </a>
    )
  }

  return <div className="group">{inner}</div>
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/components/ArticleCard.test.tsx --no-coverage`
Expected: PASS — 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add components/ArticleCard.tsx __tests__/components/ArticleCard.test.tsx
git commit -m "feat: rewrite ArticleCard with source field"
```

---

### Task 5: Create PaperCard

**Files:**
- Create: `components/PaperCard.tsx`
- Create: `__tests__/components/PaperCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/PaperCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import PaperCard from '@/components/PaperCard'
import { Paper } from '@/types'

const base: Paper = {
  title: 'Attention Is All You Need',
  description: 'Introduces the Transformer architecture based solely on attention mechanisms.',
  solved: 'Understanding the foundation of modern LLMs.',
}

describe('PaperCard', () => {
  it('renders title', () => {
    render(<PaperCard paper={base} />)
    expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<PaperCard paper={base} />)
    expect(screen.getByText(/Introduces the Transformer/)).toBeInTheDocument()
  })

  it('renders solved line', () => {
    render(<PaperCard paper={base} />)
    expect(screen.getByText(/Understanding the foundation/)).toBeInTheDocument()
  })

  it('renders authors when provided', () => {
    render(<PaperCard paper={{ ...base, authors: 'Vaswani et al.' }} />)
    expect(screen.getByText(/Vaswani et al\./)).toBeInTheDocument()
  })

  it('renders year when provided', () => {
    render(<PaperCard paper={{ ...base, year: 2017 }} />)
    expect(screen.getByText(/2017/)).toBeInTheDocument()
  })

  it('renders as anchor when url provided', () => {
    render(<PaperCard paper={{ ...base, url: 'https://arxiv.org/abs/1706.03762' }} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://arxiv.org/abs/1706.03762')
  })

  it('renders without anchor when no url', () => {
    render(<PaperCard paper={base} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/components/PaperCard.test.tsx --no-coverage`
Expected: FAIL — "Cannot find module '@/components/PaperCard'"

- [ ] **Step 3: Create PaperCard.tsx**

```tsx
import { Paper } from '@/types'

export default function PaperCard({ paper }: { paper: Paper }) {
  const hasMeta = paper.year || paper.authors

  const inner = (
    <article className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      {hasMeta && (
        <p className="mb-1 font-mono text-xs text-text-secondary">
          {[paper.year, paper.authors].filter(Boolean).join(' · ')}
        </p>
      )}
      <h2 className="mb-2 font-mono text-base font-semibold text-text-primary group-hover:text-accent transition-colors">
        {paper.title}
      </h2>
      <p className="mb-4 text-sm text-text-secondary leading-relaxed">
        {paper.description}
      </p>
      <p className="text-xs text-text-secondary">
        <span className="font-mono text-accent">solved →</span>{' '}
        {paper.solved}
      </p>
    </article>
  )

  if (paper.url) {
    return (
      <a href={paper.url} target="_blank" rel="noopener noreferrer" className="group block">
        {inner}
      </a>
    )
  }

  return <div className="group">{inner}</div>
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/components/PaperCard.test.tsx --no-coverage`
Expected: PASS — 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add components/PaperCard.tsx __tests__/components/PaperCard.test.tsx
git commit -m "feat: add PaperCard component"
```

---

### Task 6: Create RepoCard

**Files:**
- Create: `components/RepoCard.tsx`
- Create: `__tests__/components/RepoCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/RepoCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import RepoCard from '@/components/RepoCard'
import { Repo } from '@/types'

const base: Repo = {
  title: 'langchain-ai/langchain',
  description: 'Framework for developing applications powered by language models.',
  solved: 'Structuring LLM-powered pipelines with chains and agents.',
  url: 'https://github.com/langchain-ai/langchain',
}

describe('RepoCard', () => {
  it('renders title', () => {
    render(<RepoCard repo={base} />)
    expect(screen.getByText('langchain-ai/langchain')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<RepoCard repo={base} />)
    expect(screen.getByText(/Framework for developing/)).toBeInTheDocument()
  })

  it('renders solved line', () => {
    render(<RepoCard repo={base} />)
    expect(screen.getByText(/Structuring LLM-powered/)).toBeInTheDocument()
  })

  it('renders tags when provided', () => {
    render(<RepoCard repo={{ ...base, tags: ['Python', 'LangChain'] }} />)
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('LangChain')).toBeInTheDocument()
  })

  it('links to the repo url', () => {
    render(<RepoCard repo={base} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/langchain-ai/langchain')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/components/RepoCard.test.tsx --no-coverage`
Expected: FAIL — "Cannot find module '@/components/RepoCard'"

- [ ] **Step 3: Create RepoCard.tsx**

```tsx
import { Repo } from '@/types'

export default function RepoCard({ repo }: { repo: Repo }) {
  return (
    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="group block">
      <article className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
        <h2 className="mb-2 font-mono text-base font-semibold text-text-primary group-hover:text-accent transition-colors">
          {repo.title}
        </h2>
        <p className="mb-4 text-sm text-text-secondary leading-relaxed">
          {repo.description}
        </p>
        <p className="mb-4 text-xs text-text-secondary">
          <span className="font-mono text-accent">solved →</span>{' '}
          {repo.solved}
        </p>
        {repo.tags && repo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repo.tags.map(tag => (
              <span
                key={tag}
                className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </a>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/components/RepoCard.test.tsx --no-coverage`
Expected: PASS — 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add components/RepoCard.tsx __tests__/components/RepoCard.test.tsx
git commit -m "feat: add RepoCard component"
```

---

### Task 7: Create VideoCard

**Files:**
- Create: `components/VideoCard.tsx`
- Create: `__tests__/components/VideoCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/VideoCard.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/components/VideoCard.test.tsx --no-coverage`
Expected: FAIL — "Cannot find module '@/components/VideoCard'"

- [ ] **Step 3: Create VideoCard.tsx**

```tsx
import Image from 'next/image'
import { Video } from '@/types'

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export default function VideoCard({ video }: { video: Video }) {
  const videoId = extractYouTubeId(video.url)
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null

  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" className="group block">
      <article className="overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
        {thumbnail && (
          <div className="relative h-40 w-full">
            <Image
              src={thumbnail}
              alt={video.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <p className="mb-1 font-mono text-xs text-accent">{video.channel}</p>
          <h2 className="mb-2 font-mono text-base font-semibold text-text-primary group-hover:text-accent transition-colors">
            {video.title}
          </h2>
          <p className="mb-4 text-sm text-text-secondary leading-relaxed">
            {video.description}
          </p>
          <p className="text-xs text-text-secondary">
            <span className="font-mono text-accent">solved →</span>{' '}
            {video.solved}
          </p>
        </div>
      </article>
    </a>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/components/VideoCard.test.tsx --no-coverage`
Expected: PASS — 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add components/VideoCard.tsx __tests__/components/VideoCard.test.tsx
git commit -m "feat: add VideoCard component with auto-derived YouTube thumbnail"
```

---

### Task 8: Create ResourceTabs

**Files:**
- Create: `components/ResourceTabs.tsx`
- Create: `__tests__/components/ResourceTabs.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/ResourceTabs.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/components/ResourceTabs.test.tsx --no-coverage`
Expected: FAIL — "Cannot find module '@/components/ResourceTabs'"

- [ ] **Step 3: Create ResourceTabs.tsx**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Paper, Repo, Video, Article } from '@/types'
import PaperCard from '@/components/PaperCard'
import RepoCard from '@/components/RepoCard'
import VideoCard from '@/components/VideoCard'
import ArticleCard from '@/components/ArticleCard'

type Tab = 'papers' | 'repos' | 'videos' | 'articles'

const TABS: { id: Tab; label: string }[] = [
  { id: 'papers', label: 'Papers' },
  { id: 'repos', label: 'GitHub Repos' },
  { id: 'videos', label: 'YouTube Videos' },
  { id: 'articles', label: 'Articles' },
]

interface Props {
  papers: Paper[]
  repos: Repo[]
  videos: Video[]
  articles: Article[]
}

export default function ResourceTabs({ papers, repos, videos, articles }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initial = (searchParams.get('tab') as Tab) ?? 'papers'
  const [active, setActive] = useState<Tab>(initial)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', active)
    router.replace(`${pathname}?${params.toString()}`)
  }, [active, pathname, router, searchParams])

  const counts: Record<Tab, number> = {
    papers: papers.length,
    repos: repos.length,
    videos: videos.length,
    articles: articles.length,
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-8 flex gap-1 border-b border-border">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={[
              'px-4 py-2 text-sm font-mono transition-colors',
              active === tab.id
                ? 'border-b-2 border-accent text-text-primary -mb-px'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className="ml-2 text-xs text-text-secondary">
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active grid */}
      {active === 'papers' && (
        papers.length === 0
          ? <p className="text-text-secondary">Nothing here yet. Check back soon.</p>
          : <div className="grid gap-6 md:grid-cols-2">
              {papers.map((p, i) => <PaperCard key={i} paper={p} />)}
            </div>
      )}
      {active === 'repos' && (
        repos.length === 0
          ? <p className="text-text-secondary">Nothing here yet. Check back soon.</p>
          : <div className="grid gap-6 md:grid-cols-2">
              {repos.map((r, i) => <RepoCard key={i} repo={r} />)}
            </div>
      )}
      {active === 'videos' && (
        videos.length === 0
          ? <p className="text-text-secondary">Nothing here yet. Check back soon.</p>
          : <div className="grid gap-6 md:grid-cols-2">
              {videos.map((v, i) => <VideoCard key={i} video={v} />)}
            </div>
      )}
      {active === 'articles' && (
        articles.length === 0
          ? <p className="text-text-secondary">Nothing here yet. Check back soon.</p>
          : <div className="grid gap-6 md:grid-cols-2">
              {articles.map((a, i) => <ArticleCard key={i} article={a} />)}
            </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/components/ResourceTabs.test.tsx --no-coverage`
Expected: PASS — 2 tests pass

- [ ] **Step 5: Commit**

```bash
git add components/ResourceTabs.tsx __tests__/components/ResourceTabs.test.tsx
git commit -m "feat: add ResourceTabs component with URL-synced tab state"
```

---

### Task 9: Create Resources page

**Files:**
- Create: `app/resources/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { Suspense } from 'react'
import ResourceTabs from '@/components/ResourceTabs'
import { papers, repos, videos, articles } from '@/lib/resources'

export const metadata = {
  title: 'Resources — Henrique Guazzelli',
  description: 'Papers, repos, videos, and articles that shaped how I think and build.',
}

export default function ResourcesPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="mb-4 font-mono text-4xl font-bold text-text-primary">Resources</h1>
      <p className="mb-12 text-text-secondary">
        Papers, repos, videos, and articles that shaped how I think and build.
      </p>
      <Suspense>
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
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/resources/page.tsx
git commit -m "feat: add /resources page"
```

---

### Task 10: Update Nav and its test

**Files:**
- Modify: `components/Nav.tsx`
- Modify: `__tests__/components/Nav.test.tsx`

- [ ] **Step 1: Update Nav.tsx link**

In `components/Nav.tsx`, change:
```ts
{ label: 'Articles', href: '/articles' },
```
to:
```ts
{ label: 'Resources', href: '/resources' },
```

- [ ] **Step 2: Update Nav test**

In `__tests__/components/Nav.test.tsx`, update the `renders navigation links` test to check for Resources instead of Articles:

```tsx
it('renders navigation links', () => {
  render(<Nav />)
  expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects')
  expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog')
  expect(screen.getByRole('link', { name: /resources/i })).toHaveAttribute('href', '/resources')
  expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
})
```

- [ ] **Step 3: Run Nav tests to verify they pass**

Run: `npx jest __tests__/components/Nav.test.tsx --no-coverage`
Expected: PASS — 2 tests pass

- [ ] **Step 4: Commit**

```bash
git add components/Nav.tsx __tests__/components/Nav.test.tsx
git commit -m "feat: replace Articles link with Resources in Nav"
```

---

### Task 11: Cleanup old articles files

**Files:**
- Delete: `app/articles/page.tsx`
- Delete: `app/articles/` directory
- Delete: `lib/articles.ts`

- [ ] **Step 1: Delete old files**

```bash
rm -rf app/articles
rm lib/articles.ts
```

- [ ] **Step 2: Run full test suite to confirm nothing broke**

Run: `npx jest --no-coverage`
Expected: all tests pass

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old /articles page and lib/articles.ts"
```
