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
