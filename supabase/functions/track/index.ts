// track: lightweight visit + scroll analytics for the landing page.
// POST (from src/track.ts, sent as text/plain to skip CORS preflight) records
// one event into page_events. GET ?token=STATS_TOKEN serves a small HTML
// dashboard for McKenzie. Events are best effort: anything malformed gets a
// silent 200 so the site never sees tracking errors.

const ALLOWED_ORIGINS = [
  'https://nannymckenzie.github.io',
  'http://localhost:5173',
]

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STATS_TOKEN = Deno.env.get('STATS_TOKEN') ?? ''

const EVENTS = ['visit', 'scroll_25', 'scroll_50', 'scroll_75', 'form_seen'] as const
const EVENT_LABELS: Record<string, string> = {
  visit: 'Opened the page',
  scroll_25: 'Scrolled a bit (25%)',
  scroll_50: 'Scrolled halfway',
  scroll_75: 'Scrolled most of it (75%)',
  form_seen: 'Reached the contact form',
}
const SOURCE_LABELS: Record<string, string> = {
  poster: 'Poster QR scan',
  website: 'Direct / other',
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

function clip(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max)
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function rpc(name: string, args: Record<string, unknown>): Promise<unknown[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`${name} failed: ${res.status} ${await res.text()}`)
  return await res.json()
}

type SummaryRow = { source: string; event: string; sessions: number }
type DailyRow = { day: string; source: string; event: string; hits: number; sessions: number }

function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? `Poster QR (${source})`
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
}

function renderStats(summary: SummaryRow[], daily: DailyRow[]): string {
  const sources = [...new Set(summary.map((r) => r.source))].sort()
  const get = (source: string, event: string) =>
    summary.find((r) => r.source === source && r.event === event)?.sessions ?? 0
  const totalVisitors = sources.reduce((n, s) => n + get(s, 'visit'), 0)

  const cards = sources.map((s) => `
    <div class="card">
      <div class="num">${get(s, 'visit')}</div>
      <div class="lbl">${esc(sourceLabel(s))}</div>
    </div>`).join('')

  const funnel = EVENTS.map((event) => {
    const n = sources.reduce((sum, s) => sum + get(s, event), 0)
    const pct = totalVisitors ? Math.round((n / totalVisitors) * 100) : 0
    return `
    <div class="frow">
      <span class="flbl">${esc(EVENT_LABELS[event])}</span>
      <span class="fbar"><span style="width:${pct}%"></span></span>
      <span class="fnum">${n} <small>(${pct}%)</small></span>
    </div>`
  }).join('')

  // Daily unique visitors per source, newest first.
  const visitRows = daily.filter((r) => r.event === 'visit')
  const days = [...new Set(visitRows.map((r) => r.day))].sort().reverse()
  const dayRows = days.map((day) => {
    const cells = sources.map((s) =>
      `<td>${visitRows.find((r) => r.day === day && r.source === s)?.sessions ?? 0}</td>`).join('')
    const total = sources.reduce((n, s) =>
      n + (visitRows.find((r) => r.day === day && r.source === s)?.sessions ?? 0), 0)
    return `<tr><td>${esc(day)}</td>${cells}<td><strong>${total}</strong></td></tr>`
  }).join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Site traffic</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 24px 16px 48px; background: #f4ece4; color: #3f4437;
         font: 17px/1.5 'Nunito Sans', 'Segoe UI', sans-serif; }
  main { max-width: 640px; margin: 0 auto; }
  h1 { font-family: Georgia, serif; font-size: 1.7rem; margin: 0 0 4px; }
  .sub { color: #5c6050; margin: 0 0 20px; font-size: 0.95rem; }
  h2 { font-family: Georgia, serif; font-size: 1.15rem; margin: 28px 0 10px; }
  .cards { display: flex; gap: 12px; flex-wrap: wrap; }
  .card { background: #fffdf9; border: 1px solid rgba(63,68,55,0.14); border-radius: 14px;
          padding: 14px 18px; flex: 1 1 140px; }
  .num { font-size: 2rem; font-weight: 700; }
  .lbl { color: #5c6050; font-size: 0.9rem; }
  .frow { display: flex; align-items: center; gap: 10px; margin: 6px 0; }
  .flbl { flex: 0 0 220px; font-size: 0.92rem; }
  .fbar { flex: 1; height: 14px; background: #fffdf9; border: 1px solid rgba(63,68,55,0.14);
          border-radius: 7px; overflow: hidden; }
  .fbar span { display: block; height: 100%; background: #8c8f6b; }
  .fnum { flex: 0 0 84px; text-align: right; font-variant-numeric: tabular-nums; }
  small { color: #5c6050; }
  table { border-collapse: collapse; width: 100%; background: #fffdf9;
          border: 1px solid rgba(63,68,55,0.14); border-radius: 10px; overflow: hidden; }
  th, td { padding: 7px 12px; text-align: right; font-variant-numeric: tabular-nums; }
  th:first-child, td:first-child { text-align: left; }
  th { background: #e0e2cb; font-size: 0.85rem; }
  tr:nth-child(even) td { background: #faf5ef; }
  .note { color: #5c6050; font-size: 0.85rem; margin-top: 24px; }
  @media (max-width: 520px) { .flbl { flex-basis: 150px; } }
</style>
</head>
<body>
<main>
  <h1>Site traffic</h1>
  <p class="sub">nannymckenzie.github.io &middot; last 30 days &middot; counts are unique visitors</p>
  <div class="cards">
    <div class="card"><div class="num">${totalVisitors}</div><div class="lbl">Total visitors</div></div>
    ${cards}
  </div>
  <h2>How far people read</h2>
  ${funnel || '<p class="sub">No visits recorded yet.</p>'}
  <h2>Visitors per day</h2>
  <table>
    <tr><th>Day</th>${sources.map((s) => `<th>${esc(sourceLabel(s))}</th>`).join('')}<th>Total</th></tr>
    ${dayRows || `<tr><td colspan="${sources.length + 2}">No visits recorded yet.</td></tr>`}
  </table>
  <p class="note">"Poster QR scan" means the visitor arrived through the QR code
  (the QR opens the site with ?src=poster). Days follow Pacific time. Form
  submissions themselves are in the CRM sheet, tagged with the same source.</p>
</main>
</body>
</html>`
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const url = new URL(req.url)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (req.method === 'GET') {
    if (url.searchParams.get('ping') === '1') return new Response('ok', { status: 200 })
    const token = url.searchParams.get('token') ?? ''
    if (!STATS_TOKEN || token !== STATS_TOKEN) {
      return new Response('Not found', { status: 404 })
    }
    try {
      const [summary, daily] = await Promise.all([
        rpc('page_event_summary', { days: 30 }) as Promise<SummaryRow[]>,
        rpc('page_event_stats', { days: 30 }) as Promise<DailyRow[]>,
      ])
      return new Response(renderStats(summary, daily), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      })
    } catch (err) {
      console.error('stats failed', err)
      return new Response('Stats unavailable, try again in a minute.', { status: 500 })
    }
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders(origin) })
  }

  // Events come from the public page only. Silent 200 on anything off so the
  // browser console stays clean and probes learn nothing.
  const ok = new Response(null, { status: 204, headers: corsHeaders(origin) })
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return ok

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return ok
  }

  const event = clip(body.event, 30)
  const session = clip(body.session, 64)
  const source = clip(body.source, 50).toLowerCase() || 'website'
  if (!session || !(EVENTS as readonly string[]).includes(event)) return ok

  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const row = { session_id: session, source, event, ip_hash: await sha256Hex(ip) }

  const insert = await fetch(`${SUPABASE_URL}/rest/v1/page_events`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  })
  if (!insert.ok) console.error('event insert failed', insert.status, await insert.text())

  return ok
})
