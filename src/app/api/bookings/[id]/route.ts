import { z } from "zod"
import { requireApiUser } from "@/lib/api/auth"
import { ApiError, errorResponse, throwDatabaseError } from "@/lib/api/errors"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const bookingId = z.string().uuid().parse((await params).id)
    const { authId, supabase } = await requireApiUser()
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, booking_code, status, total_price_rupiah, payment_expires_at,
        cancelled_at, cancellation_reason, confirmed_at, completed_at, created_at,
        venue:venues!bookings_venue_id_fkey(id, name, slug, address, city, province),
        items:booking_items(
          id, booking_slot_id, starts_at, ends_at, price_rupiah,
          court:courts!booking_items_court_id_fkey(id, name, court_number, indoor, surface_type)
        ),
        payments(id, method, provider, amount_rupiah, status, paid_at, created_at),
        review:reviews(id, rating, comment, created_at, updated_at)
      `)
      .eq("id", bookingId)
      .eq("user_id", authId)
      .maybeSingle()

    if (error) throwDatabaseError(error, "Booking")
    if (!data) throw new ApiError(404, "NOT_FOUND", "Booking tidak ditemukan.")
    return Response.json({ booking: data })
  } catch (error) {
    return errorResponse(error, "Detail booking gagal dimuat.")
  }
}
