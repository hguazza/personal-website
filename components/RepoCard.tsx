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
