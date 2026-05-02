import Link from 'next/link'
import { Post } from '@/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
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
