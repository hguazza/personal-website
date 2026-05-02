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
    const script = document.createElement('script')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
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
    }

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [calLink])

  return <div id="cal-embed" className="w-full min-h-[600px]" />
}
