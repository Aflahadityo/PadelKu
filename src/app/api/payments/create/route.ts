import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Midtrans client (will be initialized when keys are available)
// import Midtrans from 'midtrans-client'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { bookingId, paymentMethod } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    // Get booking
    const booking = await prisma.$queryRawUnsafe<Array<{
      id: string; order_id: string; total_price: string; user_id: string; venue_id: string
    }>>(
      `SELECT id, order_id, total_price, user_id, venue_id FROM bookings WHERE id = $1 AND user_id = $2`,
      bookingId, user.id
    )

    if (!booking || booking.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const b = booking[0]
    const amount = parseInt(b.total_price)

    // In production, create Midtrans transaction here:
    // const core = new Midtrans.CoreApi({
    //   isProduction: false,
    //   serverKey: process.env.MIDTRANS_SERVER_KEY!,
    //   clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    // })
    // const transaction = await core.charge({
    //   payment_type: paymentMethod === 'VA' ? 'bank_transfer' : paymentMethod.toLowerCase(),
    //   transaction_details: { order_id: b.order_id, gross_amount: amount },
    //   customer_details: { ... },
    //   bank_transfer: { bank: paymentMethod === 'VA' ? 'mandiri' : undefined },
    // })

    // For demo, return mock payment data
    const paymentData = {
      order_id: b.order_id,
      gross_amount: amount,
      va_number: '9880990012345678',
      bank: 'mandiri',
      expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }

    // Create payment record
    await prisma.$executeRawUnsafe(
      `INSERT INTO payments (id, booking_id, payment_method, gross_amount, status, created_at, updated_at)
       VALUES (gen_random_uuid()::text, $1, $2::text::"PaymentMethod", $3::decimal, 'PENDING', NOW(), NOW())`,
      bookingId, paymentMethod || 'VA', amount
    )

    return NextResponse.json({ success: true, payment: paymentData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
