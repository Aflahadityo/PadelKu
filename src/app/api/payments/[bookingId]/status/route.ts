import { z } from "zod"
import { createApiAdminSupabase, requireApiUser } from "@/lib/api/auth"
import { ApiError, errorResponse, throwDatabaseError } from "@/lib/api/errors"

export async function GET(_request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const bookingId = z.string().uuid().parse((await params).bookingId)
    const { authId, supabase } = await requireApiUser()
    const admin = createApiAdminSupabase()
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, booking_code, status, total_price_rupiah, payment_expires_at")
      .eq("id", bookingId)
      .eq("user_id", authId)
      .maybeSingle()
    if (bookingError) throwDatabaseError(bookingError, "Booking")
    if (!booking) throw new ApiError(404, "NOT_FOUND", "Booking tidak ditemukan.")
    const { data: payments, error } = await supabase
      .from("payments")
      .select("id, method, provider, status, amount_rupiah, paid_at, created_at, expires_at, refunded_at, failure_code, failure_reason")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false })
    if (error) throwDatabaseError(error, "Pembayaran")
    const paymentIds = (payments ?? []).map((payment) => payment.id)
    const eventsResult = paymentIds.length
      ? await admin
          .from("payment_events")
          .select("id, payment_id, event_type, from_status, to_status, actor_role, reason, created_at")
          .in("payment_id", paymentIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null }
    if (eventsResult.error) throwDatabaseError(eventsResult.error, "Riwayat pembayaran")
    return Response.json({ booking, events: eventsResult.data ?? [], payments: payments ?? [] })
  } catch (error) {
    return errorResponse(error, "Status pembayaran gagal dimuat.")
  }
}
