import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const bookings = await prisma.$queryRawUnsafe(
      `SELECT b.*, v.name as venue_name,
              json_agg(json_build_object('id', bs.id, 'start_time', bs.start_time, 'end_time', bs.end_time, 'date', bs.date, 'court_name', c.name)) as slots
       FROM bookings b
       JOIN venues v ON v.id = b.venue_id
       LEFT JOIN booking_slot_bookings bsb ON bsb.booking_id = b.id
       LEFT JOIN booking_slots bs ON bs.id = bsb.booking_slot_id
       LEFT JOIN courts c ON c.id = bs.court_id
       WHERE b.user_id = $1
       GROUP BY b.id, v.name
       ORDER BY b.created_at DESC`,
      user.id
    )

    return NextResponse.json({ bookings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
