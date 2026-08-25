import { z } from "zod"
import { createApiAdminSupabase, requireApiUser } from "@/lib/api/auth"
import { errorResponse, parseJson, throwDatabaseError } from "@/lib/api/errors"

const createBookingSchema = z.object({
  slotIds: z.array(z.string().uuid()).min(1).max(8),
  idempotencyKey: z.string().trim().min(8).max(100),
}).strict().superRefine(({ slotIds }, context) => {
  if (new Set(slotIds).size !== slotIds.length) {
    context.addIssue({
      code: "custom",
      path: ["slotIds"],
      message: "Slot tidak boleh duplikat.",
    })
  }
})

export async function POST(request: Request) {
  try {
    const { authId } = await requireApiUser()
    const body = createBookingSchema.parse(await parseJson(request))
    const admin = createApiAdminSupabase()
    const { data, error } = await admin.rpc("create_pay_at_venue_booking", {
      p_user_id: authId,
      p_slot_ids: body.slotIds,
      p_idempotency_key: body.idempotencyKey,
    })

    if (error) throwDatabaseError(error, "Booking")
    const booking = data?.[0]
    if (!booking) throwDatabaseError({ code: "P0002" }, "Booking")

    return Response.json(
      {
        booking: {
          id: booking.booking_id,
          code: booking.booking_code,
          paymentMethod: booking.payment_mode,
          status: booking.booking_status,
          totalPriceRupiah: booking.total_price_rupiah,
          paymentExpiresAt: booking.payment_expires_at,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return errorResponse(error, "Booking gagal dibuat.")
  }
}
