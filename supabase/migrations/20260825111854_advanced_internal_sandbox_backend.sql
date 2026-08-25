-- Advanced internal payment sandbox. No real money or card data enters this system.
drop function public.confirm_payment(uuid, text, public.payment_method, bigint, text, jsonb);

create table private.payment_sandbox_settings (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default true,
  commission_bps integer not null default 1000 check (commission_bps between 0 and 10000),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into private.payment_sandbox_settings (singleton) values (true);
revoke all on private.payment_sandbox_settings from public, anon, authenticated, service_role;

alter table public.payments
  add column idempotency_key text,
  add column expires_at timestamptz,
  add column commission_bps integer,
  add column commission_rupiah bigint,
  add column venue_net_rupiah bigint,
  add column refunded_at timestamptz,
  add column failure_code text,
  add column failure_reason text,
  add column terminal_at timestamptz;

update public.payments p
set idempotency_key = 'legacy-' || p.id,
    expires_at = coalesce((select b.payment_expires_at from public.bookings b where b.id = p.booking_id), p.created_at + interval '10 minutes'),
    commission_bps = 0,
    commission_rupiah = 0,
    venue_net_rupiah = p.amount_rupiah,
    refunded_at = case when p.status = 'REFUNDED' then p.updated_at end,
    terminal_at = case when p.status in ('FAILED', 'EXPIRED', 'REFUNDED') then p.updated_at end;

alter table public.payments
  alter column idempotency_key set not null,
  alter column idempotency_key set default ('legacy-' || gen_random_uuid()),
  alter column expires_at set not null,
  alter column expires_at set default (now() + interval '10 minutes'),
  alter column commission_bps set not null,
  alter column commission_bps set default 0,
  alter column commission_rupiah set not null,
  alter column commission_rupiah set default 0,
  alter column venue_net_rupiah set not null,
  drop constraint payments_state_valid,
  add constraint payments_idempotency_valid check (char_length(idempotency_key) between 8 and 150),
  add constraint payments_commission_valid check (
    commission_bps between 0 and 10000 and commission_rupiah >= 0 and venue_net_rupiah >= 0
    and commission_rupiah + venue_net_rupiah = amount_rupiah
  ),
  add constraint payments_lifecycle_valid check (
    (status = 'PENDING' and paid_at is null and refunded_at is null and terminal_at is null)
    or (status = 'SETTLED' and paid_at is not null and refunded_at is null)
    or (status in ('FAILED', 'EXPIRED') and paid_at is null and refunded_at is null and terminal_at is not null)
    or (status = 'REFUNDED' and paid_at is not null and refunded_at is not null and terminal_at is not null)
  );

create unique index payments_booking_idempotency_key on public.payments (booking_id, idempotency_key);
create unique index payments_one_funded_booking on public.payments (booking_id) where status = 'SETTLED';
create index payments_expiry_idx on public.payments (expires_at, id) where status = 'PENDING';

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete restrict,
  booking_id uuid not null references public.bookings (id) on delete restrict,
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 150),
  event_type text not null check (event_type in (
    'CREATED', 'SETTLED', 'FAILED', 'EXPIRED', 'REFUNDED',
    'DISPUTE_OPENED', 'DISPUTE_WON', 'DISPUTE_LOST'
  )),
  from_status public.payment_status,
  to_status public.payment_status not null,
  actor_id uuid references auth.users (id) on delete set null,
  actor_role text not null check (actor_role in ('PLAYER', 'ADMIN', 'SYSTEM', 'MIGRATION')),
  reason text check (reason is null or char_length(btrim(reason)) between 3 and 500),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (payment_id, idempotency_key),
  check (jsonb_typeof(metadata) = 'object')
);

create index payment_events_booking_created_idx on public.payment_events (booking_id, created_at desc);

create table public.payment_disputes (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete restrict,
  booking_id uuid not null references public.bookings (id) on delete restrict,
  status text not null default 'OPEN' check (status in ('OPEN', 'WON', 'LOST')),
  reason text not null check (char_length(btrim(reason)) between 10 and 500),
  resolution text check (resolution is null or char_length(btrim(resolution)) between 3 and 500),
  opened_by uuid not null references public.profiles (id) on delete restrict,
  resolved_by uuid references public.profiles (id) on delete set null,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (payment_id),
  check ((status = 'OPEN' and resolved_by is null and resolved_at is null and resolution is null)
    or (status in ('WON', 'LOST') and resolved_by is not null and resolved_at is not null and resolution is not null))
);

create index payment_disputes_status_opened_idx on public.payment_disputes (status, opened_at desc);
create trigger payment_disputes_set_updated_at before update on public.payment_disputes
for each row execute function private.set_updated_at();

create function public.create_sandbox_payment(
  p_booking_id uuid,
  p_user_id uuid,
  p_method public.payment_method,
  p_idempotency_key text
)
returns table (
  payment_id uuid, payment_status public.payment_status, amount_rupiah bigint,
  expires_at timestamptz, commission_rupiah bigint, venue_net_rupiah bigint,
  virtual_account text, qr_payload text
)
language plpgsql security definer set search_path = '' as $$
declare
  target public.bookings%rowtype;
  existing public.payments%rowtype;
  created public.payments%rowtype;
  settings private.payment_sandbox_settings%rowtype;
  fee bigint;
  va text;
  qr text;
begin
  perform private.assert_server_role();
  if char_length(p_idempotency_key) not between 8 and 150 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  select * into settings from private.payment_sandbox_settings where singleton for update;
  if not settings.enabled then raise exception 'sandbox payment is disabled' using errcode = '42501'; end if;
  select * into target from public.bookings where id = p_booking_id for update;
  if not found or target.user_id <> p_user_id then raise exception 'booking not found' using errcode = 'P0002'; end if;
  select * into existing from public.payments
  where booking_id = p_booking_id and idempotency_key = p_idempotency_key for update;
  if found then
    if existing.method <> p_method then raise exception 'payment idempotency conflict' using errcode = '23505'; end if;
    va := existing.provider_payload ->> 'vaNumber'; qr := existing.provider_payload ->> 'qrPayload';
    return query select existing.id, existing.status, existing.amount_rupiah, existing.expires_at,
      existing.commission_rupiah, existing.venue_net_rupiah, va, qr;
    return;
  end if;
  if target.status <> 'PENDING_PAYMENT' or target.payment_expires_at is null or target.payment_expires_at <= now() then
    raise exception 'booking is not payable' using errcode = '23514';
  end if;
  fee := (target.total_price_rupiah * settings.commission_bps) / 10000;
  va := case when p_method = 'VA' then '9880' || lpad((floor(random() * 1000000000000))::bigint::text, 12, '0') end;
  qr := case when p_method = 'QRIS' then 'PADelKU-SANDBOX:' || target.booking_code || ':' || target.total_price_rupiah end;
  insert into public.payments (
    booking_id, method, provider, external_transaction_id, amount_rupiah, status, provider_payload,
    idempotency_key, expires_at, commission_bps, commission_rupiah, venue_net_rupiah
  ) values (
    target.id, p_method, 'SANDBOX', 'sandbox-' || gen_random_uuid(), target.total_price_rupiah, 'PENDING',
    jsonb_build_object('kind', 'sandbox', 'vaNumber', va, 'qrPayload', qr), p_idempotency_key,
    target.payment_expires_at, settings.commission_bps, fee, target.total_price_rupiah - fee
  ) returning * into created;
  insert into public.payment_events (payment_id, booking_id, idempotency_key, event_type, to_status, actor_id, actor_role)
  values (created.id, target.id, p_idempotency_key, 'CREATED', 'PENDING', p_user_id, 'PLAYER');
  return query select created.id, created.status, created.amount_rupiah, created.expires_at,
    created.commission_rupiah, created.venue_net_rupiah, va, qr;
end; $$;

create function public.transition_sandbox_payment(
  p_payment_id uuid,
  p_command text,
  p_idempotency_key text,
  p_actor_id uuid,
  p_actor_role text,
  p_reason text default null
)
returns table (payment_id uuid, payment_status public.payment_status, booking_status public.booking_status)
language plpgsql security definer set search_path = '' as $$
declare
  payment public.payments%rowtype;
  booking public.bookings%rowtype;
  event_type text;
  resulting_payment public.payment_status;
  resulting_booking public.booking_status;
  dispute public.payment_disputes%rowtype;
begin
  perform private.assert_server_role();
  if char_length(p_idempotency_key) not between 8 and 150 then raise exception 'invalid idempotency key' using errcode = '22023'; end if;
  if p_actor_role not in ('PLAYER', 'ADMIN', 'SYSTEM') then raise exception 'invalid actor role' using errcode = '22023'; end if;
  select p.* into payment from public.payments p where p.id = p_payment_id for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
  select b.* into booking from public.bookings b where b.id = payment.booking_id for update;
  if exists (select 1 from public.payment_events e where e.payment_id = payment.id and e.idempotency_key = p_idempotency_key) then
    return query select payment.id, payment.status, booking.status; return;
  end if;
  if p_command in ('FAIL', 'REFUND', 'OPEN_DISPUTE', 'WIN_DISPUTE', 'LOSE_DISPUTE') and char_length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'reason is required' using errcode = '22023';
  end if;

  if p_command = 'SETTLE' then
    if payment.status <> 'PENDING' or booking.status <> 'PENDING_PAYMENT' or payment.expires_at <= now() then
      raise exception 'payment cannot be settled' using errcode = '23514';
    end if;
    update public.payments set status = 'SETTLED', paid_at = now(), updated_at = now() where id = payment.id;
    update public.booking_slots set status = 'BOOKED', locked_by = null, locked_at = null, lock_expires_at = null, updated_at = now()
      where lock_booking_id = booking.id and status = 'LOCKED';
    if not found then raise exception 'booking no longer owns slots' using errcode = '23514'; end if;
    update public.bookings set status = 'CONFIRMED', payment_expires_at = null, confirmed_at = now(), updated_at = now() where id = booking.id;
    insert into public.notifications (user_id, type, title, message, data) values
      (booking.user_id, 'PAYMENT', 'Pembayaran berhasil', 'Pembayaran sandbox diterima dan jadwal dikonfirmasi.', jsonb_build_object('booking_id', booking.id, 'payment_id', payment.id));
    event_type := 'SETTLED'; resulting_payment := 'SETTLED'; resulting_booking := 'CONFIRMED';
  elsif p_command = 'FAIL' then
    if payment.status <> 'PENDING' then raise exception 'payment cannot fail' using errcode = '23514'; end if;
    update public.payments set status = 'FAILED', failure_code = 'SANDBOX_DECLINED', failure_reason = btrim(p_reason), terminal_at = now(), updated_at = now() where id = payment.id;
    event_type := 'FAILED'; resulting_payment := 'FAILED'; resulting_booking := booking.status;
  elsif p_command = 'EXPIRE' then
    if payment.status <> 'PENDING' then raise exception 'payment cannot expire' using errcode = '23514'; end if;
    update public.payments set status = 'EXPIRED', terminal_at = now(), updated_at = now() where id = payment.id;
    if booking.status = 'PENDING_PAYMENT' then perform public.expire_booking(booking.id); resulting_booking := 'CANCELLED'; else resulting_booking := booking.status; end if;
    event_type := 'EXPIRED'; resulting_payment := 'EXPIRED';
  elsif p_command = 'REFUND' then
    if payment.status <> 'SETTLED' then raise exception 'payment cannot be refunded' using errcode = '23514'; end if;
    update public.payments set status = 'REFUNDED', refunded_at = now(), terminal_at = now(), updated_at = now() where id = payment.id;
    if booking.status = 'CONFIRMED' then perform public.cancel_booking(booking.id, 'REFUND: ' || btrim(p_reason), p_actor_id); resulting_booking := 'CANCELLED'; else resulting_booking := booking.status; end if;
    insert into public.notifications (user_id, type, title, message, data) values
      (booking.user_id, 'PAYMENT', 'Dana dikembalikan', 'Refund sandbox telah dicatat.', jsonb_build_object('booking_id', booking.id, 'payment_id', payment.id));
    event_type := 'REFUNDED'; resulting_payment := 'REFUNDED';
  elsif p_command = 'OPEN_DISPUTE' then
    if payment.status <> 'SETTLED' then raise exception 'only settled payment can be disputed' using errcode = '23514'; end if;
    insert into public.payment_disputes (payment_id, booking_id, reason, opened_by) values (payment.id, booking.id, btrim(p_reason), p_actor_id)
      returning * into dispute;
    event_type := 'DISPUTE_OPENED'; resulting_payment := payment.status; resulting_booking := booking.status;
  elsif p_command in ('WIN_DISPUTE', 'LOSE_DISPUTE') then
    select * into dispute from public.payment_disputes where payment_id = payment.id and status = 'OPEN' for update;
    if not found then raise exception 'open dispute not found' using errcode = 'P0002'; end if;
    update public.payment_disputes set status = case when p_command = 'WIN_DISPUTE' then 'WON' else 'LOST' end,
      resolution = btrim(p_reason), resolved_by = p_actor_id, resolved_at = now(), updated_at = now() where id = dispute.id;
    if p_command = 'LOSE_DISPUTE' then
      update public.payments set status = 'REFUNDED', refunded_at = now(), terminal_at = now(), updated_at = now() where id = payment.id;
      if booking.status = 'CONFIRMED' then perform public.cancel_booking(booking.id, 'DISPUTE_LOST: ' || btrim(p_reason), p_actor_id); resulting_booking := 'CANCELLED'; else resulting_booking := booking.status; end if;
      event_type := 'DISPUTE_LOST'; resulting_payment := 'REFUNDED';
    else event_type := 'DISPUTE_WON'; resulting_payment := payment.status; resulting_booking := booking.status; end if;
  else raise exception 'invalid payment command' using errcode = '22023';
  end if;
  insert into public.payment_events (payment_id, booking_id, idempotency_key, event_type, from_status, to_status, actor_id, actor_role, reason)
  values (payment.id, booking.id, p_idempotency_key, event_type, payment.status, resulting_payment, p_actor_id,
    p_actor_role, nullif(btrim(coalesce(p_reason, '')), ''));
  return query select payment.id, resulting_payment, resulting_booking;
end; $$;

create function public.complete_finished_bookings(p_limit integer default 100)
returns integer language plpgsql security definer set search_path = '' as $$
declare target_id uuid; completed integer := 0;
begin
  perform private.assert_server_role();
  for target_id in
    select b.id from public.bookings b where b.status = 'CONFIRMED'
      and exists (select 1 from public.booking_items i where i.booking_id = b.id and i.is_active)
      and not exists (select 1 from public.booking_items i where i.booking_id = b.id and i.is_active and i.ends_at > now())
    order by b.confirmed_at for update skip locked limit p_limit
  loop
    update public.bookings set status = 'COMPLETED', completed_at = now(), updated_at = now() where id = target_id;
    completed := completed + 1;
  end loop;
  return completed;
end; $$;

-- Owners can manage only future free/blocked slots belonging to their own venues.
create policy booking_slots_owner_insert on public.booking_slots for insert to authenticated
with check (private.owns_venue((select c.venue_id from public.courts c where c.id = court_id)) and starts_at > now() and status = 'AVAILABLE');
create policy booking_slots_owner_update on public.booking_slots for update to authenticated
using (private.owns_venue((select c.venue_id from public.courts c where c.id = court_id)) and starts_at > now() and status in ('AVAILABLE', 'BLOCKED'))
with check (private.owns_venue((select c.venue_id from public.courts c where c.id = court_id)) and starts_at > now() and status in ('AVAILABLE', 'BLOCKED'));
grant insert (court_id, starts_at, ends_at, price_rupiah, status) on public.booking_slots to authenticated;
grant update (status, blocked_reason, price_rupiah, updated_at) on public.booking_slots to authenticated;

alter table public.payment_events enable row level security;
alter table public.payment_disputes enable row level security;
create policy payment_events_admin_read on public.payment_events for select to authenticated using ((select private.is_admin()));
create policy payment_disputes_admin_read on public.payment_disputes for select to authenticated using ((select private.is_admin()));
create policy payment_disputes_participant_read on public.payment_disputes for select to authenticated using (
  exists (select 1 from public.bookings b join public.venues v on v.id = b.venue_id where b.id = booking_id and (b.user_id = (select auth.uid()) or v.owner_id = (select auth.uid())))
);
grant select on public.payment_events, public.payment_disputes to authenticated;

revoke all on function public.create_sandbox_payment(uuid, uuid, public.payment_method, text) from public, anon, authenticated;
revoke all on function public.transition_sandbox_payment(uuid, text, text, uuid, text, text) from public, anon, authenticated;
revoke all on function public.complete_finished_bookings(integer) from public, anon, authenticated;
grant execute on function public.create_sandbox_payment(uuid, uuid, public.payment_method, text) to service_role;
grant execute on function public.transition_sandbox_payment(uuid, text, text, uuid, text, text) to service_role;
grant execute on function public.complete_finished_bookings(integer) to service_role;
