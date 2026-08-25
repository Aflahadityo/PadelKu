"use client"

import { cn } from "@/lib/utils"
import { Check, Sparkles } from "lucide-react"

export interface CourtGridSlot {
  id: string
  startTime: string
  endTime: string
  status: "AVAILABLE" | "BOOKED" | "LOCKED" | "BLOCKED"
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
  slots: CourtGridSlot[]
  selectedSlotId?: string
  onSlotSelect?: (slot: CourtGridSlot) => void
}

export function CourtGrid({ courts, slots, selectedSlotId, onSlotSelect }: CourtGridProps) {
  const hours = [...new Set(slots.map((slot) => slot.startTime))].sort()

  const getSlot = (courtId: string, time: string) => {
    return slots.find((s) => s.courtId === courtId && s.startTime === time)
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-brand bg-white" />
            <span className="font-semibold text-ink">Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-ink bg-booking shadow-xs" />
            <span className="font-bold text-ink">Terpilih</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-border-strong/40" />
            <span className="text-ink-muted">Terisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-urgent/20 border border-urgent/40" />
            <span className="text-urgent font-medium">Diproses</span>
          </div>
        </div>
        <span className="font-mono text-[0.6875rem] text-ink-muted">Durasi: 60 Menit/Sesi</span>
      </div>

      {/* Grid container */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-3 shadow-xs sm:p-4">
        <div className="min-w-[560px]">
          {/* Court Columns Header */}
          <div className="flex items-center border-b border-border/80 pb-3 mb-2">
            <div className="w-16 shrink-0 text-center font-mono text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
              Jam
            </div>
            {courts.map((court) => (
              <div key={court.id} className="flex-1 px-1 text-center">
                <div className="inline-flex items-center gap-1 rounded-lg bg-surface-muted/90 px-2.5 py-1 text-xs font-bold text-ink">
                  <Sparkles className="size-3 text-brand" />
                  <span>Lapangan {court.courtNumber}</span>
                </div>
                <div className="mt-0.5 font-mono text-[0.6875rem] text-ink-muted">
                  Rp{court.pricePerHour.toLocaleString("id-ID")}/jam
                </div>
              </div>
            ))}
          </div>

          {/* Time Slot Rows */}
          <div className="space-y-1.5">
            {hours.map((time) => (
              <div key={time} className="flex items-center gap-1">
                {/* Time Column */}
                <div className="w-16 shrink-0 pr-2 text-right">
                  <span className="font-mono text-xs font-bold tabular-nums text-ink">
                    {time}
                  </span>
                </div>

                {/* Court Slot Cells */}
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
                        "group relative flex-1 h-11 rounded-xl transition-all duration-150 flex items-center justify-center font-mono text-xs font-bold",
                        // Available state
                        isAvailable &&
                          "border border-border/90 bg-surface text-ink hover:border-brand hover:bg-brand/5 hover:scale-[1.01] active:scale-[0.98] cursor-pointer shadow-2xs",
                        // Selected state (Ball Optic Yellow)
                        isSelected &&
                          "border-2 border-ink bg-booking text-ink font-extrabold shadow-md shadow-booking/30 scale-[1.02] z-10",
                        // Booked state
                        isBooked && "border border-border/40 bg-surface-muted/60 text-ink-muted/50 cursor-not-allowed",
                        // Locked state
                        isLocked && "border border-urgent/30 bg-urgent/10 text-urgent cursor-not-allowed",
                      )}
                      aria-label={`Slot ${time} Lapangan ${court.courtNumber} ${isAvailable ? "Tersedia" : isBooked ? "Terisi" : "Sedang diproses"}`}
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1">
                          <Check className="size-3.5 stroke-[3]" />
                          <span>PILIH</span>
                        </span>
                      ) : isAvailable ? (
                        <span className="text-[0.6875rem] text-ink-muted group-hover:text-brand font-semibold tabular-nums">
                          Rp{(slot?.price ?? court.pricePerHour) / 1000}k
                        </span>
                      ) : isBooked ? (
                        <span className="text-[0.625rem] font-medium tracking-tight text-ink-muted/60">Terisi</span>
                      ) : isLocked ? (
                        <span className="text-[0.625rem] font-semibold text-urgent">Lock</span>
                      ) : (
                        <span className="text-ink-muted/40">—</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
