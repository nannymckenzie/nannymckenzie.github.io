// Admin notification email templates. A readable copy of the HTML lives at
// emails/admin-notification.html in the repo root.
// Lead confirmation templates live at the bottom; their HTML shell is generated
// from emails/lead-confirmation.mjml by `npm run email` (see scripts/build-email.mjs).

import { LEAD_CONFIRMATION_HTML } from './lead-confirmation-html.ts'

export interface LeadFields {
  parent_name: string
  email: string
  phone: string
  contact_method: string
  town: string
  neighborhood: string
  children_ages: string
  start_date: string | null
  schedule: string
  message: string
  source: string
}

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function row(label: string, value: string): string {
  if (!value) return ''
  return `<tr>
    <td style="padding:8px 16px 8px 0;color:#896447;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:#3f4437;font-size:15px;">${esc(value)}</td>
  </tr>`
}

export function renderAdminEmail(lead: LeadFields): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:24px;background:#f4ece4;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <div style="background:#b6b791;padding:20px 28px;">
      <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#3f4437;">McKenzie Ochoa Conner</p>
      <h1 style="margin:6px 0 0;font-size:22px;color:#3f4437;font-weight:600;">New family inquiry</h1>
    </div>
    <div style="padding:24px 28px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${row('Parent', lead.parent_name)}
        ${row('Email', lead.email)}
        ${row('Phone', lead.phone)}
        ${row('Prefers', lead.contact_method)}
        ${row('Town', lead.town)}
        ${row('Neighborhood', lead.neighborhood)}
        ${row('Children', lead.children_ages)}
        ${row('Start date', lead.start_date ?? '')}
        ${row('Schedule', lead.schedule)}
        ${row('Source', lead.source)}
      </table>
      ${lead.message ? `<div style="margin-top:16px;padding:16px;background:#f4ece4;border-radius:8px;">
        <p style="margin:0 0 6px;font-size:13px;color:#896447;">About their family</p>
        <p style="margin:0;font-size:15px;color:#3f4437;line-height:1.5;white-space:pre-wrap;">${esc(lead.message)}</p>
      </div>` : ''}
      <p style="margin:20px 0 0;font-size:13px;color:#896447;">Reply to this email to respond directly to ${esc(lead.parent_name)}.</p>
    </div>
  </div>
</body>
</html>`
}

export function renderAdminEmailText(lead: LeadFields): string {
  const lines = [
    'New family inquiry',
    '',
    `Parent: ${lead.parent_name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    lead.contact_method && `Prefers: ${lead.contact_method}`,
    lead.town && `Town: ${lead.town}`,
    lead.neighborhood && `Neighborhood: ${lead.neighborhood}`,
    lead.children_ages && `Children: ${lead.children_ages}`,
    lead.start_date && `Start date: ${lead.start_date}`,
    lead.schedule && `Schedule: ${lead.schedule}`,
    `Source: ${lead.source}`,
    lead.message && `\nAbout their family:\n${lead.message}`,
    '',
    'Reply to this email to respond directly to the family.',
  ]
  return lines.filter(Boolean).join('\n')
}

// --- Lead confirmation (sent to the family, gated by LEAD_CONFIRMATION_ENABLED) ---

function leadFirstName(lead: LeadFields): string {
  return lead.parent_name.trim().split(/\s+/)[0] || 'there'
}

// contact_method is validated against a whitelist in index.ts before this runs.
function contactPhrase(method: string): string {
  switch (method) {
    case 'Phone call': return 'with a phone call'
    case 'Email': return 'by email'
    case 'Text message': return 'by text'
    default: return 'using the contact details you shared'
  }
}

function summaryRow(label: string, value: string): string {
  if (!value) return ''
  return `<tr>
  <td align="left" valign="top" style="padding:8px 14px 0 0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#896447;white-space:nowrap;">${label}</td>
  <td align="left" valign="top" style="padding:8px 0 0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#3f4437;">${esc(value)}</td>
</tr>`
}

function summaryPairs(lead: LeadFields): Array<[string, string]> {
  return [
    ['Name', lead.parent_name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Prefers', lead.contact_method],
    ['Town', lead.town],
    ['Neighborhood', lead.neighborhood],
    ['Children', lead.children_ages],
    ['Start date', lead.start_date ?? ''],
    ['Schedule', lead.schedule],
    ['Message', lead.message],
  ]
}

export function leadConfirmationSubject(lead: LeadFields): string {
  return `Thank you for reaching out, ${leadFirstName(lead)}!`
}

export function renderLeadConfirmation(lead: LeadFields): string {
  const fills: Record<string, string> = {
    '{{PARENT_FIRST_NAME}}': esc(leadFirstName(lead)),
    '{{CONTACT_METHOD_PHRASE}}': contactPhrase(lead.contact_method),
    '{{SUMMARY_ROWS}}': summaryPairs(lead).map(([l, v]) => summaryRow(l, v)).join(''),
  }
  // Single-pass replace so escaped user input is never rescanned for tokens.
  return LEAD_CONFIRMATION_HTML.replace(
    /\{\{(?:PARENT_FIRST_NAME|CONTACT_METHOD_PHRASE|SUMMARY_ROWS)\}\}/g,
    (token) => fills[token],
  )
}

export function renderLeadConfirmationText(lead: LeadFields): string {
  const summary = summaryPairs(lead)
    .filter(([, v]) => v)
    .map(([l, v]) => `${l}: ${v}`)
  const lines = [
    `Hi ${leadFirstName(lead)},`,
    '',
    'Thank you so much for reaching out about care for your family. Your note made it to me safely, and I\'m really glad you did. I read every message personally, and I\'ll be back in touch ' + contactPhrase(lead.contact_method) + ' within a day or two.',
    '',
    'What happens next',
    '1. I\'ll reply within a day or two, usually sooner.',
    '2. If it feels like we could be a good match, we\'ll set up a relaxed introductory call to get to know each other and talk through your family\'s days.',
    '3. From there, we can plan a time for your children and me to meet, so everyone can see how it feels before anything is decided.',
    '',
    'What you shared with me',
    ...summary,
    '',
    'Visit my site: https://nannymckenzie.github.io/',
    '',
    'Warmly,',
    'McKenzie Ochoa Conner',
    'WA State Teacher Certified · CPR and First Aid Certified',
    '',
    'Bellingham, WA (York Neighborhood)',
    'You\'re receiving this note because you contacted me through nannymckenzie.github.io.',
  ]
  return lines.join('\n')
}
