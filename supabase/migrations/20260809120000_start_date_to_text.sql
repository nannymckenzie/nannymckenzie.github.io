-- The form's start-date field changed from a date picker to free text
-- ("Mid September"), so the column can no longer be a strict date.
alter table public.leads
  alter column start_date type text
  using start_date::text;
