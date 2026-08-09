/**
 * Family Inquiries CRM — Google Apps Script (v2).
 * Lives in the "McKenzie — Family Inquiries" Google Sheet on
 * antonio.ochoa2804@gmail.com, shared with McKenzie as Editor.
 * Setup and day-to-day guide: CRM-SETUP.md in the repo root.
 *
 * v2: decision columns (Rating, Rate $/hr, Pros / cons, Next action with
 * overdue highlighting), and doPost now maps fields to columns BY HEADER NAME,
 * so reordering or inserting columns in the sheet never breaks ingestion.
 * Remote setup: POSTing {token, action: "setup"} runs setup() — no need to run
 * it from the editor.
 *
 * Updating this script later: paste the new code, save, then
 * Deploy > Manage deployments > edit (pencil) > Version: New version >
 * Deploy. The URL stays the same.
 */

// Must match the CRM_TOKEN secret set on the Supabase edge function.
const TOKEN = '58e110f3bb59efe9e0769a6285a12d26'

const SHEET_NAME = 'Inquiries'
const TZ = 'America/Los_Angeles'

const STATUSES = [
  'New',
  'Replied',
  'Call scheduled',
  'Met',
  'Trial planned',
  'Matched',
  'Not a fit',
  'No response',
]

const RATINGS = ['★★★★★', '★★★★', '★★★', '★★', '★']

// Column layout. Webhook fills the lead columns; the rest belong to
// McKenzie and José. doPost finds columns by these header names, so you can
// reorder or add columns in the sheet freely — just keep the names.
const HEADERS = [
  'Received', 'Status', 'Rating', 'Rate ($/hr)', 'Parent', 'Phone', 'Email',
  'Prefers', 'Town', 'Neighborhood', 'Children', 'Start date', 'Schedule',
  'Message', 'Pros / cons', 'Follow-up notes', 'Last contact', 'Next action',
  'Source',
]

// lead JSON field → header name
const FIELD_TO_HEADER = {
  parent_name: 'Parent',
  phone: 'Phone',
  email: 'Email',
  contact_method: 'Prefers',
  town: 'Town',
  neighborhood: 'Neighborhood',
  children_ages: 'Children',
  start_date: 'Start date',
  schedule: 'Schedule',
  message: 'Message',
  source: 'Source',
}

function doPost(e) {
  const out = (obj) =>
    ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
  let payload
  try {
    payload = JSON.parse(e.postData.contents)
  } catch (err) {
    return out({ ok: false, error: 'bad json' })
  }
  if (!payload || payload.token !== TOKEN) return out({ ok: false, error: 'forbidden' })

  if (payload.action === 'setup') {
    setup()
    return out({ ok: true, action: 'setup' })
  }

  const lead = payload.lead || {}
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)
  try {
    const sheet = getSheet_()
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    const col = {}
    headers.forEach((h, i) => { col[String(h).trim()] = i })

    const row = new Array(headers.length).fill('')
    if ('Received' in col) row[col['Received']] = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm')
    if ('Status' in col) row[col['Status']] = 'New'
    for (const [field, header] of Object.entries(FIELD_TO_HEADER)) {
      if (header in col) row[col[header]] = String(lead[field] || '')
    }
    sheet.appendRow(row)
  } finally {
    lock.releaseLock()
  }
  return out({ ok: true })
}

/** Formats the sheet. Safe to re-run; never deletes data rows. */
function setup() {
  const sheet = getSheet_()
  const ss = sheet.getParent()
  ss.setSpreadsheetTimeZone(TZ)

  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns())
  }

  const header = sheet.getRange(1, 1, 1, HEADERS.length)
  header.setValues([HEADERS])
  header.setBackground('#3f4437').setFontColor('#fffdf9').setFontWeight('bold').setFontSize(10)
  sheet.setFrozenRows(1)

  // Widths tuned for scanning: management columns tight, free text wide.
  const widths = [130, 110, 90, 90, 140, 120, 200, 90, 100, 110, 150, 90, 160, 300, 260, 260, 100, 100, 80]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))

  const H = {}
  HEADERS.forEach((h, i) => { H[h] = i + 1 })
  const nRows = sheet.getMaxRows() - 1
  const colRange = (name) => sheet.getRange(2, H[name], nRows, 1)

  sheet.getRange(2, 1, nRows, HEADERS.length).setVerticalAlignment('top')
  ;['Children', 'Schedule', 'Message', 'Pros / cons', 'Follow-up notes'].forEach((name) =>
    colRange(name).setWrap(true))

  // Dropdowns
  colRange('Status').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build())
  colRange('Rating').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(RATINGS, true).setAllowInvalid(false).build())
  colRange('Rating').setHorizontalAlignment('center').setFontColor('#896447')

  // Formats: money and dates
  colRange('Rate ($/hr)').setNumberFormat('$#,##0.00')
  colRange('Next action').setNumberFormat('yyyy-mm-dd')
  colRange('Last contact').setNumberFormat('yyyy-mm-dd')

  // Conditional formatting:
  //  - whole row sage + bold while Status is "New" (the "needs review" signal)
  //  - status cell tinted by stage
  //  - top ratings tinted green so front-runners pop
  //  - overdue "Next action" dates tinted warm red
  const rules = []
  const rowRange = sheet.getRange(2, 1, nRows, HEADERS.length)
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$B2="New"')
    .setBackground('#e0e2cb').setBold(true)
    .setRanges([rowRange]).build())
  const statusColors = {
    'Replied': '#f4e7d6',
    'Call scheduled': '#eef0e2',
    'Met': '#d9e0c9',
    'Trial planned': '#cfd8b8',
    'Matched': '#b6b791',
    'Not a fit': '#e8e0d8',
    'No response': '#e8e0d8',
  }
  for (const [status, color] of Object.entries(statusColors)) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status).setBackground(color)
      .setRanges([colRange('Status')]).build())
  }
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('★★★★★').setBackground('#cfd8b8')
    .setRanges([colRange('Rating')]).build())
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('★★★★').setBackground('#e0e2cb')
    .setRanges([colRange('Rating')]).build())
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${colLetter_(H['Next action'])}2<>"", $${colLetter_(H['Next action'])}2<TODAY(), $B2<>"Matched", $B2<>"Not a fit", $B2<>"No response")`)
    .setBackground('#f0d9cf')
    .setRanges([colRange('Next action')]).build())
  sheet.setConditionalFormatRules(rules)

  // Filter over everything so you can sort by status, rating, or town.
  if (sheet.getFilter()) sheet.getFilter().remove()
  sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).createFilter()

  const extra = sheet.getMaxColumns() - HEADERS.length
  if (extra > 0) sheet.deleteColumns(HEADERS.length + 1, extra)
}

function colLetter_(n) {
  let s = ''
  while (n > 0) {
    const m = (n - 1) % 26
    s = String.fromCharCode(65 + m) + s
    n = (n - m - 1) / 26
  }
  return s
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.getSheets()[0]
    sheet.setName(SHEET_NAME)
  }
  return sheet
}
