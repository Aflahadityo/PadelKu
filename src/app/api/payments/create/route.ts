import { z } from "zod"
import { createApiAdminSupabase, requireApiUser } from "@/lib/api/auth"
import { ApiError, errorResponse, parseJson, throwDatabaseError } from "@/lib/api/errors"

const schema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(["VA", "EWALLET", "QRIS"]),
}).strict()

export async function POST(request: Request) {
  try {
    if (process.env.PAYMENT_MODE !== "internal_sandbox") {
      throw new ApiError(503, "PAYMENT_DISABLED", "Sandbox pembayaran belum diaktifkan.")
    }
    const body = schema.parse(await parseJson(request))
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim()
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 150) {
      throw new ApiError(400, "INVALID_IDEMPOTENCY_KEY", "Idempotency-Key wajib berisi 8-150 karakter.")
    }
    const { authId, profile } = await requireApiUser()
    if (profile.role !== "PLAYER") throw new ApiError(403, "PLAYER_REQUIRED", "Hanya player yang dapat membayar booking.")
    const admin = createApiAdminSupabase()
    const { data, error } = await admin.rpc("create_sandbox_payment", {
      p_booking_id: body.bookingId,
      p_idempotency_key: idempotencyKey,
      p_method: body.method,
      p_user_id: authId,
    })
    if (error) throwDatabaseError(error, "Pembayaran")
    const payment = data?.[0]
    if (!payment) {
      throw new ApiError(410, "PAYMENT_EXPIRED", "Jendela pembayaran booking telah berakhir.")
    }
    const action = body.method === "VA"
      ? { kind: "VIRTUAL_ACCOUNT", value: payment.virtual_account }
      : body.method === "QRIS"
        ? { kind: "QR_PAYLOAD", value: payment.qr_payload }
        : { kind: "EWALLET_TOKEN", value: payment.qr_payload }
    return Response.json({
      payment: {
        action,
        amountRupiah: payment.amount_rupiah,
        commissionRupiah: payment.commission_rupiah,
        expiresAt: payment.expires_at,
        id: payment.payment_id,
        method: body.method,
        qrPayload: payment.qr_payload,
        status: payment.payment_status,
        simulatorEnabled:
          process.env.NODE_ENV !== "production"
          && process.env.PAYMENT_SANDBOX_SELF_SERVICE === "true",
        venueNetRupiah: payment.venue_net_rupiah,
        virtualAccount: payment.virtual_account,
      },
    }, { status: 201 })
  } catch (error) {
    return errorResponse(error, "Pembayaran sandbox gagal dibuat.")
  }
}
