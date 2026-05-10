# Resources Page — Design Spec

**Date:** 2026-05-09  
**Status:** Approved

## Overview

Replace the recently created `/articles` page with a unified `/resources` page. This page serves as both a public-facing curated list and a personal organized resource hub, with four categories: Papers, GitHub Repos, YouTube Videos, and Articles.

## Navigation

- `Nav.tsx`: replace `{ label: 'Articles', href: '/articles' }` with `{ label: 'Resources', href: '/resources' }`
- Active tab is reflected in the URL via `?tab=papers` (default: `papers`)

## Tab Behaviour

- Implementation: **Option B** — client state + URL sync
- `ResourceTabs.tsx` is the only `'use client'` boundary
- On mount: reads `useSearchParams` to restore active tab from URL
- On tab click: `useState` updates immediately (instant switch), `router.replace` syncs `?tab=<category>` to the URL
- Back button restores previous tab correctly

## File Structure

```
app/resources/page.tsx           server component — imports all data arrays, passes as props
components/ResourceTabs.tsx      'use client' — tab bar + URL sync + renders active grid
components/PaperCard.tsx
components/RepoCard.tsx
components/VideoCard.tsx
components/ArticleCard.tsx       rewritten with new fields
lib/resources.ts                 four named exports: papers, repos, videos, articles
types/index.ts                   Paper, Repo, Video, Article interfaces
```

## Data Layer

`lib/resources.ts` — four named arrays, all start empty:

```ts
export const papers: Paper[] = []
export const repos: Repo[] = []
export const videos: Video[] = []
export const articles: Article[] = []
```

To add a resource: append an entry to the relevant array. No other files need changing.

## Type Definitions

```ts
interface Paper {
  title: string
  description: string
  solved: string
  url?: string
  authors?: string   // e.g. "Vaswani et al."
  year?: number
}

interface Repo {
  title: string
  description: string
  solved: string
  url: string        // required
  tags?: string[]    // e.g. ["Python", "LangChain"]
}

interface Video {
  title: string
  description: string
  solved: string
  url: string        // full YouTube URL — thumbnail auto-derived
  channel: string    // required
}

interface Article {
  title: string
  description: string
  solved: string
  url?: string
  source?: string    // e.g. "Anthropic Blog", "arXiv"
}
```

## UI Components

### ResourceTabs
- Four tabs: Papers | GitHub Repos | YouTube Videos | Articles
- Active tab: accent-coloured underline
- Inactive tabs: `text-text-secondary`, hover to `text-text-primary`

### PaperCard
- Metadata line: `year · authors` in monospace above title
- Title, description, `solved →` line
- Links out if `url` provided

### RepoCard
- Title, description, `solved →` line
- Tag pills at bottom (same style as `PostCard` tags)
- Links to GitHub (url always required)

### VideoCard
- Top image: YouTube thumbnail auto-derived from URL
  - Extract video ID from URL, fetch `https://img.youtube.com/vi/{id}/mqdefault.jpg`
- Channel name in monospace, title, description, `solved →`
- Links to YouTube

### ArticleCard
- Optional `source` in monospace above title
- Title, description, `solved →`
- Links out if `url` provided

### Shared card styles
`rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5`

### Grid layout
`grid gap-6 md:grid-cols-2` — consistent with blog and projects pages

## Cleanup

- Delete `app/articles/page.tsx` and `app/articles/` directory
- Delete `lib/articles.ts`
- Delete `components/ArticleCard.tsx` (rewritten from scratch)
- Remove old `Article` interface from `types/index.ts`
