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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getPost(slug)
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
            timeZone: 'UTC',
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
