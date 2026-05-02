import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero-gradient flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 font-mono text-sm text-accent">AI Engineer</p>
      <h1 className="mb-6 font-mono text-4xl font-bold leading-tight text-text-primary md:text-6xl">
        I build AI systems that
        <br />
        <span className="text-accent">work in the real world.</span>
      </h1>
      <p className="mb-10 max-w-xl text-lg text-text-secondary">
        Specializing in voice AI, agentic systems, and production ML pipelines.
      </p>
      <Link
        href="/contact"
        className="rounded-lg bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Book a call
      </Link>
    </section>
  )
}
