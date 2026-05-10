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
