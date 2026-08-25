-- Harden booking and internal sandbox payment lifecycle without rewriting migration history.

alter table public.bookings add column initial_payment_expires_at timestamptz;

update public.bookings b
set initial_payment_expires_at = coalesce(
  b.payment_expires_at,
  (select min(p.expires_at) from public.payments p where p.booking_id = b.id),
  b.created_at + interval '10 minutes'
);

alter table public.bookings
  alter column initial_payment_expires_at set not null,
  alter column initial_payment_expires_at set default (now() + interval '10 minutes'),
  add constraint bookings_initial_payment_expiry_valid
    check (initial_payment_expires_at > created_at);

alter table public.payment_events
  add column request_payload jsonb,
  add column booking_status public.booking_status;

update public.payment_events e
set request_payload = jsonb_strip_nulls(jsonb_build_object(
      'operation', 'LEGACY_EVENT',
      'eventType', e.event_type,
      'actorId', e.actor_id,
      'actorRole', e.actor_role,
      'reason', e.reason
    )),
    booking_status = b.status
from public.bookings b
where b.id = e.booking_id;

alter table public.payment_events
  alter column request_payload set not null,
  alter column booking_status set not null,
  add constraint payment_events_request_payload_object
    check (jsonb_typeof(request_payload) = 'object');

do $$
begin
  if exists (
    select 1
    from public.payments
    where status = 'PENDING'
    group by booking_id
    having count(*) > 1
  ) then
    raise exception 'duplicate pending payments require remediation before migration'
      using errcode = '23514';
  end if;
end;
$$;

create unique index payments_one_pending_booking
  on public.payments (booking_id)
  where status = 'PENDING';

create unique index payments_id_booking_id_key
  on public.payments (id, booking_id);

alter table public.payment_events
  add constraint payment_events_payment_booking_fkey
  foreign key (payment_id, booking_id)
  references public.payments (id, booking_id)
  on delete restrict;

alter table public.payment_disputes
  add constraint payment_disputes_payment_booking_fkey
  foreign key (payment_id, booking_id)
  references public.payments (id, booking_id)
  on delete restrict;

create or replace function public.create_booking(
  p_user_id uuid,
  p_slot_ids uuid[],
  p_idempotency_key text default null
)
returns table (booking_id uuid, booking_code text, total_price_rupiah bigint, payment_expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  slot_count integer;
  distinct_count integer;
  selected_count integer;
  selected_court_id uuid;
  selected_venue_id uuid;
  first_start timestamptz;
  last_end timestamptz;
  total_duration interval;
  calculated_total bigint;
  new_booking public.bookings%rowtype;
  expired_booking_id uuid;
  requested_slots uuid[];
  existing_slots uuid[];
  expiry timestamptz;
begin
  perform private.assert_server_role();

  slot_count := coalesce(cardinality(p_slot_ids), 0);
  if slot_count < 1 or slot_count > 8 then
    raise exception 'between 1 and 8 slots are required' using errcode = '22023';
  end if;
  if p_idempotency_key is not null and char_length(p_idempotency_key) not between 8 and 100 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  select array_agg(value order by value), count(distinct value)
  into requested_slots, distinct_count
  from unnest(p_slot_ids) value;
  if distinct_count <> slot_count then
    raise exception 'duplicate slot ids are not allowed' using errcode = '22023';
  end if;

  if p_idempotency_key is not null then
    perform pg_advisory_xact_lock(
      hashtextextended(p_user_id::text || '|' || p_idempotency_key, 0)
    );
    select b.* into new_booking
    from public.bookings b
    where b.user_id = p_user_id and b.idempotency_key = p_idempotency_key
    for update;
    if found then
      select array_agg(i.booking_slot_id order by i.booking_slot_id)
      into existing_slots
      from public.booking_items i
      where i.booking_id = new_booking.id;
      if existing_slots is distinct from requested_slots then
        raise exception 'booking idempotency conflict' using errcode = '23505';
      end if;
      return query select new_booking.id, new_booking.booking_code,
        new_booking.total_price_rupiah, new_booking.initial_payment_expires_at;
      return;
    end if;
  end if;

  if not exists (select 1 from public.profiles p where p.id = p_user_id and p.role = 'PLAYER') then
    raise exception 'booking user must be a PLAYER' using errcode = '42501';
  end if;

  for expired_booking_id in
    select distinct s.lock_booking_id
    from public.booking_slots s
    where s.id = any(p_slot_ids)
      and s.status = 'LOCKED'
      and s.lock_expires_at <= now()
      and s.lock_booking_id is not null
    order by s.lock_booking_id
  loop
    perform public.expire_booking(expired_booking_id);
  end loop;

  perform 1
  from public.booking_slots s
  where s.id = any(p_slot_ids)
  order by s.id
  for update;
  get diagnostics selected_count = row_count;

  if selected_count <> slot_count then
    raise exception 'one or more slots do not exist' using errcode = 'P0002';
  end if;
  if exists (
    select 1 from public.booking_slots s
    where s.id = any(p_slot_ids) and s.status <> 'AVAILABLE'
  ) then
    raise exception 'one or more slots are unavailable' using errcode = 'P0001';
  end if;

  select count(distinct s.court_id), (array_agg(distinct s.court_id))[1],
         min(s.starts_at), max(s.ends_at), sum(s.ends_at - s.starts_at), sum(s.price_rupiah)
  into distinct_count, selected_court_id, first_start, last_end, total_duration, calculated_total
  from public.booking_slots s
  where s.id = any(p_slot_ids);

  if distinct_count <> 1 then
    raise exception 'all slots must belong to the same court' using errcode = '22023';
  end if;
  if first_start <= now() then
    raise exception 'all slots must be in the future' using errcode = '22023';
  end if;
  if last_end - first_start <> total_duration or exists (
    select 1
    from (
      select s.starts_at, lag(s.ends_at) over (order by s.starts_at, s.id) previous_end
      from public.booking_slots s
      where s.id = any(p_slot_ids)
    ) ordered_slots
    where previous_end is not null and starts_at <> previous_end
  ) then
    raise exception 'slots must be contiguous' using errcode = '22023';
  end if;

  select c.venue_id into selected_venue_id
  from public.courts c
  join public.venues v on v.id = c.venue_id
  where c.id = selected_court_id and c.is_active and v.status = 'APPROVED';
  if selected_venue_id is null then
    raise exception 'venue must be approved and court must be active' using errcode = '23514';
  end if;

  expiry := now() + interval '10 minutes';
  insert into public.bookings (
    user_id, venue_id, total_price_rupiah, payment_expires_at,
    initial_payment_expires_at, idempotency_key
  ) values (
    p_user_id, selected_venue_id, calculated_total, expiry, expiry, p_idempotency_key
  ) returning * into new_booking;

  insert into public.booking_items (
    booking_id, booking_slot_id, court_id, starts_at, ends_at, price_rupiah
  )
  select new_booking.id, s.id, s.court_id, s.starts_at, s.ends_at, s.price_rupiah
  from public.booking_slots s
  where s.id = any(p_slot_ids)
  order by s.id;

  update public.booking_slots s
  set status = 'LOCKED', locked_by = p_user_id, locked_at = now(),
      lock_expires_at = expiry, lock_booking_id = new_booking.id, updated_at = now()
  where s.id = any(p_slot_ids);

  insert into public.notifications (user_id, type, title, message, data)
  values (
    p_user_id, 'BOOKING', 'Menunggu pembayaran',
    'Selesaikan pembayaran dalam 10 menit agar jadwal tetap tersedia.',
    jsonb_build_object('booking_id', new_booking.id)
  );

  return query select new_booking.id, new_booking.booking_code,
    new_booking.total_price_rupiah, new_booking.initial_payment_expires_at;
end;
$$;

create or replace function public.cancel_booking(
  p_booking_id uuid,
  p_reason text,
  p_actor_id uuid default null
)
returns public.booking_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.bookings%rowtype;
  pending_payment public.payments%rowtype;
begin
  perform private.assert_server_role();
  if nullif(btrim(p_reason), '') is null then
    raise exception 'cancellation reason is required' using errcode = '22023';
  end if;

  select * into target from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking not found' using errcode = 'P0002'; end if;
  if target.status = 'CANCELLED' then return target.status; end if;
  if target.status = 'COMPLETED' then
    raise exception 'completed booking cannot be cancelled' using errcode = '23514';
  end if;

  perform p.id from public.payments p
  where p.booking_id = p_booking_id order by p.id for update;
  if target.status = 'CONFIRMED' and exists (
    select 1 from public.payments p
    where p.booking_id = p_booking_id and p.status = 'SETTLED'
  ) then
    raise exception 'settled booking requires refund before cancellation' using errcode = '23514';
  end if;

  for pending_payment in
    update public.payments
    set status = 'FAILED', failure_code = 'BOOKING_CANCELLED',
        failure_reason = btrim(p_reason), terminal_at = now(), updated_at = now()
    where booking_id = p_booking_id and status = 'PENDING'
    returning *
  loop
    insert into public.payment_events (
      payment_id, booking_id, idempotency_key, event_type, from_status, to_status,
      actor_id, actor_role, reason, request_payload, booking_status
    ) values (
      pending_payment.id, p_booking_id, 'cancel-' || p_booking_id, 'FAILED',
      'PENDING', 'FAILED', p_actor_id,
      case when p_actor_id is null then 'SYSTEM' else 'PLAYER' end,
      btrim(p_reason),
      jsonb_strip_nulls(jsonb_build_object(
        'operation', 'CANCEL_BOOKING', 'actorId', p_actor_id, 'reason', btrim(p_reason)
      )),
      'CANCELLED'
    ) on conflict (payment_id, idempotency_key) do nothing;
  end loop;

  update public.booking_items set is_active = false
  where booking_id = p_booking_id and is_active;
  update public.booking_slots
  set status = 'AVAILABLE', locked_by = null, locked_at = null, lock_expires_at = null,
      lock_booking_id = null, blocked_reason = null, updated_at = now()
  where lock_booking_id = p_booking_id and status in ('LOCKED', 'BOOKED');
  update public.bookings
  set status = 'CANCELLED', payment_expires_at = null, cancelled_at = now(),
      cancellation_reason = btrim(p_reason), updated_at = now()
  where id = p_booking_id;

  insert into public.audit_logs (actor_id, actor_role, action, table_name, record_id, metadata)
  values (p_actor_id, 'service_role', 'BOOKING_CANCELLED', 'bookings', p_booking_id,
    jsonb_build_object('reason', btrim(p_reason)));
  return 'CANCELLED'::public.booking_status;
end;
$$;

create or replace function public.expire_booking(p_booking_id uuid)
returns public.booking_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.bookings%rowtype;
  pending_payment public.payments%rowtype;
begin
  perform private.assert_server_role();
  select * into target from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking not found' using errcode = 'P0002'; end if;
  if target.status = 'CANCELLED' then return target.status; end if;
  if target.status <> 'PENDING_PAYMENT' then return target.status; end if;
  if target.payment_expires_at > now() then return target.status; end if;

  perform p.id from public.payments p
  where p.booking_id = p_booking_id order by p.id for update;
  for pending_payment in
    update public.payments
    set status = 'EXPIRED', terminal_at = now(), updated_at = now()
    where booking_id = p_booking_id and status = 'PENDING'
    returning *
  loop
    insert into public.payment_events (
      payment_id, booking_id, idempotency_key, event_type, from_status, to_status,
      actor_role, reason, request_payload, booking_status
    ) values (
      pending_payment.id, p_booking_id, 'expire-' || p_booking_id, 'EXPIRED',
      'PENDING', 'EXPIRED', 'SYSTEM', 'Payment window expired',
      jsonb_build_object('operation', 'EXPIRE_BOOKING'), 'CANCELLED'
    ) on conflict (payment_id, idempotency_key) do nothing;
  end loop;

  update public.booking_items set is_active = false
  where booking_id = p_booking_id and is_active;
  update public.booking_slots
  set status = 'AVAILABLE', locked_by = null, locked_at = null, lock_expires_at = null,
      lock_booking_id = null, updated_at = now()
  where lock_booking_id = p_booking_id and status = 'LOCKED';
  update public.bookings
  set status = 'CANCELLED', payment_expires_at = null, cancelled_at = now(),
      cancellation_reason = 'PAYMENT_EXPIRED', updated_at = now()
  where id = p_booking_id;
  insert into public.audit_logs (actor_role, action, table_name, record_id)
  values ('service_role', 'BOOKING_EXPIRED', 'bookings', p_booking_id);
  return 'CANCELLED'::public.booking_status;
end;
$$;

create or replace function public.create_sandbox_payment(
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
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.bookings%rowtype;
  existing public.payments%rowtype;
  created public.payments%rowtype;
  settings private.payment_sandbox_settings%rowtype;
  fee bigint;
  va text;
  qr text;
  wallet_token text;
  request jsonb;
begin
  perform private.assert_server_role();
  if char_length(p_idempotency_key) not between 8 and 150 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  select * into settings from private.payment_sandbox_settings where singleton;
  if not settings.enabled then
    raise exception 'sandbox payment is disabled' using errcode = '42501';
  end if;
  select * into target from public.bookings where id = p_booking_id for update;
  if not found or target.user_id <> p_user_id then
    raise exception 'booking not found' using errcode = 'P0002';
  end if;
  perform p.id from public.payments p
  where p.booking_id = p_booking_id order by p.id for update;

  select * into existing from public.payments
  where booking_id = p_booking_id and idempotency_key = p_idempotency_key;
  if found then
    if existing.method <> p_method
       or existing.amount_rupiah <> target.total_price_rupiah
       or existing.expires_at <> target.initial_payment_expires_at then
      raise exception 'payment idempotency conflict' using errcode = '23505';
    end if;
    return query select existing.id, existing.status, existing.amount_rupiah,
      existing.expires_at, existing.commission_rupiah, existing.venue_net_rupiah,
      existing.provider_payload ->> 'vaNumber',
      coalesce(existing.provider_payload ->> 'qrPayload', existing.provider_payload ->> 'walletToken');
    return;
  end if;

  if target.status <> 'PENDING_PAYMENT' or target.payment_expires_at is null then
    raise exception 'booking is not payable' using errcode = '23514';
  end if;
  if target.payment_expires_at <= now() then
    perform public.expire_booking(target.id);
    return;
  end if;
  if exists (select 1 from public.payments p where p.booking_id = target.id and p.status = 'PENDING') then
    raise exception 'booking already has a pending payment' using errcode = '23505';
  end if;

  fee := (target.total_price_rupiah * settings.commission_bps) / 10000;
  va := case when p_method = 'VA'
    then '9880' || lpad((floor(random() * 1000000000000))::bigint::text, 12, '0') end;
  qr := case when p_method = 'QRIS'
    then 'PADELKU-SANDBOX:' || target.booking_code || ':' || target.total_price_rupiah end;
  wallet_token := case when p_method = 'EWALLET'
    then 'ewallet-sandbox-' || replace(gen_random_uuid()::text, '-', '') end;
  request := jsonb_build_object(
    'operation', 'CREATE_PAYMENT', 'bookingId', target.id,
    'userId', p_user_id, 'method', p_method, 'amountRupiah', target.total_price_rupiah
  );

  insert into public.payments (
    booking_id, method, provider, external_transaction_id, amount_rupiah, status,
    provider_payload, idempotency_key, expires_at, commission_bps,
    commission_rupiah, venue_net_rupiah
  ) values (
    target.id, p_method, 'SANDBOX', 'sandbox-' || gen_random_uuid(),
    target.total_price_rupiah, 'PENDING',
    jsonb_strip_nulls(jsonb_build_object(
      'kind', 'sandbox', 'vaNumber', va, 'qrPayload', qr, 'walletToken', wallet_token
    )),
    p_idempotency_key, target.payment_expires_at, settings.commission_bps,
    fee, target.total_price_rupiah - fee
  ) returning * into created;

  insert into public.payment_events (
    payment_id, booking_id, idempotency_key, event_type, to_status,
    actor_id, actor_role, request_payload, booking_status
  ) values (
    created.id, target.id, p_idempotency_key, 'CREATED', 'PENDING',
    p_user_id, 'PLAYER', request, target.status
  );

  return query select created.id, created.status, created.amount_rupiah,
    created.expires_at, created.commission_rupiah, created.venue_net_rupiah,
    va, coalesce(qr, wallet_token);
end;
$$;

create or replace function public.transition_sandbox_payment(
  p_payment_id uuid,
  p_command text,
  p_idempotency_key text,
  p_actor_id uuid,
  p_actor_role text,
  p_reason text default null
)
returns table (
  payment_id uuid,
  payment_status public.payment_status,
  booking_status public.booking_status
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_payment public.payments%rowtype;
  target_booking public.bookings%rowtype;
  prior_event public.payment_events%rowtype;
  target_dispute public.payment_disputes%rowtype;
  target_booking_id uuid;
  requested_payload jsonb;
  event_name text;
  resulting_payment public.payment_status;
  resulting_booking public.booking_status;
  expected_slots integer;
  owned_slots integer;
  updated_slots integer;
begin
  perform private.assert_server_role();
  if char_length(p_idempotency_key) not between 8 and 150 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  if p_actor_role not in ('PLAYER', 'ADMIN', 'SYSTEM') then
    raise exception 'invalid actor role' using errcode = '22023';
  end if;
  if p_command not in ('SETTLE', 'FAIL', 'EXPIRE', 'REFUND', 'OPEN_DISPUTE', 'WIN_DISPUTE', 'LOSE_DISPUTE') then
    raise exception 'invalid payment command' using errcode = '22023';
  end if;
  if p_command in ('FAIL', 'REFUND', 'WIN_DISPUTE', 'LOSE_DISPUTE')
     and char_length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'reason is required' using errcode = '22023';
  end if;
  if p_command = 'OPEN_DISPUTE' and char_length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'dispute reason must contain at least 10 characters' using errcode = '22023';
  end if;

  select p.booking_id into target_booking_id
  from public.payments p where p.id = p_payment_id;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
  select * into target_booking from public.bookings
  where id = target_booking_id for update;
  select * into target_payment from public.payments
  where id = p_payment_id and booking_id = target_booking_id for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;

  requested_payload := jsonb_strip_nulls(jsonb_build_object(
    'operation', 'TRANSITION_PAYMENT', 'command', p_command,
    'actorId', p_actor_id, 'actorRole', p_actor_role,
    'reason', nullif(btrim(coalesce(p_reason, '')), '')
  ));
  select * into prior_event from public.payment_events e
  where e.payment_id = target_payment.id and e.idempotency_key = p_idempotency_key;
  if found then
    if prior_event.request_payload is distinct from requested_payload then
      raise exception 'payment idempotency conflict' using errcode = '23505';
    end if;
    return query select prior_event.payment_id, prior_event.to_status, prior_event.booking_status;
    return;
  end if;

  if p_command = 'SETTLE' then
    if target_payment.status <> 'PENDING'
       or target_booking.status <> 'PENDING_PAYMENT'
       or target_payment.expires_at <= now()
       or target_booking.payment_expires_at <= now()
       or target_payment.expires_at <> target_booking.payment_expires_at then
      raise exception 'payment cannot be settled' using errcode = '23514';
    end if;

    select count(*) into expected_slots from public.booking_items i
    where i.booking_id = target_booking.id and i.is_active;
    perform s.id
    from public.booking_slots s
    join public.booking_items i on i.booking_slot_id = s.id
    where i.booking_id = target_booking.id and i.is_active
    order by s.id for update of s;
    select count(*) into owned_slots
    from public.booking_slots s
    join public.booking_items i on i.booking_slot_id = s.id
    where i.booking_id = target_booking.id and i.is_active
      and s.status = 'LOCKED' and s.lock_booking_id = target_booking.id;
    if expected_slots = 0 or owned_slots <> expected_slots then
      raise exception 'booking no longer owns all slots' using errcode = '23514';
    end if;

    update public.booking_slots s
    set status = 'BOOKED', locked_by = null, locked_at = null,
        lock_expires_at = null, updated_at = now()
    where s.id in (
      select i.booking_slot_id from public.booking_items i
      where i.booking_id = target_booking.id and i.is_active
    ) and s.status = 'LOCKED' and s.lock_booking_id = target_booking.id;
    get diagnostics updated_slots = row_count;
    if updated_slots <> expected_slots then
      raise exception 'booking slot settlement was incomplete' using errcode = '23514';
    end if;

    update public.payments set status = 'SETTLED', paid_at = now(), updated_at = now()
    where id = target_payment.id;
    update public.bookings
    set status = 'CONFIRMED', payment_expires_at = null,
        confirmed_at = now(), updated_at = now()
    where id = target_booking.id;
    insert into public.notifications (user_id, type, title, message, data)
    values (
      target_booking.user_id, 'PAYMENT', 'Pembayaran berhasil',
      'Pembayaran sandbox diterima dan jadwal dikonfirmasi.',
      jsonb_build_object('booking_id', target_booking.id, 'payment_id', target_payment.id)
    );
    event_name := 'SETTLED'; resulting_payment := 'SETTLED'; resulting_booking := 'CONFIRMED';

  elsif p_command = 'FAIL' then
    if target_payment.status <> 'PENDING' then
      raise exception 'payment cannot fail' using errcode = '23514';
    end if;
    update public.payments
    set status = 'FAILED', failure_code = 'SANDBOX_DECLINED',
        failure_reason = btrim(p_reason), terminal_at = now(), updated_at = now()
    where id = target_payment.id;
    event_name := 'FAILED'; resulting_payment := 'FAILED'; resulting_booking := target_booking.status;

  elsif p_command = 'EXPIRE' then
    if target_payment.status <> 'PENDING' or target_payment.expires_at > now() then
      raise exception 'payment cannot expire' using errcode = '23514';
    end if;
    resulting_booking := public.expire_booking(target_booking.id);
    resulting_payment := 'EXPIRED'; event_name := 'EXPIRED';

  elsif p_command = 'REFUND' then
    if target_payment.status <> 'SETTLED' then
      raise exception 'payment cannot be refunded' using errcode = '23514';
    end if;
    if exists (select 1 from public.payment_disputes d where d.payment_id = target_payment.id) then
      raise exception 'disputed payment cannot be directly refunded' using errcode = '23514';
    end if;
    update public.payments
    set status = 'REFUNDED', refunded_at = now(), terminal_at = now(), updated_at = now()
    where id = target_payment.id;
    if target_booking.status = 'CONFIRMED' then
      resulting_booking := public.cancel_booking(
        target_booking.id, 'REFUND: ' || btrim(p_reason), p_actor_id
      );
    else
      resulting_booking := target_booking.status;
    end if;
    insert into public.notifications (user_id, type, title, message, data)
    values (
      target_booking.user_id, 'PAYMENT', 'Dana dikembalikan',
      'Refund sandbox telah dicatat.',
      jsonb_build_object('booking_id', target_booking.id, 'payment_id', target_payment.id)
    );
    event_name := 'REFUNDED'; resulting_payment := 'REFUNDED';

  elsif p_command = 'OPEN_DISPUTE' then
    if target_payment.status <> 'SETTLED'
       or target_booking.status not in ('CONFIRMED', 'COMPLETED') then
      raise exception 'only a funded booking can be disputed' using errcode = '23514';
    end if;
    insert into public.payment_disputes (payment_id, booking_id, reason, opened_by)
    values (target_payment.id, target_booking.id, btrim(p_reason), p_actor_id)
    returning * into target_dispute;
    event_name := 'DISPUTE_OPENED'; resulting_payment := target_payment.status;
    resulting_booking := target_booking.status;

  else
    if target_payment.status <> 'SETTLED' then
      raise exception 'only settled payment disputes can be resolved' using errcode = '23514';
    end if;
    select * into target_dispute from public.payment_disputes
    where payment_id = target_payment.id and status = 'OPEN' for update;
    if not found then raise exception 'open dispute not found' using errcode = 'P0002'; end if;
    update public.payment_disputes
    set status = case when p_command = 'WIN_DISPUTE' then 'WON' else 'LOST' end,
        resolution = btrim(p_reason), resolved_by = p_actor_id,
        resolved_at = now(), updated_at = now()
    where id = target_dispute.id;
    if p_command = 'LOSE_DISPUTE' then
      update public.payments
      set status = 'REFUNDED', refunded_at = now(), terminal_at = now(), updated_at = now()
      where id = target_payment.id;
      if target_booking.status = 'CONFIRMED' then
        resulting_booking := public.cancel_booking(
          target_booking.id, 'DISPUTE_LOST: ' || btrim(p_reason), p_actor_id
        );
      else
        resulting_booking := target_booking.status;
      end if;
      insert into public.notifications (user_id, type, title, message, data)
      values (
        target_booking.user_id, 'PAYMENT', 'Sengketa dikembalikan',
        'Sengketa disetujui dan refund sandbox telah dicatat.',
        jsonb_build_object('booking_id', target_booking.id, 'payment_id', target_payment.id)
      );
      event_name := 'DISPUTE_LOST'; resulting_payment := 'REFUNDED';
    else
      event_name := 'DISPUTE_WON'; resulting_payment := 'SETTLED';
      resulting_booking := target_booking.status;
    end if;
  end if;

  insert into public.payment_events (
    payment_id, booking_id, idempotency_key, event_type, from_status, to_status,
    actor_id, actor_role, reason, request_payload, booking_status
  ) values (
    target_payment.id, target_booking.id, p_idempotency_key, event_name,
    target_payment.status, resulting_payment, p_actor_id, p_actor_role,
    nullif(btrim(coalesce(p_reason, '')), ''), requested_payload, resulting_booking
  );
  return query select target_payment.id, resulting_payment, resulting_booking;
end;
$$;

create or replace function public.complete_finished_bookings(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
  completed integer := 0;
begin
  perform private.assert_server_role();
  if p_limit not between 1 and 500 then
    raise exception 'limit must be between 1 and 500' using errcode = '22023';
  end if;
  for target_id in
    select b.id
    from public.bookings b
    where b.status = 'CONFIRMED'
      and exists (
        select 1 from public.payments p
        where p.booking_id = b.id and p.status = 'SETTLED'
      )
      and exists (
        select 1 from public.booking_items i
        where i.booking_id = b.id and i.is_active
      )
      and not exists (
        select 1 from public.booking_items i
        where i.booking_id = b.id and i.is_active and i.ends_at > now()
      )
    order by b.confirmed_at, b.id
    for update skip locked
    limit p_limit
  loop
    update public.bookings
    set status = 'COMPLETED', completed_at = now(), updated_at = now()
    where id = target_id;
    completed := completed + 1;
  end loop;
  return completed;
end;
$$;

create function public.run_backend_maintenance(p_limit integer default 100)
returns table (expired_bookings integer, completed_bookings integer)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_server_role();
  if p_limit not between 1 and 500 then
    raise exception 'limit must be between 1 and 500' using errcode = '22023';
  end if;
  return query select public.expire_pending_bookings(p_limit),
    public.complete_finished_bookings(p_limit);
end;
$$;

create function public.get_owner_financial_aggregates(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  gross_settled_rupiah bigint,
  platform_fee_rupiah bigint,
  venue_net_rupiah bigint,
  refunded_rupiah bigint,
  settled_count bigint,
  refunded_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(sum(p.amount_rupiah) filter (where p.status = 'SETTLED'), 0)::bigint,
    coalesce(sum(p.commission_rupiah) filter (where p.status = 'SETTLED'), 0)::bigint,
    coalesce(sum(p.venue_net_rupiah) filter (where p.status = 'SETTLED'), 0)::bigint,
    coalesce(sum(p.amount_rupiah) filter (where p.status = 'REFUNDED'), 0)::bigint,
    count(*) filter (where p.status = 'SETTLED'),
    count(*) filter (where p.status = 'REFUNDED')
  from public.payments p
  join public.bookings b on b.id = p.booking_id
  join public.venues v on v.id = b.venue_id
  where v.owner_id = (select auth.uid())
    and (p_from is null or coalesce(p.paid_at, p.created_at) >= p_from)
    and (p_to is null or coalesce(p.paid_at, p.created_at) < p_to)
$$;

create function public.get_venue_availability(
  p_venue_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns table (
  id uuid,
  court_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  price_rupiah bigint,
  status public.booking_slot_status
)
language sql
stable
security invoker
set search_path = ''
as $$
  select s.id, s.court_id, s.starts_at, s.ends_at, s.price_rupiah, s.status
  from public.booking_slots s
  join public.courts c on c.id = s.court_id
  join public.venues v on v.id = c.venue_id
  where v.id = p_venue_id
    and v.status = 'APPROVED'
    and c.is_active
    and s.starts_at >= p_starts_at
    and s.starts_at < p_ends_at
  order by s.starts_at, s.court_id, s.id
$$;

revoke all on function public.run_backend_maintenance(integer)
  from public, anon, authenticated;
grant execute on function public.run_backend_maintenance(integer) to service_role;

revoke all on function public.get_owner_financial_aggregates(timestamptz, timestamptz)
  from public, anon;
grant execute on function public.get_owner_financial_aggregates(timestamptz, timestamptz)
  to authenticated;

revoke all on function public.get_venue_availability(uuid, timestamptz, timestamptz)
  from public;
grant execute on function public.get_venue_availability(uuid, timestamptz, timestamptz)
  to anon, authenticated;

drop policy slots_public_available on public.booking_slots;
create policy slots_public_schedule on public.booking_slots for select to anon
using (
  starts_at > now() and exists (
    select 1
    from public.courts c
    join public.venues v on v.id = c.venue_id
    where c.id = court_id and c.is_active and v.status = 'APPROVED'
  )
);

drop policy slots_authenticated_read on public.booking_slots;
create policy slots_authenticated_schedule on public.booking_slots for select to authenticated
using (
  (starts_at > now() and exists (
    select 1
    from public.courts c
    join public.venues v on v.id = c.venue_id
    where c.id = court_id and c.is_active and v.status = 'APPROVED'
  ))
  or locked_by = (select auth.uid())
  or exists (
    select 1 from public.courts c
    where c.id = court_id and (select private.owns_venue(c.venue_id))
  )
  or (select private.is_admin())
);

revoke select on public.booking_slots from anon, authenticated;
grant select (
  id, court_id, starts_at, ends_at, price_rupiah, status, blocked_reason,
  created_at, updated_at
) on public.booking_slots to anon, authenticated;

drop policy payment_disputes_admin_read on public.payment_disputes;
drop policy payment_disputes_participant_read on public.payment_disputes;
create policy payment_disputes_authorized_read
on public.payment_disputes for select to authenticated
using (
  (select private.is_admin())
  or exists (
    select 1
    from public.bookings b
    join public.venues v on v.id = b.venue_id
    where b.id = booking_id
      and (b.user_id = (select auth.uid()) or v.owner_id = (select auth.uid()))
  )
);

revoke all on function public.create_booking(uuid, uuid[], text)
  from public, anon, authenticated;
revoke all on function public.cancel_booking(uuid, text, uuid)
  from public, anon, authenticated;
revoke all on function public.expire_booking(uuid)
  from public, anon, authenticated;
revoke all on function public.create_sandbox_payment(uuid, uuid, public.payment_method, text)
  from public, anon, authenticated;
revoke all on function public.transition_sandbox_payment(uuid, text, text, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.complete_finished_bookings(integer)
  from public, anon, authenticated;

grant execute on function public.create_booking(uuid, uuid[], text) to service_role;
grant execute on function public.cancel_booking(uuid, text, uuid) to service_role;
grant execute on function public.expire_booking(uuid) to service_role;
grant execute on function public.create_sandbox_payment(uuid, uuid, public.payment_method, text)
  to service_role;
grant execute on function public.transition_sandbox_payment(uuid, text, text, uuid, text, text)
  to service_role;
grant execute on function public.complete_finished_bookings(integer) to service_role;
