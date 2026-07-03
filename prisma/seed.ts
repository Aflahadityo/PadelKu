import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()
const uuid = () => randomUUID()

async function main() {
  console.log('🌱 Seeding PadelKu database...')

  // ═══════════════════════════════════════════════════════════════════
  // 1. USERS
  // ═══════════════════════════════════════════════════════════════════
  const uid = {
    rizky: uuid(), sarah: uuid(), andi: uuid(), dewi: uuid(),
    fajar: uuid(), intan: uuid(), dimas: uuid(), putri: uuid(),
    reza: uuid(), nanda: uuid(),
    ari: uuid(), dian: uuid(), budi: uuid(), admin: uuid(),
    demoPlayer: uuid(), demoOwner: uuid(),
  }

  const users: { id: string; email: string; name: string; phone: string | null; role: string }[] = [
    { id: uid.rizky, email: 'rizky@padelku.id', name: 'Rizky Pratama', phone: '08123456701', role: 'PLAYER' },
    { id: uid.sarah, email: 'sarah@padelku.id', name: 'Sarah Wijaya', phone: '08123456702', role: 'PLAYER' },
    { id: uid.andi, email: 'andi@padelku.id', name: 'Andi Kurniawan', phone: '08123456703', role: 'PLAYER' },
    { id: uid.dewi, email: 'dewi@padelku.id', name: 'Dewi Lestari', phone: '08123456704', role: 'PLAYER' },
    { id: uid.fajar, email: 'fajar@padelku.id', name: 'Fajar Ramadhan', phone: '08123456705', role: 'PLAYER' },
    { id: uid.intan, email: 'intan@padelku.id', name: 'Intan Permata', phone: '08123456706', role: 'PLAYER' },
    { id: uid.dimas, email: 'dimas@padelku.id', name: 'Dimas Ardiansyah', phone: '08123456707', role: 'PLAYER' },
    { id: uid.putri, email: 'putri@padelku.id', name: 'Putri Ayu', phone: '08123456708', role: 'PLAYER' },
    { id: uid.reza, email: 'reza@padelku.id', name: 'Reza Gunawan', phone: '08123456709', role: 'PLAYER' },
    { id: uid.nanda, email: 'nanda@padelku.id', name: 'Nanda Putri', phone: '08123456710', role: 'PLAYER' },
    { id: uid.ari, email: 'ari@padelku.id', name: 'Ari Wibowo', phone: '08123456711', role: 'VENUE_OWNER' },
    { id: uid.dian, email: 'dian@padelku.id', name: 'Dian Permata', phone: '08123456712', role: 'VENUE_OWNER' },
    { id: uid.budi, email: 'budi@padelku.id', name: 'Budi Santoso', phone: '08123456713', role: 'VENUE_OWNER' },
    { id: uid.admin, email: 'admin@padelku.id', name: 'Admin PadelKu', phone: '08123456714', role: 'ADMIN' },
    { id: uid.demoPlayer, email: 'player@padelku.id', name: 'Player Demo', phone: null, role: 'PLAYER' },
    { id: uid.demoOwner, email: 'owner@padelku.id', name: 'Owner Demo', phone: null, role: 'VENUE_OWNER' },
  ]

  for (const u of users) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO users (id, email, name, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5::"Role", NOW(), NOW())`,
      u.id, u.email, u.name, 'password123', u.role,
    )
  }
  console.log(`  ✓ ${users.length} users created`)

  // ═══════════════════════════════════════════════════════════════════
  // 2. VENUES
  // ═══════════════════════════════════════════════════════════════════
  const vid = {
    kemang: uuid(), bsd: uuid(), canggu: uuid(), bandung: uuid(),
    surabaya: uuid(), senayan: uuid(), kelapaGading: uuid(), cinere: uuid(),
  }

  interface VenueData {
    id: string; name: string; description: string; address: string; city: string
    lat: number | null; lng: number | null; phone: string; ownerId: string; status: string
  }

  const venues: VenueData[] = [
    { id: vid.kemang, name: 'Padel House Kemang', description: 'Padel court indoor dengan fasilitas AC, parkir luas, kantin, pro shop, dan mushola. Nyaman dan eksklusif untuk bermain padel di kawasan Kemang.', address: 'Jl. Kemang Raya No. 45, Mampang Prapatan', city: 'Jakarta Selatan', lat: -6.2635, lng: 106.8147, phone: '021-7654321', ownerId: uid.ari, status: 'APPROVED' },
    { id: vid.bsd, name: 'Arena Padel BSD', description: 'Lapangan padel outdoor dengan pemandangan terbuka, parkir luas, kantin, dan mushola. Suasana asyik untuk bermain santai maupun kompetisi.', address: 'Jl. BSD Raya Utama No. 12, BSD City', city: 'BSD/Tangerang', lat: -6.3006, lng: 106.6520, phone: '021-9876543', ownerId: uid.dian, status: 'APPROVED' },
    { id: vid.canggu, name: 'Canggu Padel Club', description: 'Padel club di Canggu dengan nuansa outdoor tropis, kolam renang, pro shop, kafe, dan area hangout. Favorit pemain lokal dan turis.', address: 'Jl. Pantai Batu Bolong No. 88, Canggu', city: 'Bali/Canggu', lat: -8.6500, lng: 115.1333, phone: '0361-473829', ownerId: uid.dian, status: 'APPROVED' },
    { id: vid.bandung, name: 'Padel Studio Bandung', description: 'Studio padel indoor ber-AC di jantung Kota Bandung. Tersedia parkir luas, kantin, dan ruang ganti yang nyaman.', address: 'Jl. Dago No. 156, Coblong', city: 'Bandung', lat: -6.9147, lng: 107.6098, phone: '022-5647382', ownerId: uid.budi, status: 'APPROVED' },
    { id: vid.surabaya, name: 'Surabaya Padel Center', description: 'Pusat padel indoor terbesar di Surabaya dengan AC, parkir luas, kantin, dan pro shop lengkap. Tersedia juga jasa instruktur.', address: 'Jl. Mayjen Sungkono No. 78, Dukuh Pakis', city: 'Surabaya', lat: -7.2892, lng: 112.7340, phone: '031-3847562', ownerId: uid.ari, status: 'APPROVED' },
    { id: vid.senayan, name: 'Padel Sportivo Senayan', description: 'Lapangan padel indoor premium di kawasan Senayan Jakarta. Fasilitas AC, parkir, kantin, mushola, dan pro shop. Standar internasional.', address: 'Kompleks Gelora Bung Karno, Pintu 7, Senayan', city: 'Jakarta Pusat', lat: -6.2208, lng: 106.8028, phone: '021-5748392', ownerId: uid.budi, status: 'APPROVED' },
    { id: vid.kelapaGading, name: 'Padel Point Kelapa Gading', description: 'Lapangan padel indoor ber-AC di kawasan Kelapa Gading, Jakarta Utara. Tersedia parkir dan tempat nongkrong.', address: 'Jl. Kelapa Gading Boulevard No. 34', city: 'Jakarta Utara', lat: -6.1510, lng: 106.9020, phone: '021-4657382', ownerId: uid.ari, status: 'PENDING' },
    { id: vid.cinere, name: 'Padel Indoor Cinere', description: 'Lapangan padel indoor nyaman di Cinere Depok. AC, parkir luas, kantin, dan mushola. Harga terjangkau.', address: 'Jl. Cinere Raya No. 56, Cinere', city: 'Depok', lat: -6.3300, lng: 106.7800, phone: '021-7548391', ownerId: uid.dian, status: 'PENDING' },
  ]

  for (const v of venues) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO venues (id, name, description, address, city, latitude, longitude, phone, email, images, approval_status, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '{}'::text[], $10::"ApprovalStatus", $11, NOW(), NOW())`,
      v.id, v.name, v.description, v.address, v.city, v.lat, v.lng, v.phone, v.name.toLowerCase().replace(/\s+/g, '') + '@padelku.id', v.status, v.ownerId,
    )
  }
  console.log(`  ✓ ${venues.length} venues created`)

  // ═══════════════════════════════════════════════════════════════════
  // 3. COURTS
  // ═══════════════════════════════════════════════════════════════════
  // [venueId, courtName, courtNumber, pricePerHour]
  const courtDefs: [string, string, number, number][] = [
    // Padel House Kemang — 4 courts
    [vid.kemang, 'Lapangan 1', 1, 250000], [vid.kemang, 'Lapangan 2', 2, 220000],
    [vid.kemang, 'Lapangan 3', 3, 200000], [vid.kemang, 'Lapangan 4', 4, 200000],
    // Arena Padel BSD — 3 courts
    [vid.bsd, 'Court A', 1, 180000], [vid.bsd, 'Court B', 2, 160000], [vid.bsd, 'Court C', 3, 150000],
    // Canggu Padel Club — 4 courts
    [vid.canggu, 'Court 1', 1, 250000], [vid.canggu, 'Court 2', 2, 220000],
    [vid.canggu, 'Court 3', 3, 200000], [vid.canggu, 'Court 4', 4, 180000],
    // Padel Studio Bandung — 2 courts
    [vid.bandung, 'Lapangan A', 1, 150000], [vid.bandung, 'Lapangan B', 2, 120000],
    // Surabaya Padel Center — 3 courts
    [vid.surabaya, 'Lapangan 1', 1, 160000], [vid.surabaya, 'Lapangan 2', 2, 150000], [vid.surabaya, 'Lapangan 3', 3, 130000],
    // Padel Sportivo Senayan — 3 courts
    [vid.senayan, 'Court Premier', 1, 250000], [vid.senayan, 'Court 2', 2, 230000], [vid.senayan, 'Court 3', 3, 220000],
    // Padel Point Kelapa Gading — 2 courts
    [vid.kelapaGading, 'Lapangan 1', 1, 170000], [vid.kelapaGading, 'Lapangan 2', 2, 150000],
    // Padel Indoor Cinere — 2 courts
    [vid.cinere, 'Lapangan A', 1, 140000], [vid.cinere, 'Lapangan B', 2, 120000],
  ]

  const courtIds: string[] = []
  const venueCourtMap: Record<string, string[]> = {}
  for (const v of venues) venueCourtMap[v.id] = []

  for (const [venueId, name, number, price] of courtDefs) {
    const id = uuid()
    courtIds.push(id)
    venueCourtMap[venueId].push(id)
    await prisma.$executeRawUnsafe(
      `INSERT INTO courts (id, name, court_number, price_per_hour, venue_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4::decimal(10,2), $5, NOW(), NOW())`,
      id, name, number, price, venueId,
    )
  }
  console.log(`  ✓ ${courtIds.length} courts created`)

  // ═══════════════════════════════════════════════════════════════════
  // 4. BOOKING SLOTS — generate_series for all courts, 7 days, 08-21
  // ═══════════════════════════════════════════════════════════════════
  const courtValues = courtIds.map(id => `('${id}'::text)`).join(', ')
  // Insert slots with price from the court
  await prisma.$executeRawUnsafe(`
    INSERT INTO booking_slots (id, date, start_time, end_time, status, price, court_id, created_at, updated_at)
    SELECT gen_random_uuid(),
           (CURRENT_DATE + d)::date,
           to_char(s::time, 'HH24:MI'),
           to_char((s::time + INTERVAL '1 hour')::time, 'HH24:MI'),
           'AVAILABLE'::"BookingSlotStatus",
           co.price_per_hour,
           c.id,
           NOW(),
           NOW()
    FROM generate_series(0, 6) d
    CROSS JOIN generate_series('08:00'::time, '20:00'::time, '1 hour') s
    CROSS JOIN (VALUES ${courtValues}) AS c(id)
    JOIN courts co ON co.id = c.id
  `)
  console.log(`  ✓ Slots created (${courtIds.length} courts × 7 days × 13 hours)`)

  // ═══════════════════════════════════════════════════════════════════
  // 5. LOCK ~3% slots for demo — pick ~60 random slots
  // ═══════════════════════════════════════════════════════════════════
  await prisma.$executeRawUnsafe(
    `UPDATE booking_slots
     SET status = 'LOCKED'::"BookingSlotStatus",
         locked_by_id = $1::text,
         locked_at = NOW(),
         lock_expires_at = NOW() + INTERVAL '7 days'
     WHERE id IN (
       SELECT id FROM booking_slots WHERE status = 'AVAILABLE'::"BookingSlotStatus"
       ORDER BY random() LIMIT 60
     )`,
    uid.admin,
  )
  const lockedResult: any[] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS cnt FROM booking_slots WHERE status = 'LOCKED'::"BookingSlotStatus"`
  )
  console.log(`  ✓ ${lockedResult[0].cnt} slots locked for maintenance`)

  // ═══════════════════════════════════════════════════════════════════
  // 6. BOOKINGS (~15 bookings with varied statuses)
  // ═══════════════════════════════════════════════════════════════════
  // Helper: find slot ID by unique constraint
  async function findSlotId(courtId: string, dayOffset: number, startHour: number): Promise<string> {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM booking_slots
       WHERE court_id = $1 AND date = (CURRENT_DATE + $2)::date AND start_time = $3`,
      courtId, dayOffset, `${startHour.toString().padStart(2, '0')}:00`,
    )
    return rows[0]?.id
  }

  // Helper: create a booking with slots, payments, reviews, notifications
  async function createBooking(
    userId: string, venueId: string, courtId: string,
    dayOffset: number, startHour: number, numSlots: number,
    status: string, paymentMethod: string | null,
    review: { rating: number; comment: string } | null,
    notifyUser: boolean,
  ) {
    // find the court's price
    const priceRow: any[] = await prisma.$queryRawUnsafe(
      `SELECT price_per_hour FROM courts WHERE id = $1`, courtId,
    )
    const pricePerHour = Number(priceRow[0].price_per_hour)
    const totalPrice = pricePerHour * numSlots
    const bookingId = uuid()
    const orderId = `PK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${bookingId.slice(0, 6).toUpperCase()}`

    // Insert booking
    await prisma.$executeRawUnsafe(
      `INSERT INTO bookings (id, total_price, status, order_id, user_id, venue_id, created_at, updated_at)
       VALUES ($1, $2::decimal(10,2), $3::"BookingStatus", $4, $5, $6, NOW(), NOW())`,
      bookingId, totalPrice, status, orderId, userId, venueId,
    )

    // Find and book each slot
    const slotIds: string[] = []
    for (let h = 0; h < numSlots; h++) {
      const slotId = await findSlotId(courtId, dayOffset, startHour + h)
      if (slotId) slotIds.push(slotId)
    }

    if (slotIds.length > 0) {
      // Insert booking_slot_bookings join records
      const joinValues = slotIds.map(sid => `('${bookingId}'::text, '${sid}'::text)`).join(', ')
      await prisma.$executeRawUnsafe(
        `INSERT INTO booking_slot_bookings (booking_id, booking_slot_id) VALUES ${joinValues}`,
      )
      // Update slot status to BOOKED
      const slotIdList = slotIds.map(s => `'${s}'`).join(', ')
      await prisma.$executeRawUnsafe(
        `UPDATE booking_slots SET status = 'BOOKED'::"BookingSlotStatus" WHERE id IN (${slotIdList})`,
      )
    }

    // Payment for CONFIRMED / COMPLETED bookings
    if (paymentMethod && (status === 'CONFIRMED' || status === 'COMPLETED')) {
      const paymentId = uuid()
      const txnId = `TXN-${orderId}`
      await prisma.$executeRawUnsafe(
        `INSERT INTO payments (id, booking_id, payment_method, transaction_id, gross_amount, status, paid_at, created_at, updated_at)
         VALUES ($1, $2, $3::"PaymentMethod", $4, $5::decimal(10,2), 'SETTLEMENT'::"PaymentStatus", NOW(), NOW(), NOW())`,
        paymentId, bookingId, paymentMethod, txnId, totalPrice,
      )
    }

    // Review for COMPLETED bookings
    if (review && status === 'COMPLETED') {
      const reviewId = uuid()
      await prisma.$executeRawUnsafe(
        `INSERT INTO reviews (id, rating, comment, booking_id, user_id, venue_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        reviewId, review.rating, review.comment, bookingId, userId, venueId,
      )
    }

    // Notification
    if (notifyUser) {
      const notifId = uuid()
      const notifTitle = status === 'COMPLETED' ? 'Pesanan selesai'
        : status === 'CONFIRMED' ? 'Pesanan dikonfirmasi'
        : status === 'PENDING_PAYMENT' ? 'Menunggu pembayaran'
        : 'Pesanan dibatalkan'
      await prisma.$executeRawUnsafe(
        `INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at)
         VALUES ($1, $2, 'booking', $3, $4, false, NOW())`,
        notifId, userId, notifTitle,
        status === 'COMPLETED' ? 'Terima kasih telah bermain di venue kami! Silakan berikan rating dan ulasan.'
        : status === 'CONFIRMED' ? 'Jadwal bermain Anda telah dikonfirmasi. Siap-siap main padel!'
        : 'Silakan selesaikan pembayaran sebelum batas waktu yang ditentukan.',
      )
    }

    return bookingId
  }

  // Define 15 bookings
  // [userIndex, venueId, courtId in that venue (index), dayOffset, startHour, numSlots, status, paymentMethod, review, notify]
  // Map venue IDs to list of their court IDs for easy reference
  const vc = venueCourtMap

  const bookingDefs: [string, string, string, number, number, number, string, string | null, { rating: number; comment: string } | null, boolean][] = [
    // Booking 1: Rizky — Padel House Kemang, Court 1, today at 16:00, 1 jam, COMPLETED
    [uid.rizky, vid.kemang, vc[vid.kemang][0], 0, 16, 1, 'COMPLETED', 'QRIS', { rating: 5, comment: 'Lapangan bagus, fasilitas lengkap. Recommended!' }, true],
    // Booking 2: Sarah — Arena Padel BSD, Court A, day+1 at 09:00, 1 jam, COMPLETED
    [uid.sarah, vid.bsd, vc[vid.bsd][0], 1, 9, 1, 'COMPLETED', 'EWALLET', { rating: 4, comment: 'AC nya dingin, nyaman main di sini.' }, true],
    // Booking 3: Andi — Canggu Padel Club, Court 1, day+2 at 17:00, 2 jam, CONFIRMED
    [uid.andi, vid.canggu, vc[vid.canggu][0], 2, 17, 2, 'CONFIRMED', 'VA', null, true],
    // Booking 4: Dewi — Padel Studio Bandung, Lapangan A, day+1 at 10:00, 1 jam, COMPLETED
    [uid.dewi, vid.bandung, vc[vid.bandung][0], 1, 10, 1, 'COMPLETED', 'QRIS', { rating: 5, comment: 'Tempatnya bersih dan pelayanan ramah. Pasti balik lagi.' }, true],
    // Booking 5: Fajar — Surabaya Padel Center, Lapangan 1, day+3 at 14:00, 2 jam, CONFIRMED
    [uid.fajar, vid.surabaya, vc[vid.surabaya][0], 3, 14, 2, 'CONFIRMED', 'VA', null, true],
    // Booking 6: Intan — Padel Sportivo Senayan, Court Premier, day+0 at 19:00, 1 jam, COMPLETED
    [uid.intan, vid.senayan, vc[vid.senayan][0], 0, 19, 1, 'COMPLETED', 'QRIS', { rating: 5, comment: 'Best padel court di Jakarta! Seru banget.' }, true],
    // Booking 7: Dimas — Padel House Kemang, Lapangan 2, day+4 at 08:00, 1 jam, PENDING_PAYMENT
    [uid.dimas, vid.kemang, vc[vid.kemang][1], 4, 8, 1, 'PENDING_PAYMENT', null, null, true],
    // Booking 8: Putri — Canggu Padel Club, Court 2, day+1 at 15:00, 2 jam, COMPLETED
    [uid.putri, vid.canggu, vc[vid.canggu][1], 1, 15, 2, 'COMPLETED', 'EWALLET', { rating: 4, comment: 'Suasananya asik, cocok untuk hangout sambil main padel.' }, true],
    // Booking 9: Reza — Arena Padel BSD, Court B, day+5 at 11:00, 1 jam, CONFIRMED
    [uid.reza, vid.bsd, vc[vid.bsd][1], 5, 11, 1, 'CONFIRMED', 'VA', null, true],
    // Booking 10: Nanda — Padel Studio Bandung, Lapangan B, day+2 at 13:00, 1 jam, PENDING_PAYMENT
    [uid.nanda, vid.bandung, vc[vid.bandung][1], 2, 13, 1, 'PENDING_PAYMENT', null, null, true],
    // Booking 11: Rizky — Surabaya Padel Center, Lapangan 2, day+6 at 18:00, 1 jam, COMPLETED
    [uid.rizky, vid.surabaya, vc[vid.surabaya][1], 6, 18, 1, 'COMPLETED', 'QRIS', { rating: 4, comment: 'Lapangan terawat, parkir luas. Mantap!' }, true],
    // Booking 12: Sarah — Padel Sportivo Senayan, Court 2, day+3 at 16:00, 2 jam, COMPLETED
    [uid.sarah, vid.senayan, vc[vid.senayan][1], 3, 16, 2, 'COMPLETED', 'EWALLET', { rating: 5, comment: 'Mushola bersih, parkir aman. Puas main di sini.' }, true],
    // Booking 13: Andi — Padel House Kemang, Lapangan 3, day+1 at 20:00, 1 jam, PENDING_PAYMENT
    [uid.andi, vid.kemang, vc[vid.kemang][2], 1, 20, 1, 'PENDING_PAYMENT', null, null, true],
    // Booking 14: Dewi — Canggu Padel Club, Court 3, day+4 at 09:00, 1 jam, COMPLETED (rating 3 — kritik membangun)
    [uid.dewi, vid.canggu, vc[vid.canggu][2], 4, 9, 1, 'COMPLETED', 'QRIS', { rating: 3, comment: 'Lumayan, tapi parkirnya sempit.' }, true],
    // Booking 15: Fajar — Arena Padel BSD, Court C, day+0 at 12:00, 1 jam, CONFIRMED
    [uid.fajar, vid.bsd, vc[vid.bsd][2], 0, 12, 1, 'CONFIRMED', 'VA', null, true],
  ]

  for (const [userId, venueId, courtId, dayOffset, startHour, numSlots, status, paymentMethod, review, notify] of bookingDefs) {
    await createBooking(userId, venueId, courtId, dayOffset, startHour, numSlots, status, paymentMethod, review, notify)
  }
  console.log(`  ✓ ${bookingDefs.length} bookings created (with payments, reviews, and notifications)`)

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY & CREDENTIALS
  // ═══════════════════════════════════════════════════════════════════

  // Print counts
  const counts = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 'users' AS tbl, COUNT(*)::int AS cnt FROM users
    UNION ALL SELECT 'venues', COUNT(*) FROM venues
    UNION ALL SELECT 'courts', COUNT(*) FROM courts
    UNION ALL SELECT 'booking_slots', COUNT(*) FROM booking_slots
    UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
    UNION ALL SELECT 'booking_slot_bookings', COUNT(*) FROM booking_slot_bookings
    UNION ALL SELECT 'payments', COUNT(*) FROM payments
    UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
    UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
    ORDER BY tbl
  `)
  console.log('\n📊 Database summary:')
  for (const row of counts) {
    console.log(`  ${row.tbl}: ${row.cnt}`)
  }

  console.log('\n✅ Seed complete!')
  console.log('\n📋 Demo Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Player:       player@padelku.id / password123')
  console.log('Player:       rizky@padelku.id / password123')
  console.log('Player:       sarah@padelku.id / password123')
  console.log('Venue Owner:  owner@padelku.id / password123')
  console.log('Venue Owner:  ari@padelku.id / password123')
  console.log('Venue Owner:  dian@padelku.id / password123')
  console.log('Venue Owner:  budi@padelku.id / password123')
  console.log('Admin:        admin@padelku.id / password123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nAll passwords: password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
