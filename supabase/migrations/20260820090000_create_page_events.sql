-- Visit + scroll analytics events sent by the public site (see src/track.ts
-- and the track edge function). RLS enabled with zero policies: only the
-- service role can read or write, same model as leads.
create table public.page_events (
  id bigint generated always as identity primary key,
  session_id text not null,
  source text not null default 'website',
  event text not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.page_events enable row level security;

create index page_events_created_at_idx on public.page_events (created_at desc);

-- Daily rollup for the token-gated stats page served by the track function.
-- Not security definer: RLS still applies, so anon callers get zero rows even
-- before the explicit revoke below.
create or replace function public.page_event_stats(days int default 60)
returns table (day date, source text, event text, hits bigint, sessions bigint)
language sql
stable
as $$
  select
    (created_at at time zone 'America/Los_Angeles')::date as day,
    page_events.source,
    page_events.event,
    count(*) as hits,
    count(distinct session_id) as sessions
  from public.page_events
  where created_at >= now() - make_interval(days => days)
  group by 1, 2, 3
  order by 1 desc, 2, 3
$$;

revoke execute on function public.page_event_stats(int) from public, anon, authenticated;
grant execute on function public.page_event_stats(int) to service_role;

-- Whole-window rollup (distinct sessions per source/event) so the stats page
-- can report unique visitors and the scroll funnel without double counting a
-- session that shows up on two different days.
create or replace function public.page_event_summary(days int default 30)
returns table (source text, event text, sessions bigint)
language sql
stable
as $$
  select page_events.source, page_events.event, count(distinct session_id)
  from public.page_events
  where created_at >= now() - make_interval(days => days)
  group by 1, 2
$$;

revoke execute on function public.page_event_summary(int) from public, anon, authenticated;
grant execute on function public.page_event_summary(int) to service_role;
