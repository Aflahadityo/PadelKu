import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { transaction_status, order_id, transaction_id, payment_type } = body

    if (!order_id) {
      return NextResponse.json({ error: 'order_id required' }, { status: 400 })
    }

    // Map Midtrans status to our status
    let paymentStatus: string
    let bookingStatus: string

    switch (transaction_status) {
      case 'settlement':
      case 'capture':
        paymentStatus = 'SETTLEMENT'
        bookingStatus = 'CONFIRMED'
        break
      case 'pending':
        paymentStatus = 'PENDING'
        bookingStatus = 'PENDING_PAYMENT'
        break
      case 'deny':
      case 'deny':
        paymentStatus = 'DENY'
        bookingStatus = 'CANCELLED'
        break
      case 'expire':
        paymentStatus = 'EXPIRED'
        bookingStatus = 'CANCELLED'
        break
      case 'cancel':
        paymentStatus = 'CANCEL'
        bookingStatus = 'CANCELLED'
        break
      default:
        paymentStatus = 'PENDING'
        bookingStatus = 'PENDING_PAYMENT'
    }

    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.$executeRawUnsafe(
        `UPDATE payments
         SET status = $1::text::"PaymentStatus", transaction_id = $2, paid_at = CASE WHEN $1 IN ('SETTLEMENT','capture') THEN NOW() ELSE NULL END
         WHERE order_id IN (SELECT order_id FROM bookings WHERE order_id = $3)`,
        paymentStatus, transaction_id || '', order_id
      )

      if (bookingStatus === 'CONFIRMED') {
        // Release locks and mark slots as booked
        await tx.$executeRawUnsafe(
          `UPDATE booking_slots
           SET status = 'BOOKED', locked_by_id = NULL, locked_at = NULL, lock_expires_at = NULL
           WHERE id IN (
             SELECT booking_slot_id FROM booking_slot_bookings
             WHERE booking_id IN (SELECT id FROM bookings WHERE order_id = $1)
           )`,
          order_id
        )
      } else if (bookingStatus === 'CANCELLED') {
        // Release slots back to AVAILABLE
        await tx.$executeRawUnsafe(
          `UPDATE booking_slots
           SET status = 'AVAILABLE', locked_by_id = NULL, locked_at = NULL, lock_expires_at = NULL
           WHERE id IN (
             SELECT booking_slot_id FROM booking_slot_bookings
             WHERE booking_id IN (SELECT id FROM bookings WHERE order_id = $1)
           )`,
          order_id
        )
      }

      // Update booking status
      await tx.$executeRawUnsafe(
        `UPDATE bookings SET status = $1::text::"BookingStatus" WHERE order_id = $2`,
        bookingStatus, order_id
      )
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
