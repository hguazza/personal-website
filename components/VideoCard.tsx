import Image from 'next/image'
import { Video } from '@/types'

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export default function VideoCard({ video }: { video: Video }) {
  const videoId = extractYouTubeId(video.url)
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null

  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" className="group block">
      <article className="overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
        {thumbnail && (
          <div className="relative h-40 w-full">
            <Image
              src={thumbnail}
              alt={video.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <p className="mb-1 font-mono text-xs text-accent">{video.channel}</p>
          <h2 className="mb-2 font-mono text-base font-semibold text-text-primary group-hover:text-accent transition-colors">
            {video.title}
          </h2>
          <p className="mb-4 text-sm text-text-secondary leading-relaxed">
            {video.description}
          </p>
          <p className="text-xs text-text-secondary">
            <span className="font-mono text-accent">solved →</span>{' '}
            {video.solved}
          </p>
        </div>
      </article>
    </a>
  )
}
