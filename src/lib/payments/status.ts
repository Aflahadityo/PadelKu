import type { PaymentStatus } from "@/types/database"

export type PaymentEvent = "PENDING" | "SETTLED" | "FAILED" | "EXPIRED"
export type PaymentEventDecision = "PROCESS" | "IDEMPOTENT" | "IGNORE_CONFLICT"

export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string,
): PaymentEvent {
  switch (transactionStatus.toLowerCase()) {
    case "settlement":
      return "SETTLED"
    case "capture":
      return fraudStatus?.toLowerCase() === "accept" ? "SETTLED" : "PENDING"
    case "deny":
    case "cancel":
    case "failure":
      return "FAILED"
    case "expire":
      return "EXPIRED"
    case "pending":
    case "authorize":
      return "PENDING"
    default:
      return "PENDING"
  }
}

export function decidePaymentEvent(
  current: PaymentStatus,
  incoming: PaymentEvent,
): PaymentEventDecision {
  if (current === "PENDING") return incoming === "PENDING" ? "IDEMPOTENT" : "PROCESS"
  if (current === incoming) return "IDEMPOTENT"
  return "IGNORE_CONFLICT"
}
