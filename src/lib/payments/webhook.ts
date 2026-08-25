import { z } from "zod"
import type { PaymentMethod } from "@/types/database"

export const midtransNotificationSchema = z.object({
  order_id: z.string().min(1),
  status_code: z.string().regex(/^\d{3}$/),
  gross_amount: z.string().min(1),
  signature_key: z.string().min(1),
  transaction_status: z.string().min(1),
  transaction_id: z.string().min(1),
  payment_type: z.string().optional(),
  fraud_status: z.string().optional(),
}).passthrough()

export type MidtransNotification = z.infer<typeof midtransNotificationSchema>

export function midtransMethodMatches(
  method: PaymentMethod,
  paymentType: string | undefined,
): boolean {
  if (!paymentType) return true
  const normalized = paymentType.toLowerCase()
  if (method === "VA") return ["bank_transfer", "echannel"].includes(normalized)
  if (method === "QRIS") return normalized === "qris"
  return ["gopay", "shopeepay"].includes(normalized)
}
