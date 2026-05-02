const stack = [
  'LangGraph', 'LangChain', 'LangFuse', 'FastAPI', 'Whisper',
  'LiveKit', 'Deepgram', 'ElevenLabs', 'Apache Airflow', 'Elasticsearch',
  'MongoDB', 'Docker', 'Python', 'TypeScript',
]

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="mb-8 font-mono text-3xl font-bold text-text-primary">About</h2>
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4 text-text-secondary leading-relaxed">
          <p>
            I'm Henrique — an AI Engineer focused on building systems that make a measurable difference.
            My work spans voice AI platforms, multi-agent orchestration, ML pipelines, and production fine-tuning.
          </p>
          <p>
            Background: B.S. in Big Data & Analytics, Post-grad in ML Engineering, and currently studying
            Agentic AI at Johns Hopkins University.
          </p>
          <p>
            I care about systems that work at scale, not just in demos.
          </p>
        </div>
        <div>
          <p className="mb-4 font-mono text-sm text-text-secondary">Stack & Tools</p>
          <div className="flex flex-wrap gap-2">
            {stack.map(tech => (
              <span
                key={tech}
                className="rounded-md border border-border bg-surface px-3 py-1 font-mono text-xs text-text-secondary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
