import { z } from "zod"
import { createApiAdminSupabase, requireApiUser } from "@/lib/api/auth"
import { ApiError, errorResponse, parseJson, throwDatabaseError } from "@/lib/api/errors"

const cancelSchema = z.object({
  reason: z.string().trim().min(3).max(500).optional(),
}).strict()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const bookingId = z.string().uuid().parse((await params).id)
    const body = cancelSchema.parse(await parseJson(request))
    const { authId, supabase } = await requireApiUser()
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("id", bookingId)
      .eq("user_id", authId)
      .maybeSingle()

    if (bookingError) throwDatabaseError(bookingError, "Booking")
    if (!booking) throw new ApiError(404, "NOT_FOUND", "Booking tidak ditemukan.")
    if (booking.status === "CONFIRMED") {
      throw new ApiError(409, "REFUND_REQUIRED", "Booking yang sudah dibayar harus diproses melalui refund admin.")
    }

    const admin = createApiAdminSupabase()
    const { data: status, error } = await admin.rpc("cancel_booking", {
      p_booking_id: booking.id,
      p_reason: body.reason ?? "Dibatalkan oleh pengguna",
      p_actor_id: authId,
    })
    if (error) throwDatabaseError(error, "Booking")

    return Response.json({ booking: { id: booking.id, status } })
  } catch (error) {
    return errorResponse(error, "Booking gagal dibatalkan.")
  }
}
