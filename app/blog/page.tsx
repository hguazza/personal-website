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
