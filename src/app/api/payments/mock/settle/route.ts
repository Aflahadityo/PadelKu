import { z } from "zod"
import { createApiAdminSupabase, requireApiUser } from "@/lib/api/auth"
import { ApiError, errorResponse, parseJson, throwDatabaseError } from "@/lib/api/errors"

const schema = z.object({ paymentId: z.string().uuid(), command: z.enum(["SETTLE", "FAIL"]) }).strict()

export async function POST(request: Request) {
  try {
    if (
      process.env.NODE_ENV === "production"
      || process.env.PAYMENT_MODE !== "internal_sandbox"
      || process.env.PAYMENT_SANDBOX_SELF_SERVICE !== "true"
    ) {
      throw new ApiError(404, "NOT_FOUND", "Simulator pembayaran tidak tersedia.")
    }
    const body = schema.parse(await parseJson(request))
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim()
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 150) {
      throw new ApiError(400, "INVALID_IDEMPOTENCY_KEY", "Idempotency-Key wajib berisi 8-150 karakter.")
    }
    const { authId, profile, supabase } = await requireApiUser()
    if (profile.role !== "PLAYER") throw new ApiError(403, "PLAYER_REQUIRED", "Hanya player yang dapat menjalankan simulator ini.")
    const { data: payment, error: readError } = await supabase
      .from("payments")
      .select("id, booking_id, bookings!inner(user_id)")
      .eq("id", body.paymentId)
      .eq("bookings.user_id", authId)
      .maybeSingle()
    if (readError) throwDatabaseError(readError, "Pembayaran")
    if (!payment) throw new ApiError(404, "NOT_FOUND", "Pembayaran tidak ditemukan.")
    const admin = createApiAdminSupabase()
    const { data, error } = await admin.rpc("transition_sandbox_payment", {
      p_actor_id: authId,
      p_actor_role: "PLAYER",
      p_command: body.command,
      p_idempotency_key: idempotencyKey,
      p_payment_id: payment.id,
      p_reason: body.command === "FAIL" ? "Player memilih simulasi pembayaran gagal" : undefined,
    })
    if (error) throwDatabaseError(error, "Pembayaran")
    return Response.json({ result: data?.[0] })
  } catch (error) {
    return errorResponse(error, "Simulasi pembayaran gagal.")
  }
}
