import { z } from "zod"
import { ApiError } from "@/lib/api/errors"

export type PaymentProviderConfig =
  | { provider: "MOCK" }
  | { provider: "MIDTRANS"; serverKey: string; verifyStatus: boolean }

const serverKeySchema = z.string().trim().min(1)

export function getPaymentProviderConfig(
  env: NodeJS.ProcessEnv = process.env,
): PaymentProviderConfig {
  const provider = (env.PAYMENT_PROVIDER ?? "midtrans").trim().toLowerCase()

  if (provider === "mock") {
    if (env.NODE_ENV === "production") {
      throw new ApiError(500, "PAYMENT_CONFIGURATION_ERROR", "Provider mock tidak tersedia.")
    }
    return { provider: "MOCK" }
  }

  if (provider !== "midtrans") {
    throw new ApiError(500, "PAYMENT_CONFIGURATION_ERROR", "Provider pembayaran tidak valid.")
  }

  const serverKey = serverKeySchema.safeParse(env.MIDTRANS_SERVER_KEY)
  if (!serverKey.success) {
    throw new ApiError(500, "PAYMENT_CONFIGURATION_ERROR", "Konfigurasi pembayaran belum lengkap.")
  }

  return {
    provider: "MIDTRANS",
    serverKey: serverKey.data,
    verifyStatus: env.MIDTRANS_VERIFY_STATUS?.toLowerCase() === "true",
  }
}

export function getMidtransWebhookConfig(
  env: NodeJS.ProcessEnv = process.env,
): Extract<PaymentProviderConfig, { provider: "MIDTRANS" }> {
  const config = getPaymentProviderConfig(env)
  if (config.provider !== "MIDTRANS") {
    throw new ApiError(404, "NOT_FOUND", "Endpoint tidak tersedia.")
  }
  return config
}
