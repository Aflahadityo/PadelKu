begin;

select plan(44);

select has_table('public', 'payment_events', 'payment_events exists');
select has_table('public', 'payment_disputes', 'payment_disputes exists');
select has_table('private', 'payment_sandbox_settings', 'private sandbox settings exists');
select has_column('public', 'payments', 'commission_bps', 'commission snapshot exists');
select has_column('public', 'payments', 'commission_rupiah', 'commission amount exists');
select has_column('public', 'payments', 'venue_net_rupiah', 'venue net exists');
select has_column('public', 'payments', 'refunded_at', 'refund history exists');
select has_function('public', 'create_sandbox_payment', array['uuid', 'uuid', 'payment_method', 'text'], 'create sandbox RPC exists');
select has_function('public', 'transition_sandbox_payment', array['uuid', 'text', 'text', 'uuid', 'text', 'text'], 'transition RPC exists');
select has_function('public', 'complete_finished_bookings', array['integer'], 'completion job exists');
select ok((select relrowsecurity from pg_class where oid = 'public.payment_events'::regclass), 'payment events use RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.payment_disputes'::regclass), 'payment disputes use RLS');
select col_is_fk('public', 'payment_events', 'payment_id', 'events reference payments');
select col_is_fk('public', 'payment_disputes', 'payment_id', 'disputes reference payments');
set local role authenticated;
select throws_ok(
  $$ select * from public.create_sandbox_payment('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'VA', 'client-call-blocked') $$,
  '42501', null, 'client context cannot call server mutation RPC'
);
reset role;
select ok(
  (select commission_rupiah + venue_net_rupiah = amount_rupiah from public.payments where id = '70000000-0000-4000-8000-000000000001'),
  'seed payment preserves gross split invariant'
);

select has_column('public', 'bookings', 'initial_payment_expires_at', 'booking keeps immutable initial expiry');
select has_column('public', 'payment_events', 'request_payload', 'events keep request fingerprints');
select has_column('public', 'payment_events', 'booking_status', 'events keep response snapshots');
select has_function('public', 'run_backend_maintenance', array['integer'], 'maintenance RPC exists');
select ok(
  not has_function_privilege('authenticated', 'public.run_backend_maintenance(integer)', 'EXECUTE'),
  'clients cannot execute maintenance'
);
select ok(
  exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'payments_one_pending_booking'),
  'one pending payment per booking is enforced'
);

select lives_ok($test$
  select * from public.create_booking(
    '10000000-0000-4000-8000-000000000001',
    array[(
      select id from public.booking_slots
      where court_id = '30000000-0000-4000-8000-000000000009'
        and status = 'AVAILABLE' and starts_at > now() + interval '1 day'
      order by starts_at limit 1
    )],
    'pgtap-hardened-booking'
  )
$test$, 'hardened booking creation succeeds');

select lives_ok($test$
  select * from public.create_booking(
    '10000000-0000-4000-8000-000000000001',
    array[(
      select booking_slot_id from public.booking_items
      where booking_id = (select id from public.bookings where idempotency_key = 'pgtap-hardened-booking')
    )],
    'pgtap-hardened-booking'
  )
$test$, 'same booking idempotency payload is replayable');

select throws_ok($test$
  select * from public.create_booking(
    '10000000-0000-4000-8000-000000000001',
    array[(
      select id from public.booking_slots
      where court_id = '30000000-0000-4000-8000-000000000009'
        and status = 'AVAILABLE' and starts_at > now() + interval '1 day'
      order by starts_at limit 1
    )],
    'pgtap-hardened-booking'
  )
$test$, '23505', 'booking idempotency conflict', 'booking key rejects a different slot payload');

select lives_ok($test$
  select * from public.create_sandbox_payment(
    (select id from public.bookings where idempotency_key = 'pgtap-hardened-booking'),
    '10000000-0000-4000-8000-000000000001', 'VA', 'pgtap-hardened-payment'
  )
$test$, 'first pending payment succeeds');

select throws_ok($test$
  select * from public.create_sandbox_payment(
    (select id from public.bookings where idempotency_key = 'pgtap-hardened-booking'),
    '10000000-0000-4000-8000-000000000001', 'QRIS', 'pgtap-second-pending'
  )
$test$, '23505', 'booking already has a pending payment', 'second pending payment is rejected');

select lives_ok($test$
  select * from public.transition_sandbox_payment(
    (select id from public.payments where idempotency_key = 'pgtap-hardened-payment'),
    'FAIL', 'pgtap-hardened-failure',
    '10000000-0000-4000-8000-000000000001', 'PLAYER', 'Simulated decline'
  )
$test$, 'payment failure transition succeeds');

select throws_ok($test$
  select * from public.transition_sandbox_payment(
    (select id from public.payments where idempotency_key = 'pgtap-hardened-payment'),
    'SETTLE', 'pgtap-hardened-failure',
    '10000000-0000-4000-8000-000000000001', 'PLAYER', null
  )
$test$, '23505', 'payment idempotency conflict', 'transition key rejects a different command');

select is(
  (select status::text from public.payments where idempotency_key = 'pgtap-hardened-payment'),
  'FAILED',
  'failed transition persists terminal payment state'
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
    'pgtap-cancel-sync-booking'
  )
$test$, 'cancellation sync booking succeeds');

select lives_ok($test$
  select * from public.create_sandbox_payment(
    (select id from public.bookings where idempotency_key = 'pgtap-cancel-sync-booking'),
    '10000000-0000-4000-8000-000000000001', 'EWALLET', 'pgtap-cancel-sync-payment'
  )
$test$, 'cancellation sync payment succeeds');

select is(
  public.cancel_booking(
    (select id from public.bookings where idempotency_key = 'pgtap-cancel-sync-booking'),
    'Player cancelled pending booking',
    '10000000-0000-4000-8000-000000000001'
  )::text,
  'CANCELLED',
  'pending booking cancellation succeeds'
);

select is(
  (select status::text from public.payments where idempotency_key = 'pgtap-cancel-sync-payment'),
  'FAILED',
  'booking cancellation terminalizes pending payment'
);

select lives_ok($test$
  select * from public.create_booking(
    '10000000-0000-4000-8000-000000000001',
    array[(
      select id from public.booking_slots
      where court_id = '30000000-0000-4000-8000-000000000011'
        and status = 'AVAILABLE' and starts_at > now() + interval '1 day'
      order by starts_at limit 1
    )],
    'pgtap-expiry-sync-booking'
  )
$test$, 'expiry sync booking succeeds');

select lives_ok($test$
  select * from public.create_sandbox_payment(
    (select id from public.bookings where idempotency_key = 'pgtap-expiry-sync-booking'),
    '10000000-0000-4000-8000-000000000001', 'QRIS', 'pgtap-expiry-sync-payment'
  )
$test$, 'expiry sync payment succeeds');

update public.payments
set expires_at = now() - interval '1 second'
where idempotency_key = 'pgtap-expiry-sync-payment';
update public.bookings
set payment_expires_at = now() - interval '1 second'
where idempotency_key = 'pgtap-expiry-sync-booking';

select is(
  public.expire_booking(
    (select id from public.bookings where idempotency_key = 'pgtap-expiry-sync-booking')
  )::text,
  'CANCELLED',
  'expired booking is cancelled'
);

select is(
  (select status::text from public.payments where idempotency_key = 'pgtap-expiry-sync-payment'),
  'EXPIRED',
  'booking expiry terminalizes pending payment'
);

select throws_ok(
  $$select public.cancel_booking(
    '40000000-0000-4000-8000-000000000002',
    'Attempt direct paid cancellation',
    '10000000-0000-4000-8000-000000000001'
  )$$,
  '23514', 'settled booking requires refund before cancellation',
  'settled booking cannot bypass refund'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}';
select ok(
  (select gross_settled_rupiah > 0 from public.get_owner_financial_aggregates(null, null)),
  'owner aggregate includes all settled payments'
);
reset role;

set local role anon;
select ok(
  (select count(*) > 0 from public.get_venue_availability(
    '20000000-0000-4000-8000-000000000002', now(), now() + interval '7 days'
  ) where status = 'BOOKED'),
  'public availability exposes occupied status without lock metadata'
);
reset role;

select is(
  (select request_payload ->> 'command' from public.payment_events where idempotency_key = 'pgtap-hardened-failure'),
  'FAIL',
  'event stores canonical request fingerprint'
);

select is(
  (select booking_status::text from public.payment_events where idempotency_key = 'pgtap-hardened-failure'),
  'PENDING_PAYMENT',
  'event stores replay-stable booking response'
);

select ok(
  not exists (
    select 1 from public.payments
    where status = 'PENDING'
    group by booking_id having count(*) > 1
  ),
  'no booking has duplicate pending attempts'
);

select * from finish();
rollback;
