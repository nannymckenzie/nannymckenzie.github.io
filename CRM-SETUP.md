# Family Inquiries CRM — setup

Every form submission flows into a Google Sheet that McKenzie manages: new rows
arrive highlighted with Status "New", she works them through a status dropdown
(Replied → Call scheduled → Met → Trial planned → Matched / Not a fit / No
response) and keeps follow-up notes per family. The sheet lives on
antonio.ochoa2804@gmail.com and is shared with her as Editor.

The plumbing: `submit-lead` (Supabase edge function) POSTs each lead to an Apps
Script web app bound to the sheet, authenticated by a shared token. Best effort:
a webhook failure never blocks the form or the emails.

## One-time setup (~5 minutes, as antonio.ochoa2804)

1. Go to sheets.new, name the spreadsheet "McKenzie — Family Inquiries".
2. Extensions > Apps Script. Delete the stub code, paste the whole contents of
   `scripts/leads-crm-apps-script.gs`, save.
3. In the function dropdown pick `setup` and Run it once. Authorize when asked
   (it only touches this spreadsheet). The tab gets headers, colors, dropdowns.
4. Deploy > New deployment > gear icon > Web app.
   - Execute as: **Me**
   - Who has access: **Anyone** (the URL is unguessable and the script rejects
     posts without the token)
   - Deploy, then copy the Web app URL (ends in `/exec`).
5. Set the URL on the edge function:
   `supabase secrets set SHEETS_WEBHOOK_URL='<web app URL>' --project-ref oxamipkpkkyhfjrmvbgs`
   (CRM_TOKEN is already set; it must match `TOKEN` in the script.)
6. Share the spreadsheet with mckenzieochoaconner@gmail.com as Editor.

## Day-to-day (McKenzie)

- New inquiries appear at the bottom, whole row highlighted sage and bold while
  Status is "New" — that's the "needs a reply" signal. She also gets the
  🌿 heads-up email in her inbox for each one.
- Change Status via the dropdown as things progress; the highlight clears and
  the status cell takes the stage color.
- "Follow-up notes" and "Last contact" are free-form hers; incoming rows never
  touch existing ones.
- The filter row lets her sort/filter by status, town, or start date.

## Changing things later

- Statuses or colors: edit `STATUSES` / `statusColors` in the Apps Script and
  re-run `setup` (re-running is safe; it reformats, it doesn't delete data).
- Form fields: if the inquiry form changes, update the `HEADERS` list and the
  `appendRow` order in the script together with the edge function payload.
- Rotating the token: generate a new one, update `TOKEN` in the script AND
  `supabase secrets set CRM_TOKEN='<new>' ...`, then create a NEW deployment
  (Deploy > Manage deployments > edit > New version).
