create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.user_role as enum ('PLAYER', 'VENUE_OWNER', 'ADMIN');
create type public.venue_status as enum ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
create type public.booking_slot_status as enum ('AVAILABLE', 'LOCKED', 'BOOKED', 'BLOCKED');
create type public.booking_status as enum ('PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
create type public.payment_method as enum ('VA', 'EWALLET', 'QRIS');
create type public.payment_status as enum ('PENDING', 'SETTLED', 'FAILED', 'EXPIRED', 'REFUNDED');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
  phone text check (phone is null or phone ~ '^\+?[0-9][0-9 -]{7,19}$'),
  avatar_url text,
  role public.user_role not null default 'PLAYER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_format check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

create unique index profiles_email_key on public.profiles (lower(email));
create index profiles_role_idx on public.profiles (role);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 3 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 3000),
  address text not null check (char_length(btrim(address)) >= 10),
  city text not null check (char_length(btrim(city)) between 2 and 80),
  province text not null check (char_length(btrim(province)) between 2 and 80),
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),
  phone text,
  email text,
  image_urls text[] not null default '{}',
  facilities text[] not null default '{}',
  opening_time time not null default time '08:00',
  closing_time time not null default time '22:00',
  status public.venue_status not null default 'DRAFT',
  rejection_reason text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venues_hours_valid check (opening_time < closing_time),
  constraint venues_review_state_valid check (
    (status = 'DRAFT' and submitted_at is null and reviewed_at is null and reviewed_by is null and rejection_reason is null)
    or (status = 'PENDING' and submitted_at is not null and reviewed_at is null and reviewed_by is null and rejection_reason is null)
    or (status in ('APPROVED', 'SUSPENDED') and submitted_at is not null and reviewed_at is not null and reviewed_by is not null and rejection_reason is null)
    or (status = 'REJECTED' and submitted_at is not null and reviewed_at is not null and reviewed_by is not null and rejection_reason is not null)
  )
);

create index venues_owner_id_idx on public.venues (owner_id);
create index venues_reviewed_by_idx on public.venues (reviewed_by) where reviewed_by is not null;
create index venues_city_approved_idx on public.venues (city, name) where status = 'APPROVED';
create index venues_status_idx on public.venues (status);

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  court_number smallint not null check (court_number > 0),
  surface_type text not null default 'PANORAMIC' check (surface_type in ('PANORAMIC', 'STANDARD', 'SINGLE')),
  indoor boolean not null default true,
  price_per_hour_rupiah bigint not null check (price_per_hour_rupiah between 10000 and 100000000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, court_number),
  unique (venue_id, name)
);

create index courts_venue_id_idx on public.courts (venue_id);
create index courts_active_venue_idx on public.courts (venue_id, court_number) where is_active;

create table public.booking_slots (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price_rupiah bigint not null check (price_rupiah between 10000 and 100000000),
  status public.booking_slot_status not null default 'AVAILABLE',
  locked_by uuid references public.profiles (id) on delete set null,
  locked_at timestamptz,
  lock_expires_at timestamptz,
  lock_booking_id uuid,
  blocked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (court_id, starts_at, ends_at),
  constraint booking_slots_time_valid check (
    ends_at > starts_at and ends_at <= starts_at + interval '4 hours'
  ),
  constraint booking_slots_state_valid check (
    (status = 'AVAILABLE' and locked_by is null and locked_at is null and lock_expires_at is null and lock_booking_id is null and blocked_reason is null)
    or (status = 'LOCKED' and locked_by is not null and locked_at is not null and lock_expires_at > locked_at and lock_booking_id is not null and blocked_reason is null)
    or (status = 'BOOKED' and locked_by is null and locked_at is null and lock_expires_at is null and lock_booking_id is not null and blocked_reason is null)
    or (status = 'BLOCKED' and locked_by is null and locked_at is null and lock_expires_at is null and lock_booking_id is null and blocked_reason is not null)
  )
);

create index booking_slots_court_starts_idx on public.booking_slots (court_id, starts_at);
create index booking_slots_available_idx on public.booking_slots (starts_at, court_id) where status = 'AVAILABLE';
create index booking_slots_expired_locks_idx on public.booking_slots (lock_expires_at, id) where status = 'LOCKED';
alter table public.booking_slots add constraint booking_slots_no_overlap
  exclude using gist (court_id with =, tstzrange(starts_at, ends_at, '[)') with &&);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique default ('PK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  user_id uuid not null references public.profiles (id) on delete restrict,
  venue_id uuid not null references public.venues (id) on delete restrict,
  status public.booking_status not null default 'PENDING_PAYMENT',
  total_price_rupiah bigint not null check (total_price_rupiah > 0),
  payment_expires_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  confirmed_at timestamptz,
  completed_at timestamptz,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_idempotency_key_valid check (idempotency_key is null or char_length(idempotency_key) between 8 and 100),
  constraint bookings_state_valid check (
    (status = 'PENDING_PAYMENT' and payment_expires_at is not null and cancelled_at is null and confirmed_at is null and completed_at is null)
    or (status = 'CONFIRMED' and payment_expires_at is null and cancelled_at is null and confirmed_at is not null and completed_at is null)
    or (status = 'COMPLETED' and payment_expires_at is null and cancelled_at is null and confirmed_at is not null and completed_at is not null)
    or (status = 'CANCELLED' and payment_expires_at is null and cancelled_at is not null and cancellation_reason is not null and completed_at is null)
  )
);

create unique index bookings_user_idempotency_key on public.bookings (user_id, idempotency_key) where idempotency_key is not null;
create index bookings_user_created_idx on public.bookings (user_id, created_at desc);
create index bookings_venue_created_idx on public.bookings (venue_id, created_at desc);
create index bookings_pending_expiry_idx on public.bookings (payment_expires_at, id) where status = 'PENDING_PAYMENT';

alter table public.booking_slots
  add constraint booking_slots_lock_booking_id_fkey
  foreign key (lock_booking_id) references public.bookings (id) on delete restrict;
create index booking_slots_lock_booking_id_idx on public.booking_slots (lock_booking_id) where lock_booking_id is not null;

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  booking_slot_id uuid not null references public.booking_slots (id) on delete restrict,
  court_id uuid not null references public.courts (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price_rupiah bigint not null check (price_rupiah > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (booking_id, booking_slot_id),
  constraint booking_items_time_valid check (ends_at > starts_at)
);

create unique index booking_items_active_slot_key on public.booking_items (booking_slot_id) where is_active;
create index booking_items_booking_id_idx on public.booking_items (booking_id);
create index booking_items_court_id_idx on public.booking_items (court_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  method public.payment_method not null,
  provider text not null check (char_length(btrim(provider)) between 2 and 50),
  external_transaction_id text not null unique check (char_length(btrim(external_transaction_id)) between 4 and 150),
  amount_rupiah bigint not null check (amount_rupiah > 0),
  status public.payment_status not null default 'PENDING',
  provider_payload jsonb not null default '{}',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_state_valid check (
    (status = 'SETTLED' and paid_at is not null) or (status <> 'SETTLED' and paid_at is null)
  )
);

create index payments_booking_id_idx on public.payments (booking_id);
create index payments_pending_idx on public.payments (created_at) where status = 'PENDING';

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete restrict,
  venue_id uuid not null references public.venues (id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(btrim(comment)) between 3 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_user_id_idx on public.reviews (user_id);
create index reviews_venue_created_idx on public.reviews (venue_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('BOOKING', 'PAYMENT', 'VENUE', 'SYSTEM')),
  title text not null check (char_length(btrim(title)) between 2 and 150),
  message text not null check (char_length(btrim(message)) between 2 and 2000),
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_role text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE', 'BOOKING_EXPIRED', 'BOOKING_CANCELLED', 'PAYMENT_CONFIRMED')),
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_logs_record_idx on public.audit_logs (table_name, record_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc) where actor_id is not null;
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create function private.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = (select auth.uid())
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and coalesce((select private.current_role()) = 'ADMIN', false)
$$;

create function private.owns_venue(target_venue_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.venues v
    where v.id = target_venue_id and v.owner_id = (select auth.uid())
  )
$$;

create function private.can_manage_venue_image(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folder text := split_part(object_name, '/', 1);
begin
  if folder !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return false;
  end if;
  return (select private.is_admin()) or (select private.owns_venue(folder::uuid));
end;
$$;

create function private.assert_server_role()
returns void
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  claims jsonb := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
begin
  if session_user not in ('postgres', 'supabase_admin') and claims ->> 'role' <> 'service_role' then
    raise exception 'server role required' using errcode = '42501';
  end if;
end;
$$;

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text := upper(coalesce(new.raw_user_meta_data ->> 'requested_role', 'PLAYER'));
  trusted_role text := upper(coalesce(new.raw_app_meta_data ->> 'role', ''));
  profile_role public.user_role;
begin
  profile_role := case
    when trusted_role = 'ADMIN' then 'ADMIN'::public.user_role
    when requested_role = 'VENUE_OWNER' then 'VENUE_OWNER'::public.user_role
    else 'PLAYER'::public.user_role
  end;

  insert into public.profiles (id, email, full_name, phone, avatar_url, role)
  values (
    new.id,
    lower(new.email),
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    nullif(btrim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    profile_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create function private.validate_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.bookings b
    where b.id = new.booking_id
      and b.user_id = new.user_id
      and b.venue_id = new.venue_id
      and b.status = 'COMPLETED'
  ) then
    raise exception 'review requires the player''s completed booking at this venue' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger reviews_validate_booking
before insert or update of booking_id, user_id, venue_id on public.reviews
for each row execute function private.validate_review();

create function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id uuid;
  claims jsonb := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
begin
  row_id := case when tg_op = 'DELETE' then old.id else new.id end;
  insert into public.audit_logs (actor_id, actor_role, action, table_name, record_id, old_data, new_data)
  values (
    (select auth.uid()),
    coalesce(claims ->> 'role', current_user),
    tg_op,
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger venues_set_updated_at before update on public.venues for each row execute function private.set_updated_at();
create trigger courts_set_updated_at before update on public.courts for each row execute function private.set_updated_at();
create trigger booking_slots_set_updated_at before update on public.booking_slots for each row execute function private.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings for each row execute function private.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function private.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews for each row execute function private.set_updated_at();

create trigger profiles_audit after insert or update or delete on public.profiles for each row execute function private.audit_row_change();
create trigger venues_audit after insert or update or delete on public.venues for each row execute function private.audit_row_change();
create trigger courts_audit after insert or update or delete on public.courts for each row execute function private.audit_row_change();
create trigger bookings_audit after insert or update or delete on public.bookings for each row execute function private.audit_row_change();
create trigger payments_audit after insert or update or delete on public.payments for each row execute function private.audit_row_change();
create trigger reviews_audit after insert or update or delete on public.reviews for each row execute function private.audit_row_change();

create function public.create_booking(
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
begin
  perform private.assert_server_role();

  slot_count := coalesce(cardinality(p_slot_ids), 0);
  if slot_count < 1 or slot_count > 8 then
    raise exception 'between 1 and 8 slots are required' using errcode = '22023';
  end if;
  if p_idempotency_key is not null and char_length(p_idempotency_key) not between 8 and 100 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  select count(distinct value) into distinct_count from unnest(p_slot_ids) value;
  if distinct_count <> slot_count then
    raise exception 'duplicate slot ids are not allowed' using errcode = '22023';
  end if;

  if p_idempotency_key is not null then
    select b.* into new_booking
    from public.bookings b
    where b.user_id = p_user_id and b.idempotency_key = p_idempotency_key
    for update;
    if found then
      return query select new_booking.id, new_booking.booking_code, new_booking.total_price_rupiah, new_booking.payment_expires_at;
      return;
    end if;
  end if;

  if not exists (select 1 from public.profiles p where p.id = p_user_id and p.role = 'PLAYER') then
    raise exception 'booking user must be a PLAYER' using errcode = '42501';
  end if;

  -- Lifecycle functions lock bookings before slots; use the same order here to avoid deadlocks.
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

  select count(distinct s.court_id), (array_agg(distinct s.court_id))[1], min(s.starts_at), max(s.ends_at),
         sum(s.ends_at - s.starts_at), sum(s.price_rupiah)
  into distinct_count, selected_court_id, first_start, last_end, total_duration, calculated_total
  from public.booking_slots s
  where s.id = any(p_slot_ids);

  if distinct_count <> 1 then
    raise exception 'all slots must belong to the same court' using errcode = '22023';
  end if;
  if first_start <= now() then
    raise exception 'all slots must be in the future' using errcode = '22023';
  end if;
  if last_end - first_start <> total_duration then
    raise exception 'slots must be contiguous' using errcode = '22023';
  end if;
  if exists (
    select 1
    from (
      select s.starts_at, lag(s.ends_at) over (order by s.starts_at, s.id) as previous_end
      from public.booking_slots s
      where s.id = any(p_slot_ids)
    ) ordered_slots
    where ordered_slots.previous_end is not null
      and ordered_slots.starts_at <> ordered_slots.previous_end
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
    user_id, venue_id, total_price_rupiah, payment_expires_at, idempotency_key
  ) values (
    p_user_id, selected_venue_id, calculated_total, now() + interval '10 minutes', p_idempotency_key
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
      lock_expires_at = new_booking.payment_expires_at, lock_booking_id = new_booking.id,
      updated_at = now()
  where s.id = any(p_slot_ids);

  insert into public.notifications (user_id, type, title, message, data)
  values (
    p_user_id, 'BOOKING', 'Menunggu pembayaran',
    'Selesaikan pembayaran dalam 10 menit agar jadwal tetap tersedia.',
    jsonb_build_object('booking_id', new_booking.id)
  );

  return query select new_booking.id, new_booking.booking_code, new_booking.total_price_rupiah, new_booking.payment_expires_at;
end;
$$;

create function public.cancel_booking(p_booking_id uuid, p_reason text, p_actor_id uuid default null)
returns public.booking_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.bookings%rowtype;
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

  update public.booking_items set is_active = false where booking_id = p_booking_id and is_active;
  update public.booking_slots
  set status = 'AVAILABLE', locked_by = null, locked_at = null, lock_expires_at = null,
      lock_booking_id = null, blocked_reason = null, updated_at = now()
  where lock_booking_id = p_booking_id and status in ('LOCKED', 'BOOKED');
  update public.bookings
  set status = 'CANCELLED', payment_expires_at = null, cancelled_at = now(),
      cancellation_reason = btrim(p_reason), updated_at = now()
  where id = p_booking_id;

  insert into public.audit_logs (actor_id, actor_role, action, table_name, record_id, metadata)
  values (p_actor_id, 'service_role', 'BOOKING_CANCELLED', 'bookings', p_booking_id, jsonb_build_object('reason', btrim(p_reason)));
  return 'CANCELLED'::public.booking_status;
end;
$$;

create function public.expire_booking(p_booking_id uuid)
returns public.booking_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.bookings%rowtype;
begin
  perform private.assert_server_role();
  select * into target from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking not found' using errcode = 'P0002'; end if;
  if target.status = 'CANCELLED' then return target.status; end if;
  if target.status <> 'PENDING_PAYMENT' then return target.status; end if;
  if target.payment_expires_at > now() then return target.status; end if;

  update public.booking_items set is_active = false where booking_id = p_booking_id and is_active;
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

create function public.expire_pending_bookings(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
  expired_count integer := 0;
begin
  perform private.assert_server_role();
  if p_limit not between 1 and 500 then
    raise exception 'limit must be between 1 and 500' using errcode = '22023';
  end if;
  for target_id in
    select b.id from public.bookings b
    where b.status = 'PENDING_PAYMENT' and b.payment_expires_at <= now()
    order by b.payment_expires_at, b.id
    for update skip locked
    limit p_limit
  loop
    perform public.expire_booking(target_id);
    expired_count := expired_count + 1;
  end loop;
  return expired_count;
end;
$$;

create function public.confirm_payment(
  p_booking_id uuid,
  p_external_transaction_id text,
  p_method public.payment_method,
  p_amount_rupiah bigint,
  p_provider text,
  p_provider_payload jsonb default '{}'
)
returns table (booking_id uuid, booking_status public.booking_status, payment_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.bookings%rowtype;
  existing_payment public.payments%rowtype;
  new_payment public.payments%rowtype;
begin
  perform private.assert_server_role();
  if nullif(btrim(p_external_transaction_id), '') is null or nullif(btrim(p_provider), '') is null then
    raise exception 'payment identifiers are required' using errcode = '22023';
  end if;

  select * into target from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking not found' using errcode = 'P0002'; end if;

  select * into existing_payment
  from public.payments where external_transaction_id = p_external_transaction_id
  for update;
  if found then
    if existing_payment.booking_id <> p_booking_id
       or existing_payment.amount_rupiah <> p_amount_rupiah
       or existing_payment.status <> 'SETTLED' then
      raise exception 'payment idempotency conflict' using errcode = '23505';
    end if;
    return query select target.id, target.status, existing_payment.id;
    return;
  end if;

  if target.status = 'CANCELLED' then
    raise exception 'cancelled booking cannot be paid' using errcode = '23514';
  end if;
  if target.status in ('CONFIRMED', 'COMPLETED') then
    raise exception 'booking already has a confirmed payment' using errcode = '23505';
  end if;
  if target.payment_expires_at <= now() then
    perform public.expire_booking(p_booking_id);
    raise exception 'booking payment window has expired' using errcode = '23514';
  end if;
  if p_amount_rupiah <> target.total_price_rupiah then
    raise exception 'payment amount does not match booking total' using errcode = '23514';
  end if;

  insert into public.payments (
    booking_id, method, provider, external_transaction_id, amount_rupiah,
    status, provider_payload, paid_at
  ) values (
    p_booking_id, p_method, btrim(p_provider), btrim(p_external_transaction_id),
    p_amount_rupiah, 'SETTLED', coalesce(p_provider_payload, '{}'), now()
  ) returning * into new_payment;

  update public.booking_slots
  set status = 'BOOKED', locked_by = null, locked_at = null, lock_expires_at = null, updated_at = now()
  where lock_booking_id = p_booking_id and status = 'LOCKED';
  if not found then
    raise exception 'booking no longer owns its slots' using errcode = '23514';
  end if;

  update public.bookings
  set status = 'CONFIRMED', payment_expires_at = null, confirmed_at = now(), updated_at = now()
  where id = p_booking_id returning * into target;
  insert into public.notifications (user_id, type, title, message, data)
  values (
    target.user_id, 'PAYMENT', 'Pembayaran berhasil',
    'Pembayaran diterima dan jadwal bermain telah dikonfirmasi.',
    jsonb_build_object('booking_id', target.id, 'payment_id', new_payment.id)
  );
  insert into public.audit_logs (actor_role, action, table_name, record_id, metadata)
  values ('service_role', 'PAYMENT_CONFIRMED', 'bookings', target.id, jsonb_build_object('payment_id', new_payment.id));
  return query select target.id, target.status, new_payment.id;
end;
$$;

revoke all on function private.current_role() from public, anon;
revoke all on function private.is_admin() from public, anon;
revoke all on function private.owns_venue(uuid) from public, anon;
revoke all on function private.can_manage_venue_image(text) from public, anon;
revoke all on function private.assert_server_role() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated, service_role;
revoke all on function private.handle_new_user() from public, anon, authenticated, service_role;
revoke all on function private.validate_review() from public, anon, authenticated, service_role;
revoke all on function private.audit_row_change() from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant execute on function private.current_role(), private.is_admin(), private.owns_venue(uuid), private.can_manage_venue_image(text) to authenticated;

revoke all on function public.create_booking(uuid, uuid[], text) from public, anon, authenticated;
revoke all on function public.cancel_booking(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.expire_booking(uuid) from public, anon, authenticated;
revoke all on function public.expire_pending_bookings(integer) from public, anon, authenticated;
revoke all on function public.confirm_payment(uuid, text, public.payment_method, bigint, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_booking(uuid, uuid[], text) to service_role;
grant execute on function public.cancel_booking(uuid, text, uuid) to service_role;
grant execute on function public.expire_booking(uuid) to service_role;
grant execute on function public.expire_pending_bookings(integer) to service_role;
grant execute on function public.confirm_payment(uuid, text, public.payment_method, bigint, text, jsonb) to service_role;

alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.courts enable row level security;
alter table public.booking_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_self_or_admin on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_update_self_or_admin on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select private.is_admin()))
with check (id = (select auth.uid()) or (select private.is_admin()));

create policy venues_public_approved on public.venues for select to anon
using (status = 'APPROVED');
create policy venues_authenticated_read on public.venues for select to authenticated
using (status = 'APPROVED' or owner_id = (select auth.uid()) or (select private.is_admin()));
create policy venues_owner_insert on public.venues for insert to authenticated
with check (owner_id = (select auth.uid()) and (select private.current_role()) = 'VENUE_OWNER' and status in ('DRAFT', 'PENDING'));
create policy venues_owner_or_admin_update on public.venues for update to authenticated
using (owner_id = (select auth.uid()) or (select private.is_admin()))
with check ((owner_id = (select auth.uid()) and status in ('DRAFT', 'PENDING')) or (select private.is_admin()));
create policy venues_owner_or_admin_delete on public.venues for delete to authenticated
using ((owner_id = (select auth.uid()) and status = 'DRAFT') or (select private.is_admin()));

create policy courts_public_active on public.courts for select to anon
using (is_active and exists (select 1 from public.venues v where v.id = venue_id and v.status = 'APPROVED'));
create policy courts_authenticated_read on public.courts for select to authenticated
using (
  (is_active and exists (select 1 from public.venues v where v.id = venue_id and v.status = 'APPROVED'))
  or (select private.owns_venue(venue_id)) or (select private.is_admin())
);
create policy courts_owner_insert on public.courts for insert to authenticated
with check ((select private.owns_venue(venue_id)) or (select private.is_admin()));
create policy courts_owner_update on public.courts for update to authenticated
using ((select private.owns_venue(venue_id)) or (select private.is_admin()))
with check ((select private.owns_venue(venue_id)) or (select private.is_admin()));
create policy courts_owner_delete on public.courts for delete to authenticated
using ((select private.owns_venue(venue_id)) or (select private.is_admin()));

create policy slots_public_available on public.booking_slots for select to anon
using (
  starts_at > now() and status = 'AVAILABLE' and exists (
    select 1 from public.courts c join public.venues v on v.id = c.venue_id
    where c.id = court_id and c.is_active and v.status = 'APPROVED'
  )
);
create policy slots_authenticated_read on public.booking_slots for select to authenticated
using (
  (starts_at > now() and status = 'AVAILABLE' and exists (
    select 1 from public.courts c join public.venues v on v.id = c.venue_id
    where c.id = court_id and c.is_active and v.status = 'APPROVED'
  ))
  or locked_by = (select auth.uid())
  or exists (select 1 from public.courts c where c.id = court_id and (select private.owns_venue(c.venue_id)))
  or (select private.is_admin())
);

create policy bookings_participant_read on public.bookings for select to authenticated
using (user_id = (select auth.uid()) or (select private.owns_venue(venue_id)) or (select private.is_admin()));
create policy booking_items_participant_read on public.booking_items for select to authenticated
using (exists (
  select 1 from public.bookings b where b.id = booking_id
    and (b.user_id = (select auth.uid()) or (select private.owns_venue(b.venue_id)) or (select private.is_admin()))
));
create policy payments_participant_read on public.payments for select to authenticated
using (exists (
  select 1 from public.bookings b where b.id = booking_id
    and (b.user_id = (select auth.uid()) or (select private.owns_venue(b.venue_id)) or (select private.is_admin()))
));

create policy reviews_public_read on public.reviews for select to anon, authenticated using (true);
create policy reviews_player_insert on public.reviews for insert to authenticated
with check (
  user_id = (select auth.uid()) and exists (
    select 1 from public.bookings b where b.id = booking_id and b.user_id = (select auth.uid())
      and b.venue_id = venue_id and b.status = 'COMPLETED'
  )
);
create policy reviews_player_update on public.reviews for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy reviews_player_delete on public.reviews for delete to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy notifications_own_read on public.notifications for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy notifications_own_update on public.notifications for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy audit_logs_admin_read on public.audit_logs for select to authenticated
using ((select private.is_admin()));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.venues, public.courts, public.booking_slots, public.reviews to anon;
grant select on public.profiles, public.venues, public.courts, public.booking_slots,
  public.bookings, public.booking_items, public.payments, public.reviews,
  public.notifications, public.audit_logs to authenticated;
grant insert on public.venues, public.courts, public.reviews to authenticated;
grant delete on public.venues, public.courts, public.reviews to authenticated;
grant update (
  full_name, phone, avatar_url
) on public.profiles to authenticated;
grant update (
  name, slug, description, address, city, province, latitude, longitude, phone, email,
  image_urls, facilities, opening_time, closing_time, status, submitted_at
) on public.venues to authenticated;
grant update (
  reviewed_at, reviewed_by, rejection_reason
) on public.venues to authenticated;
grant update (name, court_number, surface_type, indoor, price_per_hour_rupiah, is_active) on public.courts to authenticated;
grant update (rating, comment) on public.reviews to authenticated;
grant update (read_at) on public.notifications to authenticated;

do $storage$
begin
  if to_regclass('storage.buckets') is not null and to_regclass('storage.objects') is not null then
    execute $sql$
      insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      values ('venue-images', 'venue-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
      on conflict (id) do update set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types
    $sql$;
    execute 'create policy "venue images owner insert" on storage.objects for insert to authenticated with check (bucket_id = ''venue-images'' and (select private.can_manage_venue_image(name)))';
    execute 'create policy "venue images owner update" on storage.objects for update to authenticated using (bucket_id = ''venue-images'' and (select private.can_manage_venue_image(name))) with check (bucket_id = ''venue-images'' and (select private.can_manage_venue_image(name)))';
    execute 'create policy "venue images owner delete" on storage.objects for delete to authenticated using (bucket_id = ''venue-images'' and (select private.can_manage_venue_image(name)))';
  end if;
exception
  when insufficient_privilege or undefined_table then
    raise notice 'Storage schema is unavailable; venue-images bucket policies were skipped';
end;
$storage$;
