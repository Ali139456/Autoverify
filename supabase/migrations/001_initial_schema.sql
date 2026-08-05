-- Auto Verifi — initial schema
-- Run in Supabase Dashboard → SQL Editor

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.reports (
  id text primary key,
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment',
      'history_ready',
      'awaiting_inspection',
      'processing_ravin',
      'complete',
      'failed'
    )),
  rego text,
  state text,
  vin text,
  customer_phone text,
  customer_email text,
  history_data jsonb,
  damage_data jsonb,
  ravin_payload jsonb,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  report_id text not null references public.reports(id) on delete cascade,
  status text not null default 'pending'
    check (status in (
      'pending',
      'in_progress',
      'uploaded',
      'processing',
      'complete',
      'failed',
      'expired'
    )),
  access_token text not null unique,
  phone text,
  photos jsonb not null default '[]'::jsonb,
  ravin_inspection_id text,
  ravin_payload jsonb,
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ravin_webhook_events (
  id uuid primary key default gen_random_uuid(),
  report_id text references public.reports(id) on delete set null,
  inspection_id uuid references public.inspections(id) on delete set null,
  invitation_id text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
create index if not exists inspections_report_id_idx on public.inspections(report_id);
create index if not exists inspections_access_token_idx on public.inspections(access_token);
create index if not exists ravin_webhook_invitation_id_idx on public.ravin_webhook_events(invitation_id);

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

drop trigger if exists inspections_set_updated_at on public.inspections;
create trigger inspections_set_updated_at
before update on public.inspections
for each row execute function public.set_updated_at();

alter table public.reports enable row level security;
alter table public.inspections enable row level security;
alter table public.ravin_webhook_events enable row level security;

-- No public policies yet: the Next.js server uses the service role key.
