import { NextResponse } from "next/server"
import { getVenueDetail } from "@/lib/data/marketplace"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const venue = await getVenueDetail(id)
    if (!venue) return NextResponse.json({ error: "Venue tidak ditemukan." }, { status: 404 })
    return NextResponse.json({ venue })
  } catch {
    return NextResponse.json({ error: "Detail venue tidak dapat dimuat saat ini." }, { status: 500 })
  }
}
