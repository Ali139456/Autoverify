-- Auto Verifi — follow-up migration
-- Run in Supabase Dashboard → SQL Editor after 001_initial_schema.sql

alter table public.reports drop constraint if exists reports_status_check;
alter table public.reports add constraint reports_status_check check (status in (
  'pending_payment',
  'paid',
  'history_ready',
  'awaiting_inspection',
  'processing_ravin',
  'complete',
  'failed'
));

insert into storage.buckets (id, name, public)
values ('inspection-photos', 'inspection-photos', false)
on conflict (id) do nothing;
