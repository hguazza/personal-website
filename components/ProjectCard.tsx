import { Project } from '@/types'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-lg hover:shadow-accent/5">
      {project.highlight && (
        <span className="mb-3 inline-block self-start rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
          {project.highlight}
        </span>
      )}
      <h3 className="mb-2 font-mono text-lg font-semibold text-text-primary">
        {project.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-text-secondary">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.stack.map(tech => (
          <span
            key={tech}
            className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-text-secondary"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}
