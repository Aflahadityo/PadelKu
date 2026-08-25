import { NextResponse } from "next/server"
import {
  getMarketplaceDiscovery,
  isValidLocalDate,
  type MarketplaceSort,
} from "@/lib/data/marketplace"

const sorts = new Set<MarketplaceSort>(["recommended", "rating", "price_asc", "price_desc", "name"])

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const date = searchParams.get("date")?.trim() || undefined
  if (date && !isValidLocalDate(date)) {
    return NextResponse.json({ error: "Tanggal harus menggunakan format YYYY-MM-DD." }, { status: 400 })
  }

  const requestedSort = searchParams.get("sort") as MarketplaceSort | null
  try {
    const result = await getMarketplaceDiscovery({
      city: searchParams.get("city")?.trim() || undefined,
      date,
      facility: searchParams.get("facility")?.trim() || undefined,
      q: searchParams.get("q")?.trim() || undefined,
      sort: requestedSort && sorts.has(requestedSort) ? requestedSort : "recommended",
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Venue tidak dapat dimuat saat ini." }, { status: 500 })
  }
}
