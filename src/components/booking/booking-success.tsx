"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface BookingSuccessProps {
  venueName: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  totalPrice: number
  orderId: string
  paymentMethod: string
}

export function BookingSuccess({
  venueName,
  courtName,
  date,
  startTime,
  endTime,
  totalPrice,
  orderId,
  paymentMethod,
}: BookingSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6">
      {/* Bounce checkmark animation - the signature micro-animation per Design.md */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 12,
          duration: 0.4,
        }}
        className="w-20 h-20 rounded-full bg-success flex items-center justify-center"
        aria-hidden="true"
      >
        <Check className="w-10 h-10 text-white" />
      </motion.div>

      <div>
        <h1 className="text-h1 font-display text-ink mb-2">Booking Berhasil!</h1>
        <p className="text-body text-ink-muted">
          Lapangan {courtName} di {venueName} sudah kamu booking.
        </p>
      </div>

      <div className="bg-surface rounded-card shadow-card p-5 w-full max-w-sm text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-ink-muted">ID Booking</span>
          <span className="font-mono text-sm text-ink">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Tanggal</span>
          <span className="font-medium text-ink">{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Jam</span>
          <span className="font-mono font-medium text-ink">
            {startTime} – {endTime}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Pembayaran</span>
          <span className="font-medium text-ink">{paymentMethod}</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between">
          <span className="font-semibold text-ink">Total Dibayar</span>
          <span className="font-mono font-bold text-h2 text-success">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link href="/bookings" className="w-full">
          <Button variant="primary" className="w-full" size="lg">
            Lihat Booking Saya
          </Button>
        </Link>
        <Link href="/" className="w-full">
          <Button variant="secondary" className="w-full" size="lg">
            Cari Venue Lain
          </Button>
        </Link>
      </div>
    </div>
  )
}
