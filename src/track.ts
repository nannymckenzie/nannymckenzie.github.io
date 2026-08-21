// Privacy-light analytics: one visit event per page load plus scroll
// milestones, posted to the track edge function. No cookies; the session id
// lives in sessionStorage and dies with the tab. Bodies go as text/plain so
// the POST is a "simple" CORS request (no preflight), which is also what
// sendBeacon needs to fire during unload.

const TRACK_URL = 'https://oxamipkpkkyhfjrmvbgs.supabase.co/functions/v1/track'

export function wireTracking(): void {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return

  // Household opt-out: opening the site once with ?notrack (or opening
  // stats.html, which sets the same flag) marks this browser as ours forever
  // so family visits don't inflate the dashboard. IP blocking is deliberately
  // not used: the household is on T-Mobile's shared CGNAT range, so an IP
  // block would also drop real visitors on T-Mobile phones.
  try {
    if (new URLSearchParams(location.search).has('notrack')) {
      localStorage.setItem('mc-notrack', '1')
      // Visible receipt, so there is never doubt about whether the opt-out
      // took on this device (a cached old page once swallowed it silently).
      const note = document.createElement('div')
      note.textContent = '✓ This device will not be counted in site stats'
      note.style.cssText =
        'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);' +
        'background:#3f4437;color:#fffdf9;padding:10px 18px;border-radius:999px;' +
        'font:600 15px/1.3 sans-serif;z-index:999;max-width:90vw;text-align:center;' +
        'box-shadow:0 4px 14px rgba(0,0,0,0.25)'
      document.body.appendChild(note)
      setTimeout(() => note.remove(), 8000)
    }
    if (localStorage.getItem('mc-notrack')) return
  } catch {
    // storage unavailable: track normally
  }

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
