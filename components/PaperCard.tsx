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
