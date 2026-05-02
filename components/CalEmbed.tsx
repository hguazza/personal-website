'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cal: any
  }
}

export default function CalEmbed({ calLink }: { calLink: string }) {
  useEffect(() => {
    // Cal.com uses a queue pattern — set up window.Cal before the script loads
    // so calls are queued and replayed once the script initializes
    ;(function (C: typeof window, A: string, L: string) {
      const p = (a: typeof window.Cal, ar: IArguments) => a.q.push(ar)
      C.Cal = C.Cal || function (...args: unknown[]) {
        const cal = C.Cal
        if (!cal.loaded) {
          cal.ns = {}
          cal.q = cal.q || []
          const s = document.createElement('script')
          s.src = A
          s.async = true
          document.head.appendChild(s)
          cal.loaded = true
        }
        if (args[0] === L) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const api: any = (...a: unknown[]) => p(api, a as unknown as IArguments)
          api.q = api.q || []
          p(cal, args as unknown as IArguments)
          return
        }
        p(cal, args as unknown as IArguments)
      }
    })(window, 'https://app.cal.com/embed/embed.js', 'init')

    window.Cal('init', { origin: 'https://cal.com' })
    window.Cal('inline', {
      elementOrSelector: '#cal-embed',
      calLink,
      layout: 'month_view',
    })
    window.Cal('ui', {
      styles: { branding: { brandColor: '#3b82f6' } },
      hideEventTypeDetails: false,
    })
  }, [calLink])

  return <div id="cal-embed" className="w-full min-h-[600px]" />
}
