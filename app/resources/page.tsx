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
