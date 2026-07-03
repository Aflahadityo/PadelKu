import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const query = searchParams.get('q')
    const sortBy = searchParams.get('sort')

    let sql = `
      SELECT v.id, v.name, v.city, v.address, v.images, v.facilities,
             MIN(c.price_per_hour) as min_price, MAX(c.price_per_hour) as max_price,
             COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(DISTINCT r.id) as review_count
      FROM venues v
      JOIN courts c ON c.venue_id = v.id
      LEFT JOIN reviews r ON r.venue_id = v.id
      WHERE v.approval_status = 'APPROVED'
    `
    const params: string[] = []
    let paramIdx = 1

    if (city) {
      sql += ` AND LOWER(v.city) LIKE LOWER($${paramIdx})`
      params.push(`%${city}%`)
      paramIdx++
    }
    if (query) {
      sql += ` AND (LOWER(v.name) LIKE LOWER($${paramIdx}) OR LOWER(v.city) LIKE LOWER($${paramIdx}))`
      params.push(`%${query}%`)
      paramIdx++
    }

    sql += ` GROUP BY v.id, v.name, v.city, v.address, v.images, v.facilities`

    switch (sortBy) {
      case 'price_asc': sql += ' ORDER BY min_price ASC'; break
      case 'price_desc': sql += ' ORDER BY max_price DESC'; break
      case 'rating': sql += ' ORDER BY avg_rating DESC'; break
      default: sql += ' ORDER BY avg_rating DESC, review_count DESC'
    }

    const venues = await prisma.$queryRawUnsafe(sql, ...params)
    return NextResponse.json({ venues })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
