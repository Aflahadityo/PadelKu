import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { slotId } = await req.json()
    if (!slotId) {
      return NextResponse.json({ error: 'slotId required' }, { status: 400 })
    }

    await prisma.$executeRawUnsafe(
      `UPDATE booking_slots
       SET status = 'AVAILABLE', locked_by_id = NULL, locked_at = NULL, lock_expires_at = NULL
       WHERE id = $1 AND status = 'LOCKED'`,
      slotId
    )

    return NextResponse.json({ success: true, message: 'Slot released' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
