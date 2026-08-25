begin;

create extension if not exists pgtap with schema extensions;
select plan(47);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'venues', 'venues exists');
select has_table('public', 'courts', 'courts exists');
select has_table('public', 'booking_slots', 'booking_slots exists');
select has_table('public', 'bookings', 'bookings exists');
select has_table('public', 'booking_items', 'booking_items exists');
select has_table('public', 'payments', 'payments exists');
select has_table('public', 'reviews', 'reviews exists');
select has_table('public', 'notifications', 'notifications exists');
select has_table('public', 'audit_logs', 'audit_logs exists');

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.venues'::regclass), 'venues has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.courts'::regclass), 'courts has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.booking_slots'::regclass), 'booking_slots has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.bookings'::regclass), 'bookings has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.booking_items'::regclass), 'booking_items has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.payments'::regclass), 'payments has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.reviews'::regclass), 'reviews has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.notifications'::regclass), 'notifications has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass), 'audit_logs has RLS');

select is((select count(*)::integer from public.venues where status = 'APPROVED'), 6, 'seed has six approved venues');
select is((select count(*)::integer from public.venues where status = 'PENDING'), 1, 'seed has one pending venue');
select is((select role::text from public.profiles where id = '10000000-0000-4000-8000-000000000003'), 'ADMIN', 'seed admin role is trusted');

select lives_ok($test$
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000099',
    'authenticated', 'authenticated', 'untrusted-admin@padelku.id', crypt('PadelKuDev123!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Untrusted Admin","requested_role":"ADMIN"}',
    now(), now(), '', '', '', ''
  )
$test$, 'signup trigger accepts an ordinary user');
select is(
  (select role::text from public.profiles where id = '10000000-0000-4000-8000-000000000099'),
  'PLAYER',
  'untrusted ADMIN role request is downgraded to PLAYER'
);

select ok(not has_function_privilege('anon', 'public.create_booking(uuid,uuid[],text)', 'EXECUTE'), 'anon cannot execute create_booking');
select ok(not has_function_privilege('authenticated', 'public.create_booking(uuid,uuid[],text)', 'EXECUTE'), 'authenticated cannot execute create_booking');
select ok(has_function_privilege('service_role', 'public.create_booking(uuid,uuid[],text)', 'EXECUTE'), 'service role can execute create_booking');
select ok(not has_function_privilege('anon', 'public.transition_sandbox_payment(uuid,text,text,uuid,text,text)', 'EXECUTE'), 'anon cannot transition sandbox payments');
select ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prosecdef
    and (has_function_privilege('anon', p.oid, 'EXECUTE') or has_function_privilege('authenticated', p.oid, 'EXECUTE'))
), 'no public SECURITY DEFINER function is executable by client roles');

select ok(position('for update' in lower(pg_get_functiondef('public.create_booking(uuid,uuid[],text)'::regprocedure))) > 0, 'booking RPC locks rows');
select ok(position('order by s.id' in lower(pg_get_functiondef('public.create_booking(uuid,uuid[],text)'::regprocedure))) > 0, 'booking RPC locks in deterministic order');
select ok(exists (
  select 1 from pg_indexes where schemaname = 'public' and indexname = 'booking_items_active_slot_key'
    and indexdef ilike '%unique%' and indexdef ilike '%where%is_active%'
), 'active slot has a partial unique index');
select ok(exists (
  select 1 from pg_constraint
  where conrelid = 'public.booking_slots'::regclass
    and conname = 'booking_slots_no_overlap'
    and contype = 'x'
), 'court slot ranges cannot overlap');

set local role anon;
select is((select count(*)::integer from public.venues), 6, 'anon sees only approved venues');
reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}';
select is((select count(*)::integer from public.profiles), 1, 'player sees only own profile');
select is((select count(*)::integer from public.bookings), 3, 'player sees own bookings');
select throws_ok(
  $$update public.profiles set role = 'ADMIN' where id = '10000000-0000-4000-8000-000000000001'$$,
  '42501', null, 'player cannot update profile role column'
);
reset role;

select throws_ok(
  $$insert into public.reviews (booking_id, user_id, venue_id, rating) values (
    '40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002', 6
  )$$,
  '23514', null, 'review rating constraint rejects six stars'
);

select throws_ok($test$
  select * from public.create_booking(
    '10000000-0000-4000-8000-000000000001',
    array(
      select candidate.id
      from (
        select s.id, row_number() over (order by s.starts_at) as position
        from public.booking_slots s
        where s.court_id = '30000000-0000-4000-8000-000000000011'
          and s.status = 'AVAILABLE' and s.starts_at > now() + interval '1 day'
      ) candidate
      where candidate.position in (1, 3)
      order by candidate.position
    ),
    'pgtap-gapped-booking'
  )
$test$, '22023', 'slots must be contiguous', 'gapped slots are rejected');

select lives_ok($test$
  select * from public.create_booking(
    '10000000-0000-4000-8000-000000000001',
    array[(
      select id from public.booking_slots
      where court_id = '30000000-0000-4000-8000-000000000009'
        and status = 'AVAILABLE' and starts_at > now() + interval '1 day'
      order by starts_at limit 1
    )],
    'pgtap-first-booking'
  )
$test$, 'first atomic booking succeeds');

select throws_ok($test$
  select * from public.create_booking(
    '10000000-0000-4000-8000-000000000001',
    array[(
      select booking_slot_id from public.booking_items
      where booking_id = (select id from public.bookings where idempotency_key = 'pgtap-first-booking')
    )],
    'pgtap-second-booking'
  )
$test$, 'P0001', 'one or more slots are unavailable', 'same slot cannot be booked twice');

select is(
  public.cancel_booking(
    (select id from public.bookings where idempotency_key = 'pgtap-first-booking'),
    'PGTAP cancellation'
  )::text,
  'CANCELLED',
  'booking can be cancelled'
);
select is(
  public.cancel_booking(
    (select id from public.bookings where idempotency_key = 'pgtap-first-booking'),
    'PGTAP cancellation retry'
  )::text,
  'CANCELLED',
  'cancellation is idempotent'
);

select lives_ok($test$
  select * from public.create_booking(
    '10000000-0000-4000-8000-000000000001',
    array[(
      select id from public.booking_slots
      where court_id = '30000000-0000-4000-8000-000000000010'
        and status = 'AVAILABLE' and starts_at > now() + interval '1 day'
      order by starts_at limit 1
    )],
    'pgtap-payment-booking'
  )
$test$, 'payment test booking succeeds');
select lives_ok($test$
  select * from public.create_sandbox_payment(
    (select id from public.bookings where idempotency_key = 'pgtap-payment-booking'),
    '10000000-0000-4000-8000-000000000001',
    'QRIS',
    'pgtap-payment-intent'
  )
$test$, 'payment intent creation succeeds');
select lives_ok($test$
  select * from public.transition_sandbox_payment(
    (select id from public.payments where idempotency_key = 'pgtap-payment-intent'),
    'SETTLE',
    'pgtap-settlement-event',
    '10000000-0000-4000-8000-000000000003',
    'ADMIN',
    null
  )
$test$, 'sandbox settlement succeeds');

select * from finish();
rollback;
