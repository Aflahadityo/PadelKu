import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const venue = await prisma.$queryRawUnsafe<Array<any>>(
      `SELECT v.*,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM venues v
       LEFT JOIN reviews r ON r.venue_id = v.id
       WHERE v.id = $1
       GROUP BY v.id`,
      params.id
    )

    if (!venue || venue.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const courts = await prisma.$queryRawUnsafe(
      `SELECT * FROM courts WHERE venue_id = $1 ORDER BY court_number`,
      params.id
    )

    const reviews = await prisma.$queryRawUnsafe(
      `SELECT r.*, u.name as user_name, u.image_url as user_image
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.venue_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      params.id
    )

    return NextResponse.json({
      venue: { ...venue[0], courts, reviews },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
