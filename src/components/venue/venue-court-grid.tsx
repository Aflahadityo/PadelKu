"use client"

import { useEffect, useRef, useState } from "react"
import { addDays, format, isSameDay, isToday, subDays } from "date-fns"
import { id } from "date-fns/locale/id"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { BookingSuccess } from "@/components/booking/booking-success"
import { BookingSummary } from "@/components/booking/booking-summary"
import { CourtGrid, type CourtGridSlot } from "@/components/booking/court-grid"
import { PaymentModal } from "@/components/booking/payment-modal"
import type { VenueAvailability } from "@/lib/data/marketplace"
import { cn } from "@/lib/utils"

interface CreatedBooking {
  code: string
  id: string
  paymentExpiresAt: string
  totalPriceRupiah: number
}

type PaymentMethod = "VA" | "EWALLET" | "QRIS"

interface CreatedPayment {
  action: { kind: "VIRTUAL_ACCOUNT" | "QR_PAYLOAD" | "EWALLET_TOKEN"; value: string | null }
  expiresAt: string
  id: string
  method: PaymentMethod
  simulatorEnabled: boolean
  status: string
  virtualAccount: string | null
}

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error?.message ?? body.error ?? "Permintaan gagal.")
  return body as T
}

export function VenueCourtGrid({ venueId, venueName }: { venueId: string; venueName: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availability, setAvailability] = useState<VenueAvailability | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<CourtGridSlot | null>(null)
  const [booking, setBooking] = useState<CreatedBooking | null>(null)
  const [payment, setPayment] = useState<CreatedPayment | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("VA")
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "expired" | "error">("pending")
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const bookingKey = useRef(crypto.randomUUID())
  const paymentKey = useRef(crypto.randomUUID())
  const date = format(selectedDate, "yyyy-MM-dd")

  // Generate 7 days quick chips
  const quickDays = Array.from({ length: 7 }).map((_, index) => addDays(new Date(), index))

  useEffect(() => {
    let active = true
    jsonRequest<VenueAvailability>(`/api/venues/${venueId}/availability?date=${date}`)
      .then((data) => {
        if (active) setAvailability(data)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Jadwal gagal dimuat.")
      })
    return () => {
      active = false
    }
  }, [date, venueId])

  function changeDate(next: Date) {
    setAvailability(null)
    setSelectedSlot(null)
    setError(null)
    setBooking(null)
    setPayment(null)
    bookingKey.current = crypto.randomUUID()
    paymentKey.current = crypto.randomUUID()
    setSelectedDate(next)
  }

  const slots: CourtGridSlot[] = (availability?.slots ?? []).map((slot) => ({
    courtId: slot.courtId,
    endTime: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: availability!.timezone,
    }).format(new Date(slot.endsAt)),
    id: slot.id,
    price: slot.priceRupiah,
    startTime: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: availability!.timezone,
    }).format(new Date(slot.startsAt)),
    status: slot.status,
  }))

  const courts = (availability?.courts ?? []).map((court) => ({
    id: court.id,
    name: court.name,
    courtNumber: court.courtNumber,
    pricePerHour: court.pricePerHourRupiah,
  }))

  const selectedCourt = courts.find((court) => court.id === selectedSlot?.courtId)

  async function createBooking() {
    if (!selectedSlot) return
    setProcessing(true)
    setError(null)
    try {
      let currentBooking = booking
      if (!currentBooking) {
        const bookingResult = await jsonRequest<{ booking: CreatedBooking }>("/api/bookings/create", {
          body: JSON.stringify({ idempotencyKey: bookingKey.current, slotIds: [selectedSlot.id] }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        })
        currentBooking = bookingResult.booking
        setBooking(currentBooking)
      }
      const paymentResult = await jsonRequest<{ payment: CreatedPayment }>("/api/payments/create", {
        body: JSON.stringify({ bookingId: currentBooking.id, method: paymentMethod }),
        headers: { "Content-Type": "application/json", "Idempotency-Key": paymentKey.current },
        method: "POST",
      })
      setPayment(paymentResult.payment)
      setPaymentStatus("pending")
      setPaymentOpen(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Booking gagal dibuat.")
    } finally {
      setProcessing(false)
    }
  }

  async function simulate(command: "SETTLE" | "FAIL") {
    if (!payment || !booking) return
    try {
      await jsonRequest("/api/payments/mock/settle", {
        body: JSON.stringify({ command, paymentId: payment.id }),
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        method: "POST",
      })
      await checkStatus()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Status gagal diperbarui.")
      setPaymentStatus("error")
    }
  }

  async function checkStatus() {
    if (!payment || !booking) return
    try {
      const state = await jsonRequest<{
        booking: { status: string }
        payments: Array<{ id: string; status: string }>
      }>(`/api/payments/${booking.id}/status`)
      const currentPayment = state.payments.find((item) => item.id === payment.id)
      if (state.booking.status === "CONFIRMED" || state.booking.status === "COMPLETED") {
        setPaymentStatus("success")
      } else if (state.booking.status === "CANCELLED" || new Date(payment.expiresAt) <= new Date()) {
        setPaymentStatus("expired")
      } else if (currentPayment?.status === "FAILED") {
        setPaymentStatus("error")
      } else {
        setPaymentStatus("pending")
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Status gagal dimuat.")
    }
  }

  if (paymentStatus === "success" && booking && selectedSlot && selectedCourt) {
    const methodLabels = {
      EWALLET: "E-wallet Sandbox",
      QRIS: "QRIS Sandbox",
      VA: "Virtual Account Sandbox",
    }
    return (
      <BookingSuccess
        venueName={venueName}
        courtName={selectedCourt.name}
        date={date}
        startTime={selectedSlot.startTime}
        endTime={selectedSlot.endTime}
        totalPrice={booking.totalPriceRupiah}
        orderId={booking.code}
        paymentMethod={methodLabels[payment?.method ?? paymentMethod]}
      />
    )
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Quick Day Chips Bar */}
      <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Calendar className="size-4 text-brand" />
            <span>Pilih Tanggal Main:</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={isToday(selectedDate)}
              onClick={() => changeDate(subDays(selectedDate, 1))}
              className="grid size-8 place-items-center rounded-lg border border-border hover:bg-surface-muted disabled:opacity-30 transition-colors"
              aria-label="Hari sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-mono text-xs font-semibold px-2 text-ink">
              {format(selectedDate, "d MMMM yyyy", { locale: id })}
            </span>
            <button
              type="button"
              onClick={() => changeDate(addDays(selectedDate, 1))}
              className="grid size-8 place-items-center rounded-lg border border-border hover:bg-surface-muted transition-colors"
              aria-label="Hari berikutnya"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Swipeable / Clickable 7-day Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickDays.map((d, index) => {
            const isSelected = isSameDay(d, selectedDate)
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => changeDate(d)}
                className={cn(
                  "flex min-w-[5.5rem] flex-1 flex-col items-center justify-center rounded-xl p-2.5 text-xs transition-all duration-150",
                  isSelected
                    ? "bg-ink text-white font-bold shadow-xs scale-[1.02]"
                    : "border border-border/80 bg-surface-muted/60 text-ink-muted hover:border-brand/40 hover:bg-surface hover:text-ink",
                )}
              >
                <span className="text-[0.625rem] uppercase tracking-wider opacity-80">
                  {index === 0 ? "Hari ini" : index === 1 ? "Besok" : format(d, "EEE", { locale: id })}
                </span>
                <span className="font-mono text-sm font-extrabold mt-0.5">
                  {format(d, "d MMM", { locale: id })}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div role="alert" className="rounded-xl border border-error/30 bg-error/10 p-4 text-xs font-semibold text-error">
          {error}
        </div>
      )}

      {/* Loading state */}
      {!availability && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-surface-muted/40">
          <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-ink-muted">Sinkronisasi jadwal real-time venue...</p>
        </div>
      )}

      {/* Court Grid Schedule */}
      {availability && (
        <CourtGrid
          courts={courts}
          slots={slots}
          selectedSlotId={selectedSlot?.id}
          onSlotSelect={setSelectedSlot}
        />
      )}

      {/* Selected Slot Confirmation & Checkout */}
      {selectedSlot && selectedCourt && !payment && (
        <div className="grid gap-6 lg:grid-cols-12 items-start pt-4 animate-in fade-in-50 duration-200">
          {/* Payment Method Selector (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-border/90 bg-surface p-5 shadow-card space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Metode Pembayaran</h3>
              <p className="text-xs text-ink-muted">Pilih jalur pembayaran otomatis yang Anda inginkan.</p>
            </div>

            <div className="space-y-2">
              {[
                { id: "VA", label: "Virtual Account BCA / Mandiri", desc: "Verifikasi otomatis 24 jam" },
                { id: "QRIS", label: "QRIS Instant (Gopay/OVO/ShopeePay)", desc: "Scan barcode langsung bayar" },
                { id: "EWALLET", label: "E-Wallet Sandbox", desc: "Debit instan saldo dompet" },
              ].map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                    paymentMethod === m.id
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-border hover:bg-surface-muted",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value as PaymentMethod)
                        paymentKey.current = crypto.randomUUID()
                      }}
                      className="size-4 text-brand focus:ring-brand"
                    />
                    <div>
                      <span className="block text-xs font-bold text-ink">{m.label}</span>
                      <span className="text-[0.6875rem] text-ink-muted">{m.desc}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Booking Summary (7 Cols) */}
          <div className="lg:col-span-7">
            <BookingSummary
              venueName={venueName}
              courtName={selectedCourt.name}
              date={date}
              startTime={selectedSlot.startTime}
              endTime={selectedSlot.endTime}
              price={selectedSlot.price}
              onConfirm={createBooking}
              isProcessing={processing}
              submitLabel={booking ? "Lanjutkan ke pembayaran" : "Konfirmasi & Kunci Slot 10 Menit"}
            />
          </div>
        </div>
      )}

      {/* Resume Pending Payment button if user closed modal */}
      {payment && booking && !paymentOpen && paymentStatus === "pending" && (
        <div className="rounded-2xl border-2 border-brand bg-brand/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-display text-sm font-bold text-ink">Pembayaran Anda Masih Aktif</p>
            <p className="text-xs text-ink-muted">Kode Booking: <span className="font-mono font-bold text-ink">{booking.code}</span></p>
          </div>
          <button
            type="button"
            onClick={() => setPaymentOpen(true)}
            className="btn-cta text-xs font-bold px-5 py-2.5 shadow-xs"
          >
            Buka Instruksi Pembayaran
          </button>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={Boolean(payment && booking) && paymentOpen && paymentStatus !== "success"}
        onClose={() => {
          setPaymentOpen(false)
          if (paymentStatus === "error") {
            setPayment(null)
            paymentKey.current = crypto.randomUUID()
          }
        }}
        orderId={booking?.code ?? ""}
        totalPrice={booking?.totalPriceRupiah ?? 0}
        vaNumber={payment?.virtualAccount ?? undefined}
        instructionLabel={
          payment?.action.kind === "QR_PAYLOAD"
            ? "Payload QRIS sandbox"
            : payment?.action.kind === "EWALLET_TOKEN"
            ? "Token e-wallet sandbox"
            : undefined
        }
        instructionValue={payment?.action.kind === "VIRTUAL_ACCOUNT" ? null : payment?.action.value}
        bankName="Sandbox Bank"
        expiryTime={
          payment
            ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
                new Date(payment.expiresAt),
              )
            : undefined
        }
        status={paymentStatus}
        onCheckStatus={checkStatus}
        onSimulate={payment?.simulatorEnabled ? simulate : undefined}
      />
    </div>
  )
}
