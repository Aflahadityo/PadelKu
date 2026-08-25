create type public.booking_payment_mode as enum ('ONLINE', 'PAY_AT_VENUE');

alter table public.bookings
  add column payment_mode public.booking_payment_mode not null default 'ONLINE';

alter table public.bookings
  alter column initial_payment_expires_at drop not null,
  alter column initial_payment_expires_at drop default,
  drop constraint bookings_initial_payment_expiry_valid,
  add constraint bookings_initial_payment_expiry_valid check (
    initial_payment_expires_at is null or initial_payment_expires_at > created_at
  ),
  add constraint bookings_payment_mode_valid check (
    (payment_mode = 'ONLINE' and initial_payment_expires_at is not null)
    or (
      payment_mode = 'PAY_AT_VENUE'
      and initial_payment_expires_at is null
      and payment_expires_at is null
      and status in ('CONFIRMED', 'COMPLETED', 'CANCELLED')
    )
  );

create function private.create_pay_at_venue_booking(
  p_user_id uuid,
  p_slot_ids uuid[],
  p_idempotency_key text
)
returns table (
  booking_id uuid,
  booking_code text,
  total_price_rupiah bigint,
  payment_expires_at timestamptz,
  booking_status public.booking_status,
  payment_mode public.booking_payment_mode
)
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
  updated_slots integer;
begin
  perform private.assert_server_role();

  slot_count := coalesce(cardinality(p_slot_ids), 0);
  if slot_count < 1 or slot_count > 8 then
    raise exception 'between 1 and 8 slots are required' using errcode = '22023';
  end if;
  if p_idempotency_key is null
     or char_length(p_idempotency_key) not between 8 and 100 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  select array_agg(value order by value), count(distinct value)
  into requested_slots, distinct_count
  from unnest(p_slot_ids) value;
  if distinct_count <> slot_count then
    raise exception 'duplicate slot ids are not allowed' using errcode = '22023';
  end if;

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
    if new_booking.payment_mode <> 'PAY_AT_VENUE'
       or existing_slots is distinct from requested_slots then
      raise exception 'booking idempotency conflict' using errcode = '23505';
    end if;
    return query select new_booking.id, new_booking.booking_code,
      new_booking.total_price_rupiah, new_booking.payment_expires_at,
      new_booking.status, new_booking.payment_mode;
    return;
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_user_id and p.role = 'PLAYER'
  ) then
    raise exception 'booking user must be a PLAYER' using errcode = '42501';
  end if;

  -- Match lifecycle lock order: booking first, then slots in UUID order.
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
         min(s.starts_at), max(s.ends_at), sum(s.ends_at - s.starts_at),
         sum(s.price_rupiah)
  into distinct_count, selected_court_id, first_start, last_end,
       total_duration, calculated_total
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
      select s.starts_at,
        lag(s.ends_at) over (order by s.starts_at, s.id) previous_end
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

  insert into public.bookings (
    user_id, venue_id, status, total_price_rupiah, payment_expires_at,
    initial_payment_expires_at, confirmed_at, idempotency_key, payment_mode
  ) values (
    p_user_id, selected_venue_id, 'CONFIRMED', calculated_total, null,
    null, now(), p_idempotency_key, 'PAY_AT_VENUE'
  ) returning * into new_booking;

  insert into public.booking_items (
    booking_id, booking_slot_id, court_id, starts_at, ends_at, price_rupiah
  )
  select new_booking.id, s.id, s.court_id, s.starts_at, s.ends_at, s.price_rupiah
  from public.booking_slots s
  where s.id = any(p_slot_ids)
  order by s.id;

  update public.booking_slots s
  set status = 'BOOKED', locked_by = null, locked_at = null,
      lock_expires_at = null, lock_booking_id = new_booking.id,
      updated_at = now()
  where s.id = any(p_slot_ids) and s.status = 'AVAILABLE';
  get diagnostics updated_slots = row_count;
  if updated_slots <> slot_count then
    raise exception 'booking slot confirmation was incomplete' using errcode = '23514';
  end if;

  insert into public.notifications (user_id, type, title, message, data)
  values (
    p_user_id, 'BOOKING', 'Booking dikonfirmasi',
    'Jadwal sudah dikonfirmasi. Lakukan pembayaran langsung di venue.',
    jsonb_build_object(
      'booking_id', new_booking.id,
      'payment_mode', 'PAY_AT_VENUE'
    )
  );

  return query select new_booking.id, new_booking.booking_code,
    new_booking.total_price_rupiah, new_booking.payment_expires_at,
    new_booking.status, new_booking.payment_mode;
end;
$$;

create function public.create_pay_at_venue_booking(
  p_user_id uuid,
  p_slot_ids uuid[],
  p_idempotency_key text
)
returns table (
  booking_id uuid,
  booking_code text,
  total_price_rupiah bigint,
  payment_expires_at timestamptz,
  booking_status public.booking_status,
  payment_mode public.booking_payment_mode
)
language sql
security invoker
set search_path = ''
as $$
  select *
  from private.create_pay_at_venue_booking(
    p_user_id,
    p_slot_ids,
    p_idempotency_key
  )
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
      and (
        b.payment_mode = 'PAY_AT_VENUE'
        or exists (
          select 1 from public.payments p
          where p.booking_id = b.id and p.status = 'SETTLED'
        )
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

revoke all on function private.create_pay_at_venue_booking(uuid, uuid[], text)
  from public, anon, authenticated, service_role;
grant usage on schema private to service_role;
grant execute on function private.create_pay_at_venue_booking(uuid, uuid[], text)
  to service_role;

revoke all on function public.create_pay_at_venue_booking(uuid, uuid[], text)
  from public, anon, authenticated, service_role;
grant execute on function public.create_pay_at_venue_booking(uuid, uuid[], text)
  to service_role;
