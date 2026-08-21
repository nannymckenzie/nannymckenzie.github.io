// track: lightweight visit + scroll analytics for the landing page.
// POST (from src/track.ts, sent as text/plain to skip CORS preflight) records
// one event into page_events. GET ?token=STATS_TOKEN returns the rollup as
// JSON for the dashboard at /stats.html — it must be JSON, not HTML, because
// Supabase rewrites text/html responses to text/plain on *.supabase.co
// (anti-phishing), so HTML served from here shows up as raw source.
// Events are best effort: anything malformed gets a silent 2xx so the site
// never sees tracking errors.

const ALLOWED_ORIGINS = [
  'https://nannymckenzie.github.io',
  'http://localhost:5173',
]

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STATS_TOKEN = Deno.env.get('STATS_TOKEN') ?? ''

const EVENTS = ['visit', 'scroll_25', 'scroll_50', 'scroll_75', 'form_seen']

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
      return new Response('Not found', { status: 404, headers: corsHeaders(origin) })
    }
    try {
      const [summary, daily] = await Promise.all([
        rpc('page_event_summary', { days: 30 }),
        rpc('page_event_stats', { days: 30 }),
      ])
      return new Response(JSON.stringify({ summary, daily }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          ...corsHeaders(origin),
        },
      })
    } catch (err) {
      console.error('stats failed', err)
      return new Response(JSON.stringify({ error: 'stats unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders(origin) })
  }

  // Events come from the public page only. Silent 204 on anything off so the
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
  if (!session || !EVENTS.includes(event)) return ok

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
