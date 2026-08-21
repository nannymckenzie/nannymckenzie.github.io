// Privacy-light analytics: one visit event per page load plus scroll
// milestones, posted to the track edge function. No cookies; the session id
// lives in sessionStorage and dies with the tab. Bodies go as text/plain so
// the POST is a "simple" CORS request (no preflight), which is also what
// sendBeacon needs to fire during unload.

const TRACK_URL = 'https://oxamipkpkkyhfjrmvbgs.supabase.co/functions/v1/track'

export function wireTracking(): void {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return

  let session: string
  try {
    session = sessionStorage.getItem('mc-session') ?? crypto.randomUUID()
    sessionStorage.setItem('mc-session', session)
  } catch {
    session = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }

  // Same lowercasing rule as form.ts so the uppercase poster QR still tags.
  const source = new URLSearchParams(location.search.toLowerCase()).get('src') || 'website'

  const sent = new Set<string>()
  const send = (event: string): void => {
    if (sent.has(event)) return
    sent.add(event)
    const body = JSON.stringify({ session, source, event })
    const blob = new Blob([body], { type: 'text/plain;charset=UTF-8' })
    try {
      if (navigator.sendBeacon(TRACK_URL, blob)) return
    } catch {
      // fall through to fetch
    }
    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
      keepalive: true,
    }).catch(() => {})
  }

  send('visit')

  const milestones: Array<[number, string]> = [
    [0.25, 'scroll_25'],
    [0.5, 'scroll_50'],
    [0.75, 'scroll_75'],
  ]
  const onScroll = () => {
    const depth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight
    for (const [at, event] of milestones) if (depth >= at) send(event)
    if (milestones.every(([, event]) => sent.has(event))) window.removeEventListener('scroll', onScroll)
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  const inquiry = document.getElementById('inquiry')
  if (inquiry && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        send('form_seen')
        io.disconnect()
      }
    }, { threshold: 0.2 })
    io.observe(inquiry)
  }
}
