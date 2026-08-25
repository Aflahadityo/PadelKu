import { describe, expect, it } from "vitest"
import { databaseErrorStatus } from "../api/errors"
import { parseMidtransAmount, paymentAmountMatches } from "./amount"
import { providerOrderId } from "./idempotency"
import { createMidtransSignature, verifyMidtransSignature } from "./signature"
import { decidePaymentEvent, mapMidtransStatus } from "./status"

describe("Midtrans signature", () => {
  const fields = {
    order_id: "PK-ORDER-1",
    status_code: "200",
    gross_amount: "150000.00",
  }

  it("verifies the SHA-512 signature", () => {
    const signature = createMidtransSignature(fields, "sandbox-server-key")
    expect(verifyMidtransSignature(fields, signature, "sandbox-server-key")).toBe(true)
  })

  it("rejects malformed and incorrect signatures without throwing", () => {
    expect(verifyMidtransSignature(fields, "short", "sandbox-server-key")).toBe(false)
    expect(verifyMidtransSignature(fields, "0".repeat(128), "sandbox-server-key")).toBe(false)
  })
})

describe("payment status mapping", () => {
  it.each([
    ["settlement", undefined, "SETTLED"],
    ["capture", "accept", "SETTLED"],
    ["capture", "challenge", "PENDING"],
    ["deny", undefined, "FAILED"],
    ["cancel", undefined, "FAILED"],
    ["expire", undefined, "EXPIRED"],
    ["pending", undefined, "PENDING"],
  ])("maps %s/%s", (status, fraud, expected) => {
    expect(mapMidtransStatus(status, fraud)).toBe(expected)
  })

  it("protects terminal states and recognizes retries", () => {
    expect(decidePaymentEvent("SETTLED", "SETTLED")).toBe("IDEMPOTENT")
    expect(decidePaymentEvent("SETTLED", "FAILED")).toBe("IGNORE_CONFLICT")
    expect(decidePaymentEvent("FAILED", "SETTLED")).toBe("IGNORE_CONFLICT")
    expect(decidePaymentEvent("PENDING", "SETTLED")).toBe("PROCESS")
  })
})

describe("amount and idempotency mapping", () => {
  it("accepts only exact positive whole-rupiah Midtrans amounts", () => {
    expect(parseMidtransAmount("150000.00")).toBe(150000)
    expect(paymentAmountMatches("150000.00", 150000)).toBe(true)
    expect(parseMidtransAmount("150000.50")).toBeNull()
    expect(parseMidtransAmount("1e5")).toBeNull()
    expect(parseMidtransAmount("0.00")).toBeNull()
  })

  it("derives a stable provider order ID from booking and method", () => {
    const bookingId = "8f0e786e-e209-4ec7-a0a2-fcf15e430bfd"
    expect(providerOrderId(bookingId, "QRIS")).toBe(providerOrderId(bookingId, "QRIS"))
    expect(providerOrderId(bookingId, "QRIS")).not.toBe(providerOrderId(bookingId, "VA"))
  })
})

describe("database error mapping", () => {
  it.each([
    ["22023", 400],
    ["23514", 400],
    ["42501", 403],
    ["P0002", 404],
    ["P0001", 409],
    ["23505", 409],
    ["XX000", 500],
  ])("maps SQLSTATE %s", (code, status) => {
    expect(databaseErrorStatus({ code })).toBe(status)
  })
})
