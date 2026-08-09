/**
 * Family Inquiries CRM — Google Apps Script.
 * Lives in a Google Sheet on antonio.ochoa2804@gmail.com, shared with McKenzie.
 *
 * One-time setup (about 5 minutes, see CRM-SETUP.md in the repo root):
 *   1. sheets.new while signed in as antonio.ochoa2804 → name it
 *      "McKenzie — Family Inquiries" (the sheet name doesn't matter to the code).
 *   2. Extensions > Apps Script, delete the stub, paste this whole file, save.
 *   3. Run the `setup` function once (authorize when asked). This formats the
 *      CRM tab: headers, frozen row, Status dropdown with colors, row
 *      highlighting for new entries, filters.
 *   4. Deploy > New deployment > Web app. Execute as: Me. Who has access:
 *      Anyone. Copy the web app URL.
 *   5. Hand the URL to Claude (or run:
 *      supabase secrets set SHEETS_WEBHOOK_URL='<url>' --project-ref oxamipkpkkyhfjrmvbgs)
 *   6. Share the spreadsheet with mckenzieochoaconner@gmail.com as Editor.
 *
 * Every form submission then appears as a row with Status "New" (highlighted
 * sage until she changes the status). Statuses, follow-up notes, and last
 * contact are hers to edit; incoming rows never touch her edits.
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

// Column order. "Received" through "Source" are filled by the webhook;
// "Status" starts as New; the last three belong to McKenzie.
const HEADERS = [
  'Received', 'Status', 'Parent', 'Phone', 'Email', 'Prefers', 'Town',
  'Neighborhood', 'Children', 'Start date', 'Schedule', 'Message',
  'Follow-up notes', 'Last contact', 'Source',
]

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
  const lead = payload.lead || {}

  const lock = LockService.getScriptLock()
  lock.tryLock(10000)
  try {
    const sheet = getSheet_()
    sheet.appendRow([
      Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'),
      'New',
      String(lead.parent_name || ''),
      String(lead.phone || ''),
      String(lead.email || ''),
      String(lead.contact_method || ''),
      String(lead.town || ''),
      String(lead.neighborhood || ''),
      String(lead.children_ages || ''),
      String(lead.start_date || ''),
      String(lead.schedule || ''),
      String(lead.message || ''),
      '', // Follow-up notes
      '', // Last contact
      String(lead.source || 'website'),
    ])
  } finally {
    lock.releaseLock()
  }
  return out({ ok: true })
}

/** Run once by hand after pasting the script. Safe to re-run. */
function setup() {
  const sheet = getSheet_()
  const ss = sheet.getParent()
  ss.setSpreadsheetTimeZone(TZ)

  // Header row
  const header = sheet.getRange(1, 1, 1, HEADERS.length)
  header.setValues([HEADERS])
  header.setBackground('#3f4437').setFontColor('#fffdf9').setFontWeight('bold').setFontSize(10)
  sheet.setFrozenRows(1)

  // Column widths tuned for scanning: identity tight, free text wide.
  const widths = [130, 110, 140, 120, 200, 90, 100, 120, 160, 90, 170, 320, 320, 100, 80]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))

  const body = sheet.getRange(2, 1, sheet.getMaxRows() - 1, HEADERS.length)
  body.setVerticalAlignment('top')
  // Wrap the long-text columns (Children, Schedule, Message, Follow-up notes)
  ;[9, 11, 12, 13].forEach((c) =>
    sheet.getRange(2, c, sheet.getMaxRows() - 1, 1).setWrap(true))

  // Status dropdown
  const statusCol = sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1)
  statusCol.setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build())

  // Conditional formatting:
  //  - whole row sage while Status is "New" (this is the "needs review" signal)
  //  - status cell tinted by stage
  const rules = []
  const rowRange = sheet.getRange(2, 1, sheet.getMaxRows() - 1, HEADERS.length)
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
      .setRanges([statusCol]).build())
  }
  sheet.setConditionalFormatRules(rules)

  // Filter over everything so she can sort/filter by status or town.
  if (sheet.getFilter()) sheet.getFilter().remove()
  sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).createFilter()

  // Keep the tab tidy: no stray columns to the right.
  const extra = sheet.getMaxColumns() - HEADERS.length
  if (extra > 0) sheet.deleteColumns(HEADERS.length + 1, extra)
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
