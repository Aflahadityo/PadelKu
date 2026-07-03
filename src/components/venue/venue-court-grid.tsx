"use client"

import { useState } from "react"
import { CourtGrid } from "@/components/booking/court-grid"
import { BookingSummary } from "@/components/booking/booking-summary"
import { PaymentModal } from "@/components/booking/payment-modal"
import { BookingSuccess } from "@/components/booking/booking-success"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, subDays, isToday, parseISO } from "date-fns"
import { id } from "date-fns/locale/id"

interface Court {
  id: string
  name: string
  courtNumber: number
  pricePerHour: number
  isActive: boolean
}

interface VenueCourtGridProps {
  venueId: string
  courts: Court[]
}

// Demo slot data generator
function generateDemoSlots(courts: Court[], dateStr: string) {
  const slots: any[] = []
  const hours = Array.from({ length: 14 }, (_, i) => i + 8)

  courts.filter(c => c.isActive).forEach((court) => {
    hours.forEach((hour) => {
      const startTime = `${hour.toString().padStart(2, "0")}:00`
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`

      // Deterministic pseudo-random for demo purposes
      const seed = court.courtNumber * 100 + hour
      const pseudoRandom = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

      let status = "AVAILABLE"
      if (pseudoRandom < 0.15) status = "BOOKED"
      else if (pseudoRandom < 0.18) status = "LOCKED"

      slots.push({
        id: `slot-${court.id}-${hour}`,
        courtId: court.id,
        startTime,
        endTime,
        status,
        price: court.pricePerHour,
      })
    })
  })

  return slots
}

export function VenueCourtGrid({ venueId, courts }: VenueCourtGridProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "expired" | "error">("pending")

  const dateStr = format(selectedDate, "yyyy-MM-dd")
  const slots = generateDemoSlots(courts, dateStr)

  const activeCourts = courts.filter(c => c.isActive)
  const selectedCourt = activeCourts.find(c => c.id === selectedSlot?.courtId)

  const handleConfirmBooking = () => {
    setShowPayment(true)
    setPaymentStatus("pending")
    // In real flow, this calls API to create booking & get payment URL
  }

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={() => setSelectedDate(d => subDays(d, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border"
          aria-label="Hari sebelumnya"
        >
          <ChevronLeft className="w-5 h-5 text-ink-muted" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-body font-medium text-ink">
            {isToday(selectedDate) ? "Hari Ini" : format(selectedDate, "EEEE", { locale: id })}
          </span>
          <span className="text-caption text-ink-muted block">
            {format(selectedDate, "d MMMM yyyy", { locale: id })}
          </span>
        </div>
        <button
          onClick={() => setSelectedDate(d => addDays(d, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border"
          aria-label="Hari berikutnya"
        >
          <ChevronRight className="w-5 h-5 text-ink-muted" />
        </button>
      </div>

      {/* Court Grid */}
      <CourtGrid
        courts={activeCourts}
        slots={slots}
        selectedSlotId={selectedSlot?.id}
        onSlotSelect={setSelectedSlot}
        date={dateStr}
      />

      {/* Selected slot summary */}
      {selectedSlot && selectedCourt && !showSuccess && (
        <BookingSummary
          venueName="Padel House Kemang"
          courtName={selectedCourt.name}
          date={dateStr}
          startTime={selectedSlot.startTime}
          endTime={selectedSlot.endTime}
          price={selectedSlot.price}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment && !showSuccess}
        onClose={() => setShowPayment(false)}
        orderId="PK-DEMO-001"
        totalPrice={selectedSlot?.price || 0}
        vaNumber="9880990012345678"
        bankName="Bank Mandiri"
        expiryTime="10 menit"
        status={paymentStatus}
        onCheckStatus={() => {
          // Simulate payment success for demo
          setPaymentStatus("success")
          setTimeout(() => {
            setShowPayment(false)
            setShowSuccess(true)
          }, 1500)
        }}
      />

      {/* Success Screen */}
      {showSuccess && (
        <BookingSuccess
          venueName="Padel House Kemang"
          courtName={selectedCourt?.name || ""}
          date={dateStr}
          startTime={selectedSlot?.startTime || ""}
          endTime={selectedSlot?.endTime || ""}
          totalPrice={selectedSlot?.price || 0}
          orderId="PK-DEMO-001"
          paymentMethod="Virtual Account Mandiri"
        />
      )}
    </div>
  )
}
