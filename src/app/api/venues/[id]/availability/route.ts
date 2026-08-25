import { NextResponse } from "next/server"
import { getVenueAvailability, isValidLocalDate } from "@/lib/data/marketplace"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const date = new URL(request.url).searchParams.get("date")?.trim()
  if (!date || !isValidLocalDate(date)) {
    return NextResponse.json({ error: "Tanggal harus menggunakan format YYYY-MM-DD." }, { status: 400 })
  }

  try {
    const availability = await getVenueAvailability(id, date)
    if (!availability) return NextResponse.json({ error: "Venue tidak ditemukan." }, { status: 404 })
    return NextResponse.json(availability, {
      headers: { "Cache-Control": "private, no-store" },
    })
  } catch {
    return NextResponse.json({ error: "Ketersediaan tidak dapat dimuat saat ini." }, { status: 500 })
  }
}
