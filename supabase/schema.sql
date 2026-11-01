-- ============================================================
--  Supabase Schema — Branson Experience AI Agent System
--  Run this in the Supabase SQL Editor or via `supabase db push`
-- ============================================================

-- ── Enable RLS (enable in dashboard; policies below) ─────────────────────────

-- ─── Activities ──────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text not null check (category in ('themes', 'water', 'museums', 'shows', 'dining', 'outdoor')),
  status         text not null default 'active' check (status in ('active', 'draft', 'archived', 'removed')),
  score          numeric(5,2) default 50.00,
  last_reviewed  timestamptz,
  metadata       jsonb default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_activities_category on public.activities (category);
create index idx_activities_status   on public.activities (status);
create index idx_activities_score    on public.activities (score desc);

-- ─── Meetings ────────────────────────────────────────────────────────────────
create table if not exists public.meetings (
  id           uuid primary key default gen_random_uuid(),
  date         date not null default current_date,
  decisions    jsonb default '[]'::jsonb,
  summary      text,
  agent_notes  text,
  created_at   timestamptz not null default now()
);

create index idx_meetings_date on public.meetings (date desc);

-- ─── Decisions ───────────────────────────────────────────────────────────────
create table if not exists public.decisions (
  id           uuid primary key default gen_random_uuid(),
  meeting_id   uuid not null references public.meetings(id) on delete cascade,
  activity_id  uuid references public.activities(id) on delete set null,
  action       text not null check (action in ('add', 'remove', 'update', 'promote', 'demote', 'keep')),
  reason       text,
  timestamp    timestamptz not null default now()
);

create index idx_decisions_meeting  on public.decisions (meeting_id);
create index idx_decisions_activity on public.decisions (activity_id);

-- ─── Content Updates ─────────────────────────────────────────────────────────
create table if not exists public.content_updates (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid references public.activities(id) on delete set null,
  update_type  text not null check (update_type in ('score', 'status', 'metadata', 'name', 'seasonal_note')),
  old_value    jsonb,
  new_value    jsonb,
  timestamp    timestamptz not null default now()
);

create index idx_content_updates_activity on public.content_updates (activity_id);
create index idx_content_updates_time     on public.content_updates (timestamp desc);

-- ── RLS Policies (service-role key bypasses these) ───────────────────────────
alter table public.activities     enable row level security;
alter table public.meetings       enable row level security;
alter table public.decisions      enable row level security;
alter table public.content_updates enable row level security;

-- Allow the app/service role full access
create policy "Allow authenticated read-write on activities"
  on public.activities for all using (true) with check (true);

create policy "Allow authenticated read-write on meetings"
  on public.meetings for all using (true) with check (true);

create policy "Allow authenticated read-write on decisions"
  on public.decisions for all using (true) with check (true);

create policy "Allow authenticated read-write on content_updates"
  on public.content_updates for all using (true) with check (true);

-- ── Helpers ──────────────────────────────────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_activities_updated
  before update on public.activities
  for each row execute function public.update_updated_at();
