"use client"

import { useEffect, useRef, useState } from "react"
import { addDays, format, isSameDay, isToday, subDays } from "date-fns"
import { id } from "date-fns/locale/id"
import { Calendar, Check, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { BookingSummary } from "@/components/booking/booking-summary"
import { CourtGrid, type CourtGridSlot } from "@/components/booking/court-grid"
import type { VenueAvailability } from "@/lib/data/marketplace"
import { cn, formatCurrency } from "@/lib/utils"

interface CreatedBooking {
  code: string
  id: string
  paymentExpiresAt: string | null
  paymentMethod: "PAY_AT_VENUE"
  status: "CONFIRMED"
  totalPriceRupiah: number
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
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const bookingKey = useRef(crypto.randomUUID())
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
    bookingKey.current = crypto.randomUUID()
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
      const bookingResult = await jsonRequest<{ booking: CreatedBooking }>("/api/bookings/create", {
        body: JSON.stringify({ idempotencyKey: bookingKey.current, slotIds: [selectedSlot.id] }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
      setBooking(bookingResult.booking)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Booking gagal dibuat.")
    } finally {
      setProcessing(false)
    }
  }

  if (booking && selectedSlot && selectedCourt) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 px-4 py-12 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-success" aria-hidden="true">
          <Check className="size-10 text-white" />
        </div>
        <div>
          <h1 className="text-h1 font-display text-ink mb-2">Booking Berhasil!</h1>
          <p className="text-body text-ink-muted">
            {selectedCourt.name} di {venueName} sudah dikonfirmasi.
          </p>
        </div>
        <div className="bg-surface rounded-card shadow-card w-full max-w-sm space-y-3 p-5 text-left">
          <div className="flex justify-between gap-4">
            <span className="text-ink-muted">ID Booking</span>
            <span className="font-mono text-sm text-ink">{booking.code}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-muted">Tanggal</span>
            <span className="font-medium text-ink">{date}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-muted">Jam</span>
            <span className="font-mono font-medium text-ink">
              {selectedSlot.startTime} - {selectedSlot.endTime}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-muted">Metode</span>
            <span className="font-medium text-ink">Bayar di venue</span>
          </div>
          <div className="border-border flex justify-between gap-4 border-t pt-3">
            <span className="font-semibold text-ink">Bayar di venue</span>
            <span className="font-mono text-h2 font-bold text-ink">
              {formatCurrency(booking.totalPriceRupiah)}
            </span>
          </div>
        </div>
        <p className="max-w-sm text-xs text-ink-muted">
          Tunjukkan ID booking kepada petugas dan lakukan pembayaran langsung di venue.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Link href="/bookings" className="btn-cta w-full px-5 py-3 text-sm font-bold">
            Lihat Booking Saya
          </Link>
          <Link href="/" className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-ink">
            Cari Venue Lain
          </Link>
        </div>
      </div>
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
      {selectedSlot && selectedCourt && (
        <div className="grid gap-6 lg:grid-cols-12 items-start pt-4 animate-in fade-in-50 duration-200">
          <div className="lg:col-span-5 rounded-2xl border border-border/90 bg-surface p-5 shadow-card space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Metode Pembayaran</h3>
              <p className="text-xs text-ink-muted">Pembayaran dilakukan langsung saat tiba di venue.</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-brand bg-brand/5 p-3 ring-1 ring-brand">
              <input
                type="radio"
                name="paymentMethod"
                value="PAY_AT_VENUE"
                checked
                readOnly
                className="size-4 text-brand focus:ring-brand"
              />
              <div>
                <span className="block text-xs font-bold text-ink">Bayar di venue</span>
                <span className="text-[0.6875rem] text-ink-muted">Tanpa pembayaran online</span>
              </div>
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
              submitLabel="Konfirmasi Booking"
            />
          </div>
        </div>
      )}
    </div>
  )
}
