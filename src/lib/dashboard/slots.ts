import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Tables, TablesInsert } from "@/types/database"
import { getUtcDateRange, resolveVenueTimezone } from "@/lib/data/marketplace"

type CourtForSlots = Pick<Tables<"courts">, "id" | "price_per_hour_rupiah">
type VenueHours = Pick<Tables<"venues">, "closing_time" | "opening_time" | "province">

function minutes(time: string) {
  const [hour, minute] = time.slice(0, 5).split(":").map(Number)
  return hour * 60 + minute
}

export async function generateCourtSlots(
  supabase: SupabaseClient<Database>,
  court: CourtForSlots,
  venue: VenueHours,
) {
  const opening = minutes(venue.opening_time)
  const closing = minutes(venue.closing_time)
  const timezone = resolveVenueTimezone(venue.province)
  const localDate = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).format(new Date())
  const firstDate = new Date(getUtcDateRange(localDate, timezone).start)
  const rows: TablesInsert<"booking_slots">[] = []

  for (let day = 1; day <= 30; day += 1) {
    for (let minute = opening; minute + 60 <= closing; minute += 60) {
      const startsAt = new Date(firstDate)
      startsAt.setUTCDate(startsAt.getUTCDate() + day)
      startsAt.setUTCMinutes(startsAt.getUTCMinutes() + minute)
      const endsAt = new Date(startsAt)
      endsAt.setUTCMinutes(endsAt.getUTCMinutes() + 60)
      rows.push({
        court_id: court.id,
        ends_at: endsAt.toISOString(),
        price_rupiah: court.price_per_hour_rupiah,
        starts_at: startsAt.toISOString(),
      })
    }
  }

  if (rows.length === 0) return { generated: 0, message: "Jam operasional tidak memuat slot satu jam." }

  const { data: existing, error: readError } = await supabase
    .from("booking_slots")
    .select("starts_at, ends_at")
    .eq("court_id", court.id)
    .gte("starts_at", rows[0].starts_at)
    .lte("ends_at", rows.at(-1)?.ends_at ?? rows[0].ends_at)

  if (readError) return { generated: 0, message: readError.message }

  const existingKeys = new Set(existing.map((slot) => `${slot.starts_at}|${slot.ends_at}`))
  const missingRows = rows.filter((slot) => !existingKeys.has(`${slot.starts_at}|${slot.ends_at}`))
  const { error: priceError } = await supabase
    .from("booking_slots")
    .update({ price_rupiah: court.price_per_hour_rupiah })
    .eq("court_id", court.id)
    .eq("status", "AVAILABLE")
    .gte("starts_at", rows[0].starts_at)
    .lte("ends_at", rows.at(-1)?.ends_at ?? rows[0].ends_at)
  if (priceError) return { generated: 0, message: priceError.message }
  if (missingRows.length === 0) return { generated: 0, message: "Slot 30 hari ke depan sudah tersedia." }

  const { error } = await supabase.from("booking_slots").insert(missingRows)
  if (error) return { generated: 0, message: error.message }
  return { generated: missingRows.length, message: `${missingRows.length} slot dibuat.` }
}
