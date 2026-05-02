import ProjectCard from '@/components/ProjectCard'
import { projects } from '@/lib/projects'

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="mb-4 font-mono text-4xl font-bold text-text-primary">Projects</h1>
      <p className="mb-12 text-text-secondary">
        A selection of what I've shipped — real systems, real impact.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}
