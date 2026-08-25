import { timingSafeEqual } from "node:crypto"
import { z } from "zod"
import { createApiAdminSupabase } from "@/lib/api/auth"
import { ApiError, errorResponse, throwDatabaseError } from "@/lib/api/errors"

function authorized(request: Request) {
  const expected = process.env.MAINTENANCE_SECRET
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!expected || expected.length < 32 || !provided) return false
  const expectedBytes = Buffer.from(expected)
  const providedBytes = Buffer.from(provided)
  return expectedBytes.length === providedBytes.length
    && timingSafeEqual(expectedBytes, providedBytes)
}

export async function POST(request: Request) {
  try {
    if (!authorized(request)) {
      throw new ApiError(401, "UNAUTHORIZED", "Kredensial maintenance tidak valid.")
    }
    const url = new URL(request.url)
    const limit = z.coerce.number().int().min(1).max(500).default(100).parse(
      url.searchParams.get("limit") ?? undefined,
    )
    const admin = createApiAdminSupabase()
    const { data, error } = await admin.rpc("run_backend_maintenance", { p_limit: limit })
    if (error) throwDatabaseError(error, "Maintenance backend")
    return Response.json({ maintenance: data?.[0] ?? { completed_bookings: 0, expired_bookings: 0 } })
  } catch (error) {
    return errorResponse(error, "Maintenance backend gagal dijalankan.")
  }
}
