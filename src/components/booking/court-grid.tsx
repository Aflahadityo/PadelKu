"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Slot {
  id: string
  startTime: string
  endTime: string
  status: "AVAILABLE" | "BOOKED" | "LOCKED" | "CANCELLED"
  price: number
  courtId: string
  courtName?: string
}

interface CourtData {
  id: string
  name: string
  courtNumber: number
  pricePerHour: number
}

interface CourtGridProps {
  courts: CourtData[]
  slots: Slot[]
  selectedSlotId?: string
  onSlotSelect?: (slot: Slot) => void
  date: string // ISO date string
}

export function CourtGrid({ courts, slots, selectedSlotId, onSlotSelect, date }: CourtGridProps) {
  // Group slots by court
  const hours = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8 // 08:00 - 22:00
    return `${hour.toString().padStart(2, "0")}:00`
  })

  const getSlot = (courtId: string, time: string) => {
    return slots.find(
      (s) => s.courtId === courtId && s.startTime === time
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[600px]">
        {/* Header row - court names */}
        <div className="flex border-b-2 border-border mb-1">
          <div className="w-16 shrink-0" />
          {courts.map((court) => (
            <div
              key={court.id}
              className="flex-1 text-center pb-3"
            >
              <div className="text-caption text-ink-muted font-medium">
                Lapangan {court.courtNumber}
              </div>
              <div className="text-caption text-ink-muted font-mono">
                Rp{court.pricePerHour.toLocaleString("id-ID")}/jam
              </div>
            </div>
          ))}
        </div>

        {/* Time rows with double-line separator like service lines */}
        {hours.map((time, idx) => (
          <div key={time} className="flex">
            {/* Time label */}
            <div className="w-16 shrink-0 pt-2.5">
              <span className="font-mono text-slot-time text-ink-muted tabular-nums">
                {time}
              </span>
            </div>

            {/* Court cells for this time */}
            {courts.map((court) => {
              const slot = getSlot(court.id, time)
              const isSelected = slot?.id === selectedSlotId
              const isAvailable = slot?.status === "AVAILABLE"
              const isBooked = slot?.status === "BOOKED"
              const isLocked = slot?.status === "LOCKED"

              return (
                <button
                  key={`${court.id}-${time}`}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && slot && onSlotSelect?.(slot)}
                  className={cn(
                    "flex-1 h-11 mx-0.5 mb-1 rounded-[12px] relative transition-all duration-100",
                    // Available styles
                    isAvailable && "bg-surface border-2 border-border hover:border-cta/50 hover:bg-cta/10 cursor-pointer",
                    // Selected styles
                    isSelected && "bg-cta border-2 border-cta shadow-sm",
                    // Booked styles
                    isBooked && "bg-border/50 border-2 border-border cursor-not-allowed",
                    // Locked styles
                    isLocked && "bg-urgent/10 border-2 border-urgent/30 cursor-not-allowed",
                    // Double-line separator between hour blocks (service line style)
                    idx > 0 && "border-t-2 border-t-border/40"
                  )}
                  style={{ minHeight: "44px" }}
                  aria-label={
                    isAvailable
                      ? `Slot ${time} - Lapangan ${court.courtNumber} - Tersedia Rp${slot?.price.toLocaleString("id-ID")}`
                      : isBooked
                      ? `Slot ${time} - Lapangan ${court.courtNumber} - Terisi`
                      : `Slot ${time} - Lapangan ${court.courtNumber} - Sedang diproses`
                  }
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {isAvailable && (
                      <span className="font-mono text-[11px] font-semibold text-ink tabular-nums">
                        Rp{slot?.price.toLocaleString("id-ID")}
                      </span>
                    )}
                    {isBooked && (
                      <span className="text-[11px] text-ink-muted font-medium">Terisi</span>
                    )}
                    {isLocked && (
                      <span className="text-[11px] text-urgent font-medium">Diproses</span>
                    )}
                    {!slot && (
                      <span className="text-[11px] text-ink-muted/50">—</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
