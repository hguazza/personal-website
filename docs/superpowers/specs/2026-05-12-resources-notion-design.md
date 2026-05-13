# Resources Notion Integration — Design Spec

**Date:** 2026-05-12  
**Status:** Approved

## Overview

Replace the static `lib/resources.ts` arrays with four Notion databases as the data source. The user adds resources directly in Notion; the `/resources` page fetches and displays them. Each resource category (Papers, Repos, Videos, Articles) has its own dedicated Notion database with a `Published` checkbox to control visibility.

## File Changes

| Action | Path | Purpose |
|--------|------|---------|
| Create | `lib/resources-notion.ts` | Four async fetch functions, one per category |
| Update | `app/resources/page.tsx` | Async server component, parallel fetches, revalidate |
| Delete | `lib/resources.ts` | Replaced by resources-notion.ts |
| Update | `.env.example` | Document four new env vars |

## Environment Variables

Four new vars, one per database. Existing `NOTION_API_KEY` is reused.

```
NOTION_PAPERS_DB_ID=
NOTION_REPOS_DB_ID=
NOTION_VIDEOS_DB_ID=
NOTION_ARTICLES_DB_ID=
```

If a var is missing at runtime, the corresponding fetch function returns `[]` — that tab shows the empty state instead of crashing.

## Notion Database Schemas

Each database must be created manually in Notion with these exact property names:

### Shared (all four databases)

| Property name | Notion type |
|---------------|-------------|
| Name | Title (default) |
| Description | Text |
| Solved | Text |
| URL | URL |
| Published | Checkbox |

### Papers (extras)

| Property name | Notion type |
|---------------|-------------|
| Authors | Text |
| Year | Number |

### Repos (extras)

| Property name | Notion type |
|---------------|-------------|
| Tags | Multi-select |

### Videos (extras)

| Property name | Notion type |
|---------------|-------------|
| Channel | Text |

### Articles (extras)

| Property name | Notion type |
|---------------|-------------|
| Source | Text |

Property names are case-sensitive and must match exactly — they are the coupling point between Notion and the fetch functions.

## lib/resources-notion.ts

Uses `@notionhq/client` (already installed). Creates a single Notion client from `NOTION_API_KEY`. Exports four async functions:

- `getPapers(): Promise<Paper[]>`
- `getRepos(): Promise<Repo[]>`
- `getVideos(): Promise<Video[]>`
- `getArticles(): Promise<Article[]>`

Each function:
1. Guards against missing env var — returns `[]` immediately if database ID is not set
2. Queries its database: `filter: { Published: true }`, `sort: created_time descending`
3. Maps Notion page properties to the existing TypeScript types from `@/types`

Return types are the same `Paper`, `Repo`, `Video`, `Article` interfaces already defined in `types/index.ts` — nothing downstream changes.

## app/resources/page.tsx

Becomes an async server component. Fetches all four categories in parallel:

```ts
export const revalidate = 3600

export default async function ResourcesPage() {
  const [papers, repos, videos, articles] = await Promise.all([
    getPapers(), getRepos(), getVideos(), getArticles(),
  ])
  // ... render as before
}
```

`ResourceTabs` receives the same props as today — no changes to the component or any card components.

## Error Handling

- Missing env var → return `[]` (empty tab, no crash)
- Notion API error → propagate the error (Next.js error boundary catches it)
- Empty database or all rows unpublished → return `[]` (empty state shown)

## Revalidation

`export const revalidate = 3600` — page rebuilds at most once per hour, same as the blog. To force immediate update after adding a Notion entry: `vercel --prod`.

## Cleanup

- Delete `lib/resources.ts`
- Update `__tests__/lib/resources.test.ts` — remove or replace with a mock-based test for the new fetch functions
