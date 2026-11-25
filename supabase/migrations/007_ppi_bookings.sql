-- Pre-purchase inspection bookings (Stripe + operations dashboard)

create table if not exists public.ppi_bookings (
  booking_ref text primary key,
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment',
      'paid',
      'invoiced'
    )),
  payload jsonb not null,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ppi_bookings_status_idx on public.ppi_bookings(status);
create index if not exists ppi_bookings_created_at_idx on public.ppi_bookings(created_at desc);
create index if not exists ppi_bookings_stripe_session_idx on public.ppi_bookings(stripe_session_id);

drop trigger if exists ppi_bookings_set_updated_at on public.ppi_bookings;
create trigger ppi_bookings_set_updated_at
before update on public.ppi_bookings
for each row execute function public.set_updated_at();

alter table public.ppi_bookings enable row level security;