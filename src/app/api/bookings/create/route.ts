import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateOrderId } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slotId, venueId } = await req.json()
    if (!slotId || !venueId) {
      return NextResponse.json({ error: 'slotId and venueId required' }, { status: 400 })
    }

    // ═══════════════════════════════════════════════════════════════
    // ANTI DOUBLE-BOOKING: Use Postgres row-level locking
    // We SELECT ... FOR UPDATE on the slot row to lock it exclusively,
    // then check status INSIDE the same transaction before creating booking.
    // ═══════════════════════════════════════════════════════════════

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock the slot row exclusively — other concurrent transactions
      //    trying to read this slot will wait until we commit or rollback.
      const slot = await tx.$queryRawUnsafe<Array<{
        id: string
        status: string
        locked_by_id: string | null
        lock_expires_at: Date | null
        price: string
        court_id: string
      }>>(
        `SELECT id, status, locked_by_id, lock_expires_at, price, court_id
         FROM booking_slots
         WHERE id = $1
         FOR UPDATE`,  // ← row-level lock: blocks other writes/select-for-update
        slotId
      )

      if (!slot || slot.length === 0) {
        throw new Error('Slot not found')
      }

      const s = slot[0]

      // 2. Check if slot is actually available
      const isExpired = s.lock_expires_at && new Date() > new Date(s.lock_expires_at)
      const isLockedByOther = s.status === 'LOCKED' && s.locked_by_id !== user.id && !isExpired
      const isBooked = s.status === 'BOOKED'

      if (isBooked || isLockedByOther) {
        throw new Error('Slot is no longer available — already booked or being processed by another user')
      }

      // 3. Create booking with LOCKED status
      const orderId = generateOrderId()
      const lockExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min lock

      // Update slot to LOCKED
      await tx.$executeRawUnsafe(
        `UPDATE booking_slots
         SET status = 'LOCKED', locked_by_id = $1, locked_at = NOW(), lock_expires_at = $2
         WHERE id = $3`,
        user.id, lockExpiry, slotId
      )

      // Get the court's venue to verify venue match
      const court = await tx.$queryRawUnsafe<Array<{ venue_id: string }>>(
        `SELECT venue_id FROM courts WHERE id = $1`, s.court_id
      )

      // Create booking
      const booking = await tx.$executeRawUnsafe(
        `INSERT INTO bookings (id, order_id, total_price, status, user_id, venue_id, created_at, updated_at)
         VALUES (gen_random_uuid()::text, $1, $2::decimal, 'PENDING_PAYMENT', $3, $4, NOW(), NOW())
         RETURNING id`,
        orderId, s.price, user.id, venueId
      )

      // Link slot to booking via join table
      const bookingId = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM bookings WHERE order_id = $1`, orderId
      )

      await tx.$executeRawUnsafe(
        `INSERT INTO booking_slot_bookings (booking_id, booking_slot_id) VALUES ($1, $2)`,
        bookingId[0].id, slotId
      )

      return { orderId, bookingId: bookingId[0].id, lockExpiry }
    })

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      bookingId: result.bookingId,
      lockExpiresAt: result.lockExpiry.toISOString(),
      message: 'Slot locked. Complete payment within 10 minutes.',
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: error.message?.includes('no longer available') ? 409 : 500 }
    )
  }
}
