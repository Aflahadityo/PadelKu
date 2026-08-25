import { requireApiUser } from "@/lib/api/auth"
import { errorResponse, throwDatabaseError } from "@/lib/api/errors"

export async function GET() {
  try {
    const { authId, supabase } = await requireApiUser()
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, booking_code, status, total_price_rupiah, payment_expires_at,
        cancelled_at, cancellation_reason, confirmed_at, completed_at, created_at,
        venue:venues!bookings_venue_id_fkey(id, name, slug, address, city),
        items:booking_items(
          id, starts_at, ends_at, price_rupiah,
          court:courts!booking_items_court_id_fkey(id, name, court_number)
        ),
        review:reviews(id, rating, comment, created_at)
      `)
      .eq("user_id", authId)
      .order("created_at", { ascending: false })

    if (error) throwDatabaseError(error, "Booking")
    return Response.json({ bookings: data ?? [] })
  } catch (error) {
    return errorResponse(error, "Daftar booking gagal dimuat.")
  }
}
