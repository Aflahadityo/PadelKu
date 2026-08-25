import type { PaymentMethod } from "@/types/database"

export function providerOrderId(bookingId: string, method: PaymentMethod): string {
  return `PK-${bookingId}-${method}`
}
