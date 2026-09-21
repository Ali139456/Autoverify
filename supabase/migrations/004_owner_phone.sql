alter table public.reports
  add column if not exists owner_phone text;
