// submit-lead: receives landing-page form posts, stores them in the leads
// table (service role, RLS has no public policies) and emails the admin.
// Email failure never blocks the insert; a missing RESEND_API_KEY simply
// degrades to insert-only with a log line.
import {
  leadConfirmationSubject,
  renderAdminEmail,
  renderAdminEmailText,
  renderLeadConfirmation,
  renderLeadConfirmationText,
} from './emails.ts'

const ALLOWED_ORIGINS = [
  'https://nannymckenzie.github.io',
  'http://localhost:5173',
]

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'antonio.ochoa2804@gmail.com'
// Confirmation email to the lead. Off by default: Resend's free tier has no
// verified domain, so it can only deliver to the account owner's address.
// Flip to 'true' once a sending domain (or another provider) exists.
const LEAD_CONFIRMATION_ENABLED = (Deno.env.get('LEAD_CONFIRMATION_ENABLED') ?? '').toLowerCase() === 'true'

const TOWNS = [
  'Bellingham', 'Ferndale', 'Lynden', 'Blaine', 'Birch Bay', 'Everson',
  'Nooksack', 'Sumas', 'Deming', 'Custer', 'Maple Falls', 'Point Roberts', 'Other',
]
const CONTACT_METHODS = ['Phone call', 'Email', 'Text message']

const MIN_SUBMIT_MS = 3000
const RATE_LIMIT_PER_HOUR = 3

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

function clip(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max)
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function recentCountForIp(ipHash: string): Promise<number> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const url = `${SUPABASE_URL}/rest/v1/leads?select=id&ip_hash=eq.${ipHash}&created_at=gte.${since}`
  const res = await fetch(url, {
    method: 'HEAD',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: 'count=exact',
    },
  })
  const range = res.headers.get('content-range') ?? ''
  const total = Number(range.split('/')[1])
  return Number.isFinite(total) ? total : 0
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const url = new URL(req.url)

  // Keepalive path for the GitHub Actions cron.
  if (req.method === 'GET' && url.searchParams.get('ping') === '1') {
    return new Response('ok', { status: 200 })
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return json({ error: 'Forbidden' }, 403, origin)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400, origin)
  }

  // Spam checks: honeypot field and minimum time-to-submit. Both return a
  // silent 200 so bots get no signal that they were filtered.
  const honeypot = clip(body.website, 500)
  const elapsed = Number(body.elapsed_ms)
  if (honeypot !== '' || !Number.isFinite(elapsed) || elapsed < MIN_SUBMIT_MS) {
    console.log('spam-filtered', { honeypot: honeypot !== '', elapsed })
    return json({ ok: true }, 200, origin)
  }

  const lead = {
    parent_name: clip(body.parent_name, 200),
    email: clip(body.email, 320),
    phone: clip(body.phone, 50),
    contact_method: clip(body.contact_method, 50),
    town: clip(body.town, 50),
    neighborhood: clip(body.neighborhood, 200),
    children_ages: clip(body.children_ages, 500),
    start_date: clip(body.start_date, 10) || null,
    schedule: clip(body.schedule, 500),
    message: clip(body.message, 5000),
    source: clip(body.source, 50) || 'website',
    ip_hash: '',
  }

  if (!lead.parent_name || !lead.phone || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) {
    return json({ error: 'Please fill in your name, email, and phone number.' }, 400, origin)
  }
  if (lead.contact_method && !CONTACT_METHODS.includes(lead.contact_method)) lead.contact_method = ''
  if (lead.town && !TOWNS.includes(lead.town)) lead.town = 'Other'
  if (lead.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(lead.start_date)) lead.start_date = null

  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  lead.ip_hash = await sha256Hex(ip)

  try {
    if ((await recentCountForIp(lead.ip_hash)) >= RATE_LIMIT_PER_HOUR) {
      return json({ error: 'Too many submissions. Please try again in an hour.' }, 429, origin)
    }
  } catch (err) {
    console.error('rate-limit check failed, allowing submission', err)
  }

  const insert = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(lead),
  })
  if (!insert.ok) {
    console.error('insert failed', insert.status, await insert.text())
    return json({ error: 'Something went wrong saving your message.' }, 500, origin)
  }

  // Email notification: best effort only.
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set; skipping admin email (insert-only mode)')
  } else {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'McKenzie Ochoa Conner Website <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          reply_to: lead.email,
          subject: `New family inquiry from ${lead.parent_name}`,
          html: renderAdminEmail(lead),
          text: renderAdminEmailText(lead),
        }),
      })
      if (!res.ok) console.error('resend failed', res.status, await res.text())
    } catch (err) {
      console.error('resend errored', err)
    }

    // Confirmation to the family: same best-effort rules as the admin email.
    if (LEAD_CONFIRMATION_ENABLED) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'McKenzie Ochoa Conner <onboarding@resend.dev>',
            to: [lead.email],
            reply_to: ADMIN_EMAIL,
            subject: leadConfirmationSubject(lead),
            html: renderLeadConfirmation(lead),
            text: renderLeadConfirmationText(lead),
          }),
        })
        if (!res.ok) console.error('lead confirmation failed', res.status, await res.text())
      } catch (err) {
        console.error('lead confirmation errored', err)
      }
    }
  }

  return json({ ok: true }, 200, origin)
})
