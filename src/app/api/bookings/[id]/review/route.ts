import { z } from "zod"
import { requireApiUser } from "@/lib/api/auth"
import { ApiError, errorResponse, parseJson, throwDatabaseError } from "@/lib/api/errors"

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(2000).nullable().optional(),
}).strict()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const bookingId = z.string().uuid().parse((await params).id)
    const body = reviewSchema.parse(await parseJson(request))
    const { authId, supabase } = await requireApiUser()
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, venue_id, status")
      .eq("id", bookingId)
      .eq("user_id", authId)
      .maybeSingle()

    if (bookingError) throwDatabaseError(bookingError, "Booking")
    if (!booking) throw new ApiError(404, "NOT_FOUND", "Booking tidak ditemukan.")
    if (booking.status !== "COMPLETED") {
      throw new ApiError(409, "BOOKING_NOT_COMPLETED", "Review hanya dapat dibuat setelah booking selesai.")
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        booking_id: booking.id,
        user_id: authId,
        venue_id: booking.venue_id,
        rating: body.rating,
        comment: body.comment ?? null,
      })
      .select("id, booking_id, venue_id, rating, comment, created_at")
      .single()

    if (error) throwDatabaseError(error, "Review")
    return Response.json({ review }, { status: 201 })
  } catch (error) {
    return errorResponse(error, "Review gagal dibuat.")
  }
}
