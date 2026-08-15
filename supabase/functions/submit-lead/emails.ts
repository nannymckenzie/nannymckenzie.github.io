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

// Family inquiries CRM sheet (owned by antonio.ochoa2804, shared with McKenzie).
const CRM_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1_E9nTL1lZSYuU0eQElIs5mlEcVF9nDnEZ-79B5obveY/edit'

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
      <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#3f4437;">McKenzie Conner</p>
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
      <p style="margin:8px 0 0;font-size:13px;color:#896447;">This inquiry is also in the <a href="${CRM_SHEET_URL}" style="color:#6f5038;font-weight:bold;">family inquiries sheet</a> as a new row.</p>
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
    `All inquiries: ${CRM_SHEET_URL}`,
  ]
  return lines.filter(Boolean).join('\n')
}

// --- Lead confirmation (sent to the family, gated by LEAD_CONFIRMATION_ENABLED) ---

// Returns null when the field holds multiple names ("Ana and Luis Pérez",
// "Ana & Luis", "Ana, Luis") so callers fall back to a neutral greeting
// instead of addressing only the first person.
function leadFirstName(lead: LeadFields): string | null {
  const name = lead.parent_name.trim()
  if (!name || /\band\b|&|,|\+|\by\b/i.test(name)) return null
  return name.split(/\s+/)[0]
}

// Every form question renders in the receipt, per José's request; answers the
// family left blank show an em dash instead of dropping the row.
function summaryRow(label: string, value: string): string {
  return `<tr>
  <td align="left" valign="top" style="padding:8px 14px 0 0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#896447;white-space:nowrap;">${label}</td>
  <td align="left" valign="top" style="padding:8px 0 0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#3f4437;">${value ? esc(value) : '&mdash;'}</td>
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
  const first = leadFirstName(lead)
  return first ? `Thank you for reaching out, ${first}!` : 'Thank you for reaching out!'
}

export function renderLeadConfirmation(lead: LeadFields): string {
  const fills: Record<string, string> = {
    '{{PARENT_FIRST_NAME}}': esc(leadFirstName(lead) ?? 'there'),
    '{{SUMMARY_ROWS}}': summaryPairs(lead).map(([l, v]) => summaryRow(l, v)).join(''),
  }
  // Single-pass replace so escaped user input is never rescanned for tokens.
  return LEAD_CONFIRMATION_HTML.replace(
    /\{\{(?:PARENT_FIRST_NAME|SUMMARY_ROWS)\}\}/g,
    (token) => fills[token],
  )
}

export function renderLeadConfirmationText(lead: LeadFields): string {
  const summary = summaryPairs(lead).map(([l, v]) => `${l}: ${v || '—'}`)
  const lines = [
    `Hi ${leadFirstName(lead) ?? 'there'},`,
    '',
    'Thank you so much for reaching out about care for your family! I\'m looking forward to reading and responding soon.',
    '',
    'What happens next',
    '- If it feels like we could be a good match, we\'ll set up a relaxed introductory call to get to know each other and talk through your family\'s needs.',
    '- From there, we can plan an in-person meeting with your child to see how our fit feels to everyone.',
    '- Lastly, we can schedule a play-date for your child and my baby.',
    '',
    'What you shared with me',
    ...summary,
    '',
    'Visit my site: https://nannymckenzie.github.io/',
    '',
    'Warmly,',
    'McKenzie',
    'WA State Teacher Certified · STARS Early Childhood Education Certified · CPR and First Aid Certified',
    '',
    'Bellingham, WA (York Neighborhood)',
    'You\'re receiving this note because you contacted me through nannymckenzie.github.io.',
  ]
  return lines.join('\n')
}
