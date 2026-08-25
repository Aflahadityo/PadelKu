export function parseMidtransAmount(value: string): number | null {
  if (!/^(?:0|[1-9]\d*)(?:\.0{1,2})?$/.test(value)) return null
  const amount = Number(value)
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null
}

export function paymentAmountMatches(value: string, expectedRupiah: number): boolean {
  return parseMidtransAmount(value) === expectedRupiah
}
