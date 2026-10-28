-- Monotonic LAV booking references: AV-LAV-000001, AV-LAV-000002, …

create sequence if not exists public.lav_booking_ref_seq
  start with 1
  increment by 1
  no maxvalue
  cache 1;

create or replace function public.next_lav_booking_ref()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n bigint;
begin
  select nextval('public.lav_booking_ref_seq') into n;
  return 'AV-LAV-' || lpad(n::text, 6, '0');
end;
$$;

revoke all on function public.next_lav_booking_ref() from public;
grant execute on function public.next_lav_booking_ref() to service_role;
