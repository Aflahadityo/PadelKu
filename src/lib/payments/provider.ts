import { z } from "zod"
import type { Json, PaymentMethod } from "@/types/database"
import { ApiError } from "@/lib/api/errors"
import type { PaymentProviderConfig } from "./config"
import { providerOrderId } from "./idempotency"

export { providerOrderId } from "./idempotency"

const MIDTRANS_CORE_URL = "https://api.sandbox.midtrans.com/v2"
const MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1"

const midtransResponseSchema = z.object({
  transaction_id: z.string().optional(),
  order_id: z.string().optional(),
  status_code: z.string().optional(),
  status_message: z.string().optional(),
  transaction_status: z.string().optional(),
  gross_amount: z.string().optional(),
  payment_type: z.string().optional(),
  fraud_status: z.string().optional(),
  permata_va_number: z.string().optional(),
  va_numbers: z.array(z.object({ bank: z.string(), va_number: z.string() })).optional(),
  actions: z.array(z.object({ name: z.string(), url: z.url() })).optional(),
  expire_time: z.string().optional(),
  token: z.string().optional(),
  redirect_url: z.url().optional(),
}).passthrough()

export type PaymentInstructions = {
  instructions: string
  paymentUrl?: string
  vaNumber?: string
  qrCodeUrl?: string
}

export type ProviderPayment = PaymentInstructions & {
  payload: Json
}

function authorization(serverKey: string): string {
  return `Basic ${Buffer.from(`${serverKey}:`, "utf8").toString("base64")}`
}

async function midtransRequest(
  url: string,
  serverKey: string,
  init: RequestInit,
) {
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: authorization(serverKey),
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    })
  } catch {
    throw new ApiError(502, "PAYMENT_PROVIDER_UNAVAILABLE", "Provider pembayaran tidak dapat dihubungi.")
  }

  const raw: unknown = await response.json().catch(() => null)
  const parsed = midtransResponseSchema.safeParse(raw)
  if (!response.ok || !parsed.success) {
    throw new ApiError(502, "PAYMENT_PROVIDER_ERROR", "Provider pembayaran menolak transaksi.")
  }
  return parsed.data
}

export async function getMidtransTransactionStatus(orderId: string, serverKey: string) {
  return midtransRequest(
    `${MIDTRANS_CORE_URL}/${encodeURIComponent(orderId)}/status`,
    serverKey,
    { method: "GET" },
  )
}

export async function createProviderPayment(input: {
  config: PaymentProviderConfig
  bookingId: string
  bookingCode: string
  amountRupiah: number
  expiresAt: string
  method: PaymentMethod
  customer: { fullName: string; email: string; phone: string | null }
}): Promise<ProviderPayment> {
  const orderId = providerOrderId(input.bookingId, input.method)

  if (input.config.provider === "MOCK") {
    return {
      instructions: "Gunakan endpoint settlement mock development untuk menyelesaikan pembayaran.",
      paymentUrl: `/api/payments/mock/settle?bookingId=${input.bookingId}`,
      payload: {
        kind: "attempt",
        initialized: true,
        providerOrderId: orderId,
        instructions: "Gunakan endpoint settlement mock development untuk menyelesaikan pembayaran.",
        paymentUrl: `/api/payments/mock/settle?bookingId=${input.bookingId}`,
      },
    }
  }

  const remainingMinutes = Math.max(
    1,
    Math.ceil((new Date(input.expiresAt).getTime() - Date.now()) / 60_000),
  )
  const transactionDetails = {
    order_id: orderId,
    gross_amount: input.amountRupiah,
  }
  const customerDetails = {
    first_name: input.customer.fullName,
    email: input.customer.email,
    ...(input.customer.phone ? { phone: input.customer.phone } : {}),
  }

  if (input.method === "EWALLET") {
    const response = await midtransRequest(
      `${MIDTRANS_SNAP_URL}/transactions`,
      input.config.serverKey,
      {
        method: "POST",
        body: JSON.stringify({
          transaction_details: transactionDetails,
          customer_details: customerDetails,
          enabled_payments: ["gopay", "shopeepay"],
          expiry: { duration: remainingMinutes, unit: "minute" },
        }),
      },
    )
    if (!response.redirect_url) {
      throw new ApiError(502, "PAYMENT_PROVIDER_ERROR", "URL pembayaran tidak tersedia.")
    }
    return {
      instructions: "Buka halaman pembayaran Midtrans untuk memilih dompet digital.",
      paymentUrl: response.redirect_url,
      payload: {
        kind: "attempt",
        initialized: true,
        providerOrderId: orderId,
        instructions: "Buka halaman pembayaran Midtrans untuk memilih dompet digital.",
        paymentUrl: response.redirect_url,
        response: response as Json,
      },
    }
  }

  const response = await midtransRequest(
    `${MIDTRANS_CORE_URL}/charge`,
    input.config.serverKey,
    {
      method: "POST",
      body: JSON.stringify({
        payment_type: input.method === "VA" ? "bank_transfer" : "qris",
        transaction_details: transactionDetails,
        customer_details: customerDetails,
        custom_expiry: { expiry_duration: remainingMinutes, unit: "minute" },
        ...(input.method === "VA" ? { bank_transfer: { bank: "permata" } } : {}),
      }),
    },
  )

  if (response.order_id !== orderId) {
    throw new ApiError(502, "PAYMENT_PROVIDER_ERROR", "Identitas transaksi provider tidak cocok.")
  }

  if (input.method === "VA") {
    const vaNumber = response.permata_va_number ?? response.va_numbers?.[0]?.va_number
    if (!vaNumber) {
      throw new ApiError(502, "PAYMENT_PROVIDER_ERROR", "Nomor virtual account tidak tersedia.")
    }
    const instructions = "Transfer sesuai total tagihan ke Virtual Account sebelum waktu kedaluwarsa."
    return {
      instructions,
      vaNumber,
      payload: {
        kind: "attempt",
        initialized: true,
        providerOrderId: orderId,
        instructions,
        vaNumber,
        response: response as Json,
      },
    }
  }

  const qrCodeUrl = response.actions?.find((action) => action.name === "generate-qr-code")?.url
  if (!qrCodeUrl) {
    throw new ApiError(502, "PAYMENT_PROVIDER_ERROR", "Kode QR pembayaran tidak tersedia.")
  }
  const instructions = "Pindai QRIS dengan aplikasi pembayaran sebelum waktu kedaluwarsa."
  return {
    instructions,
    qrCodeUrl,
    payload: {
      kind: "attempt",
      initialized: true,
      providerOrderId: orderId,
      instructions,
      qrCodeUrl,
      response: response as Json,
    },
  }
}

export function readPaymentInstructions(payload: Json): PaymentInstructions | null {
  const parsed = z.object({
    initialized: z.literal(true),
    instructions: z.string(),
    paymentUrl: z.string().optional(),
    vaNumber: z.string().optional(),
    qrCodeUrl: z.string().optional(),
  }).safeParse(payload)
  return parsed.success ? parsed.data : null
}
