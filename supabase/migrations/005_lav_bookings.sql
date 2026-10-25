-- Lender Asset Verification bookings (Stripe + multi-asset fulfillment)

create table if not exists public.lav_bookings (
  booking_ref text primary key,
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment',
      'paid',
      'invoiced',
      'fulfilled',
      'failed'
    )),
  payload jsonb not null,
  stripe_session_id text,
  asset_report_ids text[] not null default '{}',
  fulfillment jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lav_bookings_status_idx on public.lav_bookings(status);
create index if not exists lav_bookings_stripe_session_idx on public.lav_bookings(stripe_session_id);

drop trigger if exists lav_bookings_set_updated_at on public.lav_bookings;
create trigger lav_bookings_set_updated_at
before update on public.lav_bookings
for each row execute function public.set_updated_at();

alter table public.lav_bookings enable row level security;
