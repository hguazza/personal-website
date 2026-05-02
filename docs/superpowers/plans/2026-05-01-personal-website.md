# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Henrique Guazzelli's personal AI engineer portfolio — Home/About, Projects, Notion-powered Blog, and Cal.com booking page — deployed to Vercel.

**Architecture:** Next.js 14 App Router with Tailwind CSS. Home, Projects, and Contact are fully static. Blog uses ISR (revalidate: 3600) sourced from a Notion database. Projects are hardcoded as static data. Cal.com embedded inline on Contact page.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, `@notionhq/client`, `notion-to-md`, `react-markdown@8`, `remark-gfm@3`, `next/font` (Inter + JetBrains Mono), Cal.com embed, Vercel.

---

## File Map

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Root layout, fonts, Nav |
| `app/page.tsx` | Home page (Hero + About) |
| `app/projects/page.tsx` | Projects grid |
| `app/blog/page.tsx` | Blog index (ISR, Notion) |
| `app/blog/[slug]/page.tsx` | Individual blog post |
| `app/contact/page.tsx` | Contact page with Cal.com |
| `components/Nav.tsx` | Top navigation bar |
| `components/Hero.tsx` | Hero section |
| `components/About.tsx` | About section with stack badges |
| `components/ProjectCard.tsx` | Single project card |
| `components/PostCard.tsx` | Single blog post card |
| `components/CalEmbed.tsx` | Cal.com inline embed (client component) |
| `lib/notion.ts` | Notion API client, `getPosts`, `getPost` |
| `lib/projects.ts` | Hardcoded projects data |
| `types/index.ts` | Shared TypeScript types (`Post`, `Project`) |
| `jest.config.ts` | Jest config |
| `jest.setup.ts` | Jest setup with `@testing-library/jest-dom` |

---

### Task 1: Git + Project Initialization

**Files:**
- Create: all Next.js scaffold files
- Create: `jest.config.ts`, `jest.setup.ts`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/henriqueguazzelli/Dev/personal-website
git init
git add context.md docs/
git commit -m "chore: add design spec and context"
```

Expected: git repo initialized, first commit made.

- [ ] **Step 2: Bootstrap Next.js 14**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*" --yes
```

Expected: Next.js project scaffolded. Files created: `app/`, `components/` (empty), `public/`, `tailwind.config.ts`, `next.config.ts`, `tsconfig.json`, `package.json`.

- [ ] **Step 3: Install project dependencies**

```bash
npm install @notionhq/client notion-to-md react-markdown@8 remark-gfm@3
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

Expected: All packages installed. No peer dependency errors.

- [ ] **Step 4: Write `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

- [ ] **Step 5: Write `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to `package.json`**

In `package.json`, ensure scripts includes:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 7: Run tests to confirm setup**

```bash
npm test -- --passWithNoTests
```

Expected: `Test Suites: 0 passed` — no errors.

- [ ] **Step 8: Update `next.config.ts` for remote images**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.notion.so' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js 14 project with Tailwind and Jest"
```

---

### Task 2: Tailwind Theme & Global Styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Extend Tailwind config with custom theme**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#111111',
        border: '#1f1f1f',
        'text-primary': '#e8e8e8',
        'text-secondary': '#888888',
        accent: '#3b82f6',
        'accent-hover': '#2563eb',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Write global styles in `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-text-primary antialiased;
  }

  ::selection {
    @apply bg-accent text-white;
  }

  ::-webkit-scrollbar {
    @apply w-1.5;
  }

  ::-webkit-scrollbar-track {
    @apply bg-background;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-border rounded-full;
  }
}

@layer utilities {
  .hero-gradient {
    background: linear-gradient(135deg, #0a0a0a 0%, #0d1526 50%, #0a0a0a 100%);
    background-size: 200% 200%;
    animation: gradient-shift 10s ease infinite;
  }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: configure Tailwind theme with dark palette and gradient animation"
```

---

### Task 3: TypeScript Types & Projects Data

**Files:**
- Create: `types/index.ts`
- Create: `lib/projects.ts`
- Create: `__tests__/lib/projects.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/projects.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/lib/projects.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/projects'`

- [ ] **Step 3: Write `types/index.ts`**

```typescript
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
```

- [ ] **Step 4: Write `lib/projects.ts`**

```typescript
import { Project } from '@/types'

export const projects: Project[] = [
  {
    title: 'Fraud Detection Agent System',
    description:
      'Async multi-agent system that analyzed 5,000+ calls in 100 minutes, tracking operator behaviors and false deal claims. Detected R$5M+ in fraud and eliminated the need for manual analysis.',
    stack: ['Elasticsearch', 'Python', 'AsyncIO', 'Semaphore', 'FastAPI'],
    highlight: 'R$5M+ fraud detected',
  },
  {
    title: 'Voice Platform — Debt Collection',
    description:
      'End-to-end voice AI platform for call center debt collection. Covers audio preprocessing, Whisper fine-tuning, transcription post-processing, and a human evaluation loop for continuous improvement.',
    stack: ['Whisper', 'FastAPI', 'Apache Airflow', 'MongoDB', 'Docker'],
  },
  {
    title: 'Monitoring & Quality Agent',
    description:
      'AI agent that replaces human quality evaluation of calls with 90%+ accuracy. Includes a human feedback platform, dataset preparation pipeline, and fine-tuning loop.',
    stack: ['LangGraph', 'LangFuse', 'FastAPI', 'MongoDB', 'LangChain'],
    highlight: '90%+ accuracy',
  },
  {
    title: 'AI Voice Agent — Operator Training',
    description:
      'Simulates real client calls, scores operator performance in real time, and delivers structured feedback to accelerate training of new call center agents.',
    stack: ['LiveKit', 'Deepgram', 'ElevenLabs', 'LangChain', 'FastAPI'],
  },
  {
    title: 'ML Pipeline Optimization',
    description:
      'Migrated and optimized the full data pipeline from NiFi to Airflow, including audio preprocessing, Whisper fine-tuning stages, and transcription post-processing.',
    stack: ['Apache Airflow', 'NiFi', 'Whisper', 'Python', 'Docker'],
  },
  {
    title: 'AI Governance Framework',
    description:
      'Developed company-wide AI governance policy including PEAS framework mapping, model inventory tracking, and a defensive layered security model for AI systems.',
    stack: ['PEAS Framework', 'Policy Design', 'Risk Assessment'],
  },
]
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npm test -- __tests__/lib/projects.test.ts
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add types/index.ts lib/projects.ts __tests__/lib/projects.test.ts
git commit -m "feat: add shared types and static projects data"
```

---

### Task 4: Notion Client

**Files:**
- Create: `lib/notion.ts`
- Create: `__tests__/lib/notion.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/notion.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/lib/notion.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/notion'`

- [ ] **Step 3: Write `lib/notion.ts`**

```typescript
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { Post } from '@/types'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const n2m = new NotionToMarkdown({ notionClient: notion })

export async function getPosts(): Promise<Post[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ property: 'Date', direction: 'descending' }],
  })
  return response.results.map(pageToPost)
}

export async function getPost(
  slug: string
): Promise<{ post: Post; markdown: string } | null> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        { property: 'Slug', rich_text: { equals: slug } },
        { property: 'Published', checkbox: { equals: true } },
      ],
    },
  })
  if (!response.results[0]) return null
  const page = response.results[0]
  const mdBlocks = await n2m.pageToMarkdown(page.id)
  const { parent: markdown } = n2m.toMarkdownString(mdBlocks)
  return { post: pageToPost(page), markdown }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToPost(page: any): Post {
  const props = page.properties
  return {
    id: page.id,
    title: props.Title?.title[0]?.plain_text ?? '',
    slug: props.Slug?.rich_text[0]?.plain_text ?? '',
    date: props.Date?.date?.start ?? '',
    tags: props.Tags?.multi_select?.map((t: { name: string }) => t.name) ?? [],
    cover:
      page.cover?.external?.url ?? page.cover?.file?.url ?? null,
  }
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- __tests__/lib/notion.test.ts
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/notion.ts __tests__/lib/notion.test.ts
git commit -m "feat: add Notion client with getPosts and getPost"
```

---

### Task 5: Root Layout & Navigation

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/Nav.tsx`
- Create: `__tests__/components/Nav.test.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/components/Nav.test.tsx`:

```typescript
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
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/components/Nav.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/Nav'`

- [ ] **Step 3: Write `components/Nav.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

const links = [
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-lg font-bold text-text-primary hover:text-accent transition-colors">
          hmg
        </Link>

        {/* Desktop links */}
        <ul className="hidden gap-8 md:flex">
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-text-primary transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-text-primary transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-text-primary transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul className="flex flex-col border-t border-border px-6 py-4 md:hidden">
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block py-2 text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
```

- [ ] **Step 4: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import Nav from '@/components/Nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Henrique Guazzelli — AI Engineer',
  description: 'AI Engineer specializing in voice AI, agentic systems, and production ML pipelines.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-background font-sans">
        <Nav />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npm test -- __tests__/components/Nav.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/Nav.tsx __tests__/components/Nav.test.tsx
git commit -m "feat: add root layout with fonts and navigation component"
```

---

### Task 6: Home Page (Hero + About)

**Files:**
- Create: `components/Hero.tsx`
- Create: `components/About.tsx`
- Modify: `app/page.tsx`
- Create: `__tests__/components/Hero.test.tsx`
- Create: `__tests__/components/About.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/Hero.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import Hero from '@/components/Hero'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Hero', () => {
  it('renders the main headline', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders a Book a call link to /contact', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: /book a call/i })).toHaveAttribute('href', '/contact')
  })
})
```

Create `__tests__/components/About.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import About from '@/components/About'

describe('About', () => {
  it('renders the about heading', () => {
    render(<About />)
    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument()
  })

  it('renders stack badge tags', () => {
    render(<About />)
    expect(screen.getByText('LangGraph')).toBeInTheDocument()
    expect(screen.getByText('FastAPI')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- __tests__/components/Hero.test.tsx __tests__/components/About.test.tsx
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Write `components/Hero.tsx`**

```tsx
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero-gradient flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 font-mono text-sm text-accent">AI Engineer</p>
      <h1 className="mb-6 font-mono text-4xl font-bold leading-tight text-text-primary md:text-6xl">
        I build AI systems that
        <br />
        <span className="text-accent">work in the real world.</span>
      </h1>
      <p className="mb-10 max-w-xl text-lg text-text-secondary">
        Specializing in voice AI, agentic systems, and production ML pipelines.
      </p>
      <Link
        href="/contact"
        className="rounded-lg bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Book a call
      </Link>
    </section>
  )
}
```

- [ ] **Step 4: Write `components/About.tsx`**

```tsx
const stack = [
  'LangGraph', 'LangChain', 'LangFuse', 'FastAPI', 'Whisper',
  'LiveKit', 'Deepgram', 'ElevenLabs', 'Apache Airflow', 'Elasticsearch',
  'MongoDB', 'Docker', 'Python', 'TypeScript',
]

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="mb-8 font-mono text-3xl font-bold text-text-primary">About</h2>
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4 text-text-secondary leading-relaxed">
          <p>
            I'm Henrique — an AI Engineer focused on building systems that make a measurable difference.
            My work spans voice AI platforms, multi-agent orchestration, ML pipelines, and production fine-tuning.
          </p>
          <p>
            Background: B.S. in Big Data & Analytics, Post-grad in ML Engineering, and currently studying
            Agentic AI at Johns Hopkins University.
          </p>
          <p>
            I care about systems that work at scale, not just in demos.
          </p>
        </div>
        <div>
          <p className="mb-4 font-mono text-sm text-text-secondary">Stack & Tools</p>
          <div className="flex flex-wrap gap-2">
            {stack.map(tech => (
              <span
                key={tech}
                className="rounded-md border border-border bg-surface px-3 py-1 font-mono text-xs text-text-secondary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Update `app/page.tsx`**

```tsx
import Hero from '@/components/Hero'
import About from '@/components/About'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
    </>
  )
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm test -- __tests__/components/Hero.test.tsx __tests__/components/About.test.tsx
```

Expected: PASS — 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add components/Hero.tsx components/About.tsx app/page.tsx __tests__/components/Hero.test.tsx __tests__/components/About.test.tsx
git commit -m "feat: add home page with Hero and About sections"
```

---

### Task 7: Projects Page

**Files:**
- Create: `components/ProjectCard.tsx`
- Create: `app/projects/page.tsx`
- Create: `__tests__/components/ProjectCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/components/ProjectCard.test.tsx`:

```typescript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/components/ProjectCard.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/ProjectCard'`

- [ ] **Step 3: Write `components/ProjectCard.tsx`**

```tsx
import { Project } from '@/types'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-lg hover:shadow-accent/5">
      {project.highlight && (
        <span className="mb-3 inline-block self-start rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
          {project.highlight}
        </span>
      )}
      <h3 className="mb-2 font-mono text-lg font-semibold text-text-primary">
        {project.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-text-secondary">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.stack.map(tech => (
          <span
            key={tech}
            className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-text-secondary"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `app/projects/page.tsx`**

```tsx
import ProjectCard from '@/components/ProjectCard'
import { projects } from '@/lib/projects'

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="mb-4 font-mono text-4xl font-bold text-text-primary">Projects</h1>
      <p className="mb-12 text-text-secondary">
        A selection of what I've shipped — real systems, real impact.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npm test -- __tests__/components/ProjectCard.test.tsx
```

Expected: PASS — 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/ProjectCard.tsx app/projects/page.tsx __tests__/components/ProjectCard.test.tsx
git commit -m "feat: add projects page with ProjectCard component"
```

---

### Task 8: Blog Index

**Files:**
- Create: `components/PostCard.tsx`
- Create: `app/blog/page.tsx`
- Create: `__tests__/components/PostCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/components/PostCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import PostCard from '@/components/PostCard'
import { Post } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockPost: Post = {
  id: '1',
  title: 'Building a Voice AI System',
  slug: 'building-voice-ai',
  date: '2026-04-01',
  tags: ['Voice AI', 'LangGraph'],
  cover: null,
}

describe('PostCard', () => {
  it('renders post title', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('Building a Voice AI System')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(/apr(il)?\s*1,?\s*2026/i)).toBeInTheDocument()
  })

  it('links to the correct blog post URL', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/building-voice-ai')
  })

  it('renders tags', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('Voice AI')).toBeInTheDocument()
    expect(screen.getByText('LangGraph')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/components/PostCard.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/PostCard'`

- [ ] **Step 3: Write `components/PostCard.tsx`**

```tsx
import Link from 'next/link'
import { Post } from '@/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
        <time className="mb-2 block font-mono text-xs text-text-secondary">
          {formatDate(post.date)}
        </time>
        <h2 className="mb-3 font-mono text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  )
}
```

- [ ] **Step 4: Write `app/blog/page.tsx`**

```tsx
import PostCard from '@/components/PostCard'
import { getPosts } from '@/lib/notion'

export const revalidate = 3600

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="mb-4 font-mono text-4xl font-bold text-text-primary">Blog</h1>
      <p className="mb-12 text-text-secondary">
        Papers, articles, and thoughts on AI engineering.
      </p>
      {posts.length === 0 ? (
        <p className="text-text-secondary">Nothing published yet. Check back soon.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npm test -- __tests__/components/PostCard.test.tsx
```

Expected: PASS — 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/PostCard.tsx app/blog/page.tsx __tests__/components/PostCard.test.tsx
git commit -m "feat: add blog index page with PostCard component"
```

---

### Task 9: Blog Post Page

**Files:**
- Create: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Write `app/blog/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { getPosts, getPost } from '@/lib/notion'

export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const result = await getPost(params.slug)
  if (!result) notFound()

  const { post, markdown } = result

  return (
    <article className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/blog"
        className="mb-8 inline-block font-mono text-sm text-text-secondary hover:text-accent transition-colors"
      >
        ← Back to blog
      </Link>
      <header className="mb-8">
        <time className="mb-2 block font-mono text-xs text-text-secondary">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <h1 className="mb-4 font-mono text-3xl font-bold text-text-primary">
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="prose prose-invert max-w-none prose-headings:font-mono prose-a:text-accent">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Install Tailwind Typography plugin**

```bash
npm install @tailwindcss/typography
```

- [ ] **Step 3: Add typography plugin to `tailwind.config.ts`**

In `tailwind.config.ts`, update `plugins`:

```typescript
plugins: [require('@tailwindcss/typography')],
```

- [ ] **Step 4: Start dev server and verify the blog post page renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000/blog` — should show empty state or posts if Notion env vars are set.

- [ ] **Step 5: Commit**

```bash
git add app/blog/[slug]/page.tsx tailwind.config.ts package.json package-lock.json
git commit -m "feat: add blog post page with Notion content and Markdown rendering"
```

---

### Task 10: Contact Page & Cal.com Embed

**Files:**
- Create: `components/CalEmbed.tsx`
- Create: `app/contact/page.tsx`
- Create: `__tests__/components/CalEmbed.test.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/components/CalEmbed.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import CalEmbed from '@/components/CalEmbed'

describe('CalEmbed', () => {
  it('renders the cal embed container', () => {
    render(<CalEmbed calLink="henrique" />)
    expect(document.getElementById('cal-embed')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/components/CalEmbed.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/CalEmbed'`

- [ ] **Step 3: Write `components/CalEmbed.tsx`**

```tsx
'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cal: any
  }
}

export default function CalEmbed({ calLink }: { calLink: string }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      window.Cal('init', { origin: 'https://cal.com' })
      window.Cal('inline', {
        elementOrSelector: '#cal-embed',
        calLink,
        layout: 'month_view',
      })
      window.Cal('ui', {
        styles: { branding: { brandColor: '#3b82f6' } },
        hideEventTypeDetails: false,
      })
    }

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [calLink])

  return <div id="cal-embed" className="w-full min-h-[600px]" />
}
```

- [ ] **Step 4: Write `app/contact/page.tsx`**

```tsx
import CalEmbed from '@/components/CalEmbed'

export default function ContactPage() {
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK ?? 'henrique-guazzelli'

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-4 font-mono text-4xl font-bold text-text-primary">Let's talk</h1>
      <p className="mb-12 text-lg text-text-secondary">
        Have a project in mind or want to talk AI? Let's find 30 minutes.
      </p>
      <CalEmbed calLink={calLink} />
    </section>
  )
}
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npm test -- __tests__/components/CalEmbed.test.tsx
```

Expected: PASS — 1 test passes.

- [ ] **Step 6: Commit**

```bash
git add components/CalEmbed.tsx app/contact/page.tsx __tests__/components/CalEmbed.test.tsx
git commit -m "feat: add contact page with Cal.com embed"
```

---

### Task 11: External Services Setup & Vercel Deployment

**Files:**
- Create: `.env.local`
- Create: `.env.example`

#### Part A: Notion Setup (manual)

- [ ] **Step 1: Create Notion integration**
  1. Go to https://www.notion.so/my-integrations
  2. Click **New integration**
  3. Name it "Personal Website"
  4. Select your workspace
  5. Copy the **Internal Integration Token** — this is your `NOTION_API_KEY`

- [ ] **Step 2: Create Notion database**

  Create a new page in Notion and turn it into a **Database (full page)**. Add these properties:

  | Property | Type |
  |---|---|
  | Title | Title (default) |
  | Slug | Text |
  | Date | Date |
  | Tags | Multi-select |
  | Cover | Files & media |
  | Published | Checkbox |

- [ ] **Step 3: Share database with integration**
  1. Open the database page
  2. Click **...** menu → **Add connections**
  3. Search for "Personal Website" (your integration) and connect it
  4. Copy the database ID from the URL: `notion.so/<workspace>/<DATABASE_ID>?v=...`

#### Part B: Cal.com Setup (manual)

- [ ] **Step 4: Create Cal.com account**
  1. Go to https://cal.com and sign up for free
  2. Complete onboarding: connect Google Calendar, set availability
  3. Create a new **Event Type** — name it "30 Min Call"
  4. Your booking link will be: `cal.com/<your-username>/30-min-call`
  5. Your `NEXT_PUBLIC_CAL_LINK` value is: `<your-username>/30-min-call`

#### Part C: Environment Variables

- [ ] **Step 5: Create `.env.local`**

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CAL_LINK=your-username/30-min-call
```

- [ ] **Step 6: Create `.env.example`**

```bash
NOTION_API_KEY=
NOTION_DATABASE_ID=
NEXT_PUBLIC_CAL_LINK=
```

- [ ] **Step 7: Add `.env.local` to `.gitignore`**

Verify `.gitignore` contains `.env.local` (Next.js adds this automatically). Run:

```bash
grep ".env.local" .gitignore
```

Expected: `.env.local` is listed.

#### Part D: GitHub + Vercel

- [ ] **Step 8: Create GitHub repo and push**

```bash
git remote add origin https://github.com/<your-username>/personal-website.git
git branch -M main
git push -u origin main
```

- [ ] **Step 9: Deploy to Vercel**
  1. Go to https://vercel.com/new
  2. Import your GitHub repo
  3. Add environment variables (from `.env.local`) in the Vercel dashboard
  4. Click **Deploy**

Expected: Site live at `<project>.vercel.app`

- [ ] **Step 10: Connect your domain**
  1. In Vercel dashboard → **Settings → Domains**
  2. Add your domain
  3. Follow Vercel's DNS instructions (add CNAME or A record at your registrar)

- [ ] **Step 11: Commit env example and verify full test suite**

```bash
npm test
```

Expected: All tests pass.

```bash
git add .env.example
git commit -m "chore: add env example and complete deployment setup"
git push
```

---

## Run All Tests

```bash
npm test
```

Expected output:
```
Test Suites: 6 passed, 6 total
Tests:       18 passed, 18 total
```
