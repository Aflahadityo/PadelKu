import { createHash, timingSafeEqual } from "node:crypto"

export type MidtransSignatureFields = {
  order_id: string
  status_code: string
  gross_amount: string
}

export function createMidtransSignature(
  fields: MidtransSignatureFields,
  serverKey: string,
): string {
  return createHash("sha512")
    .update(
      `${fields.order_id}${fields.status_code}${fields.gross_amount}${serverKey}`,
      "utf8",
    )
    .digest("hex")
}

export function verifyMidtransSignature(
  fields: MidtransSignatureFields,
  signature: string,
  serverKey: string,
): boolean {
  const expected = Buffer.from(createMidtransSignature(fields, serverKey), "hex")
  const supplied = /^[a-f\d]{128}$/i.test(signature)
    ? Buffer.from(signature, "hex")
    : Buffer.alloc(0)

  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}
