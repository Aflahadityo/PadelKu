import { ApiError, errorResponse } from "@/lib/api/errors"

export async function POST() {
  return errorResponse(
    new ApiError(410, "PROVIDER_WEBHOOK_DISABLED", "Webhook provider dinonaktifkan pada mode internal sandbox."),
    "Webhook dinonaktifkan.",
  )
}
