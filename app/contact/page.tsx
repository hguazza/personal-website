import CalEmbed from '@/components/CalEmbed'

export default function ContactPage() {
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK ?? 'henrique-guazzelli'

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-4 font-mono text-4xl font-bold text-text-primary">Let's talk</h1>
      <p className="mb-12 text-lg text-text-secondary">
        Have a project in mind or want to talk AI? Let's find 30 minutes.
      </p>
      <CalEmbed calLink={calLink} />
    </section>
  )
}
