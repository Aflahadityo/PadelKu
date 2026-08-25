-- Local development credentials (do not use these passwords outside the local stack):
-- player@padelku.id / PadelKuDev123!
-- owner@padelku.id  / PadelKuDev123!
-- admin@padelku.id  / PadelKuDev123!

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
values
  (
    '00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', 'player@padelku.id', crypt('PadelKuDev123!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Raka Pratama","phone":"+6281211110001","requested_role":"PLAYER"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', 'owner@padelku.id', crypt('PadelKuDev123!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Nadia Santoso","phone":"+6281211110002","requested_role":"VENUE_OWNER"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000003',
    'authenticated', 'authenticated', 'admin@padelku.id', crypt('PadelKuDev123!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"],"role":"ADMIN"}',
    '{"full_name":"Admin PadelKu","phone":"+6281211110003","requested_role":"ADMIN"}',
    now(), now(), '', '', '', ''
  )
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
values
  (
    '11000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '{"sub":"10000000-0000-4000-8000-000000000001","email":"player@padelku.id","email_verified":true}',
    'email', now(), now(), now()
  ),
  (
    '11000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '{"sub":"10000000-0000-4000-8000-000000000002","email":"owner@padelku.id","email_verified":true}',
    'email', now(), now(), now()
  ),
  (
    '11000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    '{"sub":"10000000-0000-4000-8000-000000000003","email":"admin@padelku.id","email_verified":true}',
    'email', now(), now(), now()
  )
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

-- The explicit upsert also repairs profiles when this seed is rerun after users already exist.
insert into public.profiles (id, email, full_name, phone, role)
values
  ('10000000-0000-4000-8000-000000000001', 'player@padelku.id', 'Raka Pratama', '+6281211110001', 'PLAYER'),
  ('10000000-0000-4000-8000-000000000002', 'owner@padelku.id', 'Nadia Santoso', '+6281211110002', 'VENUE_OWNER'),
  ('10000000-0000-4000-8000-000000000003', 'admin@padelku.id', 'Admin PadelKu', '+6281211110003', 'ADMIN')
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  phone = excluded.phone,
  role = excluded.role,
  updated_at = now();

insert into public.venues (
  id, owner_id, name, slug, description, address, city, province,
  latitude, longitude, phone, email, facilities, opening_time, closing_time,
  status, submitted_at, reviewed_at, reviewed_by
)
values
  (
    '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002',
    'Padel House Kemang', 'padel-house-kemang', 'Klub padel indoor dengan empat lapangan panoramik dan area pemulihan.',
    'Jl. Kemang Raya No. 45, Bangka', 'Jakarta Selatan', 'DKI Jakarta', -6.263500, 106.814700,
    '+62217654321', 'kemang@padelku.id', array['Parkir', 'Mushola', 'Kafe', 'Pro Shop', 'Shower'],
    '07:00', '23:00', 'APPROVED', now() - interval '120 days', now() - interval '118 days', '10000000-0000-4000-8000-000000000003'
  ),
  (
    '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002',
    'Arena Padel BSD', 'arena-padel-bsd', 'Arena semi-outdoor untuk permainan komunitas dan kompetisi akhir pekan.',
    'Jl. BSD Raya Utama No. 12, Pagedangan', 'Tangerang', 'Banten', -6.300600, 106.652000,
    '+62219876543', 'bsd@padelku.id', array['Parkir', 'Kafe', 'Locker', 'Racket Rental'],
    '08:00', '22:00', 'APPROVED', now() - interval '100 days', now() - interval '98 days', '10000000-0000-4000-8000-000000000003'
  ),
  (
    '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002',
    'Canggu Padel Club', 'canggu-padel-club', 'Klub tropis dengan lapangan panoramik, kafe, dan sesi coaching harian.',
    'Jl. Pantai Batu Bolong No. 88, Canggu', 'Badung', 'Bali', -8.650000, 115.133300,
    '+62361473829', 'canggu@padelku.id', array['Kafe', 'Kolam Renang', 'Pro Shop', 'Coaching'],
    '07:00', '22:00', 'APPROVED', now() - interval '90 days', now() - interval '89 days', '10000000-0000-4000-8000-000000000003'
  ),
  (
    '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002',
    'Padel Studio Bandung', 'padel-studio-bandung', 'Studio indoor ber-AC dekat Dago dengan kelas pemula terjadwal.',
    'Jl. Ir. H. Juanda No. 156, Coblong', 'Bandung', 'Jawa Barat', -6.887500, 107.613000,
    '+62225647382', 'bandung@padelku.id', array['Parkir', 'Mushola', 'Shower', 'Coaching'],
    '08:00', '22:00', 'APPROVED', now() - interval '75 days', now() - interval '74 days', '10000000-0000-4000-8000-000000000003'
  ),
  (
    '20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002',
    'Surabaya Padel Center', 'surabaya-padel-center', 'Pusat padel keluarga dengan tiga lapangan dan tribun kecil.',
    'Jl. Mayjen Sungkono No. 78, Dukuh Pakis', 'Surabaya', 'Jawa Timur', -7.289200, 112.734000,
    '+62313847562', 'surabaya@padelku.id', array['Parkir', 'Kantin', 'Tribun', 'Racket Rental'],
    '07:00', '23:00', 'APPROVED', now() - interval '60 days', now() - interval '58 days', '10000000-0000-4000-8000-000000000003'
  ),
  (
    '20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002',
    'Jogja Padel Yard', 'jogja-padel-yard', 'Lapangan komunitas di sisi utara Yogyakarta dengan ruang sosial terbuka.',
    'Jl. Kaliurang KM 7 No. 21, Sleman', 'Sleman', 'DI Yogyakarta', -7.733900, 110.376500,
    '+622748812345', 'jogja@padelku.id', array['Parkir', 'Kafe', 'Ruang Komunitas'],
    '08:00', '22:00', 'APPROVED', now() - interval '40 days', now() - interval '39 days', '10000000-0000-4000-8000-000000000003'
  ),
  (
    '20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000002',
    'Makassar Padel Bay', 'makassar-padel-bay', 'Calon venue padel panoramik dekat kawasan Pantai Losari.',
    'Jl. Metro Tanjung Bunga No. 18, Tamalate', 'Makassar', 'Sulawesi Selatan', -5.167100, 119.407000,
    '+62411881234', 'makassar@padelku.id', array['Parkir', 'Kafe', 'Shower'],
    '08:00', '22:00', 'PENDING', now() - interval '3 days', null, null
  )
on conflict (id) do update set
  owner_id = excluded.owner_id, name = excluded.name, slug = excluded.slug,
  description = excluded.description, address = excluded.address, city = excluded.city,
  province = excluded.province, latitude = excluded.latitude, longitude = excluded.longitude,
  phone = excluded.phone, email = excluded.email, facilities = excluded.facilities,
  opening_time = excluded.opening_time, closing_time = excluded.closing_time,
  status = excluded.status, submitted_at = excluded.submitted_at,
  reviewed_at = excluded.reviewed_at, reviewed_by = excluded.reviewed_by,
  updated_at = now();

insert into public.courts (
  id, venue_id, name, court_number, surface_type, indoor, price_per_hour_rupiah, is_active
)
values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Panoramic One', 1, 'PANORAMIC', true, 300000, true),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Panoramic Two', 2, 'PANORAMIC', true, 275000, true),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'Court A', 1, 'STANDARD', false, 190000, true),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', 'Court B', 2, 'STANDARD', false, 175000, true),
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000003', 'Batu Bolong', 1, 'PANORAMIC', false, 260000, true),
  ('30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000003', 'Berawa', 2, 'PANORAMIC', false, 240000, true),
  ('30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000004', 'Dago', 1, 'STANDARD', true, 160000, true),
  ('30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000004', 'Braga', 2, 'STANDARD', true, 150000, true),
  ('30000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000005', 'Sungkono One', 1, 'PANORAMIC', true, 190000, true),
  ('30000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000005', 'Sungkono Two', 2, 'STANDARD', true, 170000, true),
  ('30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000006', 'Merapi', 1, 'PANORAMIC', false, 150000, true),
  ('30000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000007', 'Losari', 1, 'PANORAMIC', false, 180000, true)
on conflict (id) do update set
  venue_id = excluded.venue_id, name = excluded.name, court_number = excluded.court_number,
  surface_type = excluded.surface_type, indoor = excluded.indoor,
  price_per_hour_rupiah = excluded.price_per_hour_rupiah,
  is_active = excluded.is_active, updated_at = now();

-- Fourteen complete future operating days, hourly from 08:00 through 21:00 Jakarta time.
insert into public.booking_slots (court_id, starts_at, ends_at, price_rupiah)
select
  c.id,
  ((current_date + day_offset + start_hour * interval '1 hour')::timestamp at time zone 'Asia/Jakarta'),
  ((current_date + day_offset + (start_hour + 1) * interval '1 hour')::timestamp at time zone 'Asia/Jakarta'),
  c.price_per_hour_rupiah
from public.courts c
cross join generate_series(1, 14) as day_offset
cross join generate_series(8, 21) as start_hour
where c.is_active
on conflict (court_id, starts_at, ends_at) do nothing;

-- Stable sample bookings: one completed/reviewed, one confirmed, and one awaiting payment.
insert into public.bookings (
  id, booking_code, user_id, venue_id, status, total_price_rupiah,
  payment_expires_at, confirmed_at, completed_at, idempotency_key, created_at, updated_at
)
values
  (
    '40000000-0000-4000-8000-000000000001', 'PK-DEMO-COMPLETE',
    '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
    'COMPLETED', 300000, null, now() - interval '2 days', now() - interval '1 day',
    'seed-completed-booking', now() - interval '3 days', now() - interval '1 day'
  ),
  (
    '40000000-0000-4000-8000-000000000002', 'PK-DEMO-CONFIRMED',
    '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002',
    'CONFIRMED', 190000, null, now(), null,
    'seed-confirmed-booking', now(), now()
  ),
  (
    '40000000-0000-4000-8000-000000000003', 'PK-DEMO-PENDING',
    '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004',
    'PENDING_PAYMENT', 160000, now() + interval '10 minutes', null, null,
    'seed-pending-booking', now(), now()
  )
on conflict (id) do nothing;

insert into public.booking_slots (
  id, court_id, starts_at, ends_at, price_rupiah, status, lock_booking_id
)
values (
  '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
  ((current_date - 2 + time '18:00')::timestamp at time zone 'Asia/Jakarta'),
  ((current_date - 2 + time '19:00')::timestamp at time zone 'Asia/Jakarta'),
  300000, 'BOOKED', '40000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

update public.booking_slots
set status = 'BOOKED', lock_booking_id = '40000000-0000-4000-8000-000000000002',
    locked_by = null, locked_at = null, lock_expires_at = null, updated_at = now()
where court_id = '30000000-0000-4000-8000-000000000003'
  and starts_at = ((current_date + 1 + time '18:00')::timestamp at time zone 'Asia/Jakarta')
  and status = 'AVAILABLE';

update public.booking_slots
set status = 'LOCKED', lock_booking_id = '40000000-0000-4000-8000-000000000003',
    locked_by = '10000000-0000-4000-8000-000000000001', locked_at = now(),
    lock_expires_at = (select payment_expires_at from public.bookings where id = '40000000-0000-4000-8000-000000000003'),
    updated_at = now()
where court_id = '30000000-0000-4000-8000-000000000007'
  and starts_at = ((current_date + 2 + time '19:00')::timestamp at time zone 'Asia/Jakarta')
  and status = 'AVAILABLE';

insert into public.booking_items (
  id, booking_id, booking_slot_id, court_id, starts_at, ends_at, price_rupiah
)
select
  '60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001',
  s.id, s.court_id, s.starts_at, s.ends_at, s.price_rupiah
from public.booking_slots s where s.id = '50000000-0000-4000-8000-000000000001'
on conflict (id) do nothing;

insert into public.booking_items (
  id, booking_id, booking_slot_id, court_id, starts_at, ends_at, price_rupiah
)
select
  '60000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002',
  s.id, s.court_id, s.starts_at, s.ends_at, s.price_rupiah
from public.booking_slots s
where s.lock_booking_id = '40000000-0000-4000-8000-000000000002'
on conflict (id) do nothing;

insert into public.booking_items (
  id, booking_id, booking_slot_id, court_id, starts_at, ends_at, price_rupiah
)
select
  '60000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003',
  s.id, s.court_id, s.starts_at, s.ends_at, s.price_rupiah
from public.booking_slots s
where s.lock_booking_id = '40000000-0000-4000-8000-000000000003'
on conflict (id) do nothing;

insert into public.payments (
  id, booking_id, method, provider, external_transaction_id, amount_rupiah,
  status, provider_payload, paid_at, created_at, updated_at,
  idempotency_key, expires_at, commission_bps, commission_rupiah, venue_net_rupiah
)
values
  (
    '70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001',
    'QRIS', 'Midtrans Sandbox', 'SEED-TXN-COMPLETE-001', 300000, 'SETTLED',
    '{"source":"seed","settlement_status":"settlement"}', now() - interval '2 days',
    now() - interval '2 days', now() - interval '2 days',
    'seed-payment-complete-001', now() - interval '2 days' + interval '10 minutes', 1000, 30000, 270000
  ),
  (
    '70000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002',
    'VA', 'Midtrans Sandbox', 'SEED-TXN-CONFIRMED-002', 190000, 'SETTLED',
    '{"source":"seed","bank":"bca"}', now(), now(), now(),
    'seed-payment-confirmed-002', now() + interval '10 minutes', 1000, 19000, 171000
  )
on conflict (id) do nothing;

insert into public.reviews (id, booking_id, user_id, venue_id, rating, comment, created_at, updated_at)
values (
  '80000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
  5, 'Lapangan terawat, staf responsif, dan ruang ganti sangat bersih.', now() - interval '1 day', now() - interval '1 day'
)
on conflict (id) do update set rating = excluded.rating, comment = excluded.comment, updated_at = excluded.updated_at;

insert into public.notifications (id, user_id, type, title, message, data, read_at, created_at)
values
  (
    '90000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
    'BOOKING', 'Jadwal dikonfirmasi', 'Pembayaran diterima. Sampai bertemu di Arena Padel BSD.',
    '{"booking_id":"40000000-0000-4000-8000-000000000002"}', null, now()
  ),
  (
    '90000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002',
    'VENUE', 'Venue menunggu review', 'Makassar Padel Bay sedang menunggu pemeriksaan tim PadelKu.',
    '{"venue_id":"20000000-0000-4000-8000-000000000007"}', null, now()
  )
on conflict (id) do nothing;
