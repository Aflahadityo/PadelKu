"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface BookingSummaryProps {
  venueName: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  price: number
  onConfirm: () => void
  isProcessing?: boolean
}

export function BookingSummary({
  venueName,
  courtName,
  date,
  startTime,
  endTime,
  price,
  onConfirm,
  isProcessing,
}: BookingSummaryProps) {
  return (
    <div className="bg-surface rounded-card shadow-card p-5 space-y-4">
      <h2 className="text-h2 font-display text-ink">Ringkasan Booking</h2>
      <div className="space-y-3 text-body">
        <div className="flex justify-between">
          <span className="text-ink-muted">Venue</span>
          <span className="font-medium text-ink">{venueName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Lapangan</span>
          <span className="font-medium text-ink">{courtName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Tanggal</span>
          <span className="font-medium text-ink">{formatDate(date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Jam</span>
          <span className="font-medium text-ink font-mono">
            {startTime} – {endTime}
          </span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between">
          <span className="text-ink font-semibold">Total</span>
          <span className="font-mono font-bold text-h2 text-ink">
            {formatCurrency(price)}
          </span>
        </div>
      </div>
      <Button
        className="w-full"
        variant="primary"
        size="lg"
        onClick={onConfirm}
        disabled={isProcessing}
      >
        {isProcessing ? "Memproses..." : "Booking Sekarang"}
      </Button>
    </div>
  )
}
