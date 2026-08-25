"use client"

import { useEffect, useRef, useState } from "react"
import { addDays, format, isToday, subDays } from "date-fns"
import { id } from "date-fns/locale/id"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BookingSuccess } from "@/components/booking/booking-success"
import { BookingSummary } from "@/components/booking/booking-summary"
import { CourtGrid, type CourtGridSlot } from "@/components/booking/court-grid"
import { PaymentModal } from "@/components/booking/payment-modal"
import type { VenueAvailability } from "@/lib/data/marketplace"

interface CreatedBooking { code: string; id: string; paymentExpiresAt: string; totalPriceRupiah: number }
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

  useEffect(() => {
    let active = true
    jsonRequest<VenueAvailability>(`/api/venues/${venueId}/availability?date=${date}`)
      .then((data) => { if (active) setAvailability(data) })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Jadwal gagal dimuat.") })
    return () => { active = false }
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
    endTime: new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: availability!.timezone }).format(new Date(slot.endsAt)),
    id: slot.id,
    price: slot.priceRupiah,
    startTime: new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: availability!.timezone }).format(new Date(slot.startsAt)),
    status: slot.status,
  }))
  const courts = (availability?.courts ?? []).map((court) => ({ id: court.id, name: court.name, courtNumber: court.courtNumber, pricePerHour: court.pricePerHourRupiah }))
  const selectedCourt = courts.find((court) => court.id === selectedSlot?.courtId)

  async function createBooking() {
    if (!selectedSlot) return
    setProcessing(true); setError(null)
    try {
      let currentBooking = booking
      if (!currentBooking) {
        const bookingResult = await jsonRequest<{ booking: CreatedBooking }>("/api/bookings/create", {
          body: JSON.stringify({ idempotencyKey: bookingKey.current, slotIds: [selectedSlot.id] }),
          headers: { "Content-Type": "application/json" }, method: "POST",
        })
        currentBooking = bookingResult.booking
        setBooking(currentBooking)
      }
      const paymentResult = await jsonRequest<{ payment: CreatedPayment }>("/api/payments/create", {
        body: JSON.stringify({ bookingId: currentBooking.id, method: paymentMethod }),
        headers: { "Content-Type": "application/json", "Idempotency-Key": paymentKey.current }, method: "POST",
      })
      setPayment(paymentResult.payment); setPaymentStatus("pending"); setPaymentOpen(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Booking gagal dibuat.")
    } finally { setProcessing(false) }
  }

  async function simulate(command: "SETTLE" | "FAIL") {
    if (!payment || !booking) return
    try {
      await jsonRequest("/api/payments/mock/settle", {
        body: JSON.stringify({ command, paymentId: payment.id }),
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, method: "POST",
      })
      await checkStatus()
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Status gagal diperbarui."); setPaymentStatus("error") }
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
    const methodLabels = { EWALLET: "E-wallet Sandbox", QRIS: "QRIS Sandbox", VA: "Virtual Account Sandbox" }
    return <BookingSuccess venueName={venueName} courtName={selectedCourt.name} date={date} startTime={selectedSlot.startTime} endTime={selectedSlot.endTime} totalPrice={booking.totalPriceRupiah} orderId={booking.code} paymentMethod={methodLabels[payment?.method ?? paymentMethod]} />
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center gap-3">
        <button type="button" disabled={isToday(selectedDate)} onClick={() => changeDate(subDays(selectedDate, 1))} className="grid size-11 place-items-center rounded-control border border-border disabled:opacity-35" aria-label="Hari sebelumnya"><ChevronLeft aria-hidden="true" /></button>
        <div className="flex-1 text-center"><p className="font-semibold">{isToday(selectedDate) ? "Hari ini" : format(selectedDate, "EEEE", { locale: id })}</p><p className="text-xs text-ink-muted">{format(selectedDate, "d MMMM yyyy", { locale: id })}</p></div>
        <button type="button" onClick={() => changeDate(addDays(selectedDate, 1))} className="grid size-11 place-items-center rounded-control border border-border" aria-label="Hari berikutnya"><ChevronRight aria-hidden="true" /></button>
      </div>
      {error ? <p role="alert" className="border-l-2 border-error pl-3 text-sm text-error">{error}</p> : null}
      {!availability && !error ? <p className="py-12 text-center text-sm text-ink-muted">Memuat jadwal...</p> : null}
      {availability ? <CourtGrid courts={courts} slots={slots} selectedSlotId={selectedSlot?.id} onSlotSelect={setSelectedSlot} /> : null}
      {selectedSlot && selectedCourt && !payment ? <div className="space-y-3"><label className="block text-sm font-semibold">Metode pembayaran<select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value as PaymentMethod); paymentKey.current = crypto.randomUUID() }} className="mt-2 h-11 w-full rounded-control border border-border-strong bg-surface px-3"><option value="VA">Virtual Account</option><option value="QRIS">QRIS</option><option value="EWALLET">E-wallet</option></select></label><BookingSummary venueName={venueName} courtName={selectedCourt.name} date={date} startTime={selectedSlot.startTime} endTime={selectedSlot.endTime} price={selectedSlot.price} onConfirm={createBooking} isProcessing={processing} submitLabel={booking ? "Lanjutkan ke pembayaran" : undefined} /></div> : null}
      {payment && booking && !paymentOpen && paymentStatus === "pending" ? <button type="button" onClick={() => setPaymentOpen(true)} className="w-full rounded-control border border-border bg-surface p-4 text-sm font-semibold">Lanjutkan pembayaran {booking.code}</button> : null}
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
        instructionLabel={payment?.action.kind === "QR_PAYLOAD" ? "Payload QRIS sandbox" : payment?.action.kind === "EWALLET_TOKEN" ? "Token e-wallet sandbox" : undefined}
        instructionValue={payment?.action.kind === "VIRTUAL_ACCOUNT" ? null : payment?.action.value}
        bankName="Sandbox Bank"
        expiryTime={payment ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payment.expiresAt)) : undefined}
        status={paymentStatus}
        onCheckStatus={checkStatus}
        onSimulate={payment?.simulatorEnabled ? simulate : undefined}
      />
    </div>
  )
}
