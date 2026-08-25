"use client"

import { Check, Copy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  totalPrice: number
  vaNumber?: string
  bankName?: string
  expiryTime?: string
  instructionLabel?: string
  instructionValue?: string | null
  status: "pending" | "success" | "expired" | "error"
  onCheckStatus: () => void
  onSimulate?: (command: "SETTLE" | "FAIL") => void
}

export function PaymentModal({
  bankName,
  expiryTime,
  isOpen,
  instructionLabel,
  instructionValue,
  onCheckStatus,
  onClose,
  onSimulate,
  orderId,
  status,
  totalPrice,
  vaNumber,
}: PaymentModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/55 sm:place-items-center" onMouseDown={onClose}>
      <section
        aria-labelledby="payment-title"
        aria-modal="true"
        role="dialog"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-card bg-surface p-6 shadow-float sm:rounded-card"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-5 flex items-center justify-between">
          <h2 id="payment-title" className="font-display text-xl font-bold text-ink">Pembayaran</h2>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center" aria-label="Tutup pembayaran">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {status === "pending" ? (
          <div className="space-y-5">
            <dl className="space-y-3 bg-surface-muted p-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-ink-muted">Total</dt><dd className="font-mono font-bold">{formatCurrency(totalPrice)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-muted">ID Order</dt><dd className="font-mono">{orderId}</dd></div>
            </dl>
            {vaNumber || instructionValue ? (
              <div>
                <p className="mb-2 text-sm font-semibold">{instructionLabel ?? `Transfer ke ${bankName}`}</p>
                <div className="flex items-center gap-2 border border-border p-3">
                  <span className="min-w-0 flex-1 break-all font-mono text-sm font-bold tracking-wide">{instructionValue ?? vaNumber}</span>
                  <button type="button" onClick={() => navigator.clipboard.writeText(instructionValue ?? vaNumber ?? "")} className="grid size-11 place-items-center" aria-label="Salin instruksi pembayaran">
                    <Copy className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : null}
            {expiryTime ? <p className="text-center text-xs font-semibold text-error">Batas pembayaran: {expiryTime}</p> : null}
            <Button type="button" className="w-full" onClick={onCheckStatus}>Cek status pembayaran</Button>
            {onSimulate ? (
              <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                <Button type="button" variant="secondary" onClick={() => onSimulate("SETTLE")}>Simulasi lunas</Button>
                <Button type="button" variant="destructive" onClick={() => onSimulate("FAIL")}>Simulasi gagal</Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5 py-4 text-center">
            {status === "success" ? <Check className="mx-auto size-12 text-success" aria-hidden="true" /> : null}
            <p className={status === "success" ? "font-semibold text-success" : "font-semibold text-error"}>
              {status === "success" ? "Pembayaran berhasil." : status === "expired" ? "Pembayaran kedaluwarsa." : "Pembayaran gagal. Coba lagi."}
            </p>
            <Button type="button" variant="secondary" className="w-full" onClick={onClose}>Tutup</Button>
          </div>
        )}
      </section>
    </div>
  )
}
