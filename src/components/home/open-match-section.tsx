"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  Flame,
  MapPin,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OpenMatch {
  id: string
  venueName: string
  city: string
  date: string
  time: string
  level: string
  levelCategory: "all" | "beginner" | "intermediate" | "advanced"
  playersNeeded: number
  totalPlayers: number
  pricePerPlayer: string
  hostName: string
  courtType: string
  isUrgent?: boolean
}

const mockMatches: OpenMatch[] = [
  {
    id: "match-1",
    venueName: "Kemang Padel Club",
    city: "Jakarta Selatan",
    date: "Hari ini, 25 Agt",
    time: "19:00 - 21:00 (2 Jam)",
    level: "NTRP 2.5 – 3.0",
    levelCategory: "intermediate",
    playersNeeded: 1,
    totalPlayers: 4,
    pricePerPlayer: "Rp125.000",
    hostName: "Rian (Host)",
    courtType: "Indoor WPT Panoramic",
    isUrgent: true,
  },
  {
    id: "match-2",
    venueName: "Senayan Padel Arena",
    city: "Jakarta Pusat",
    date: "Besok, 26 Agt",
    time: "07:00 - 09:00 (2 Jam)",
    level: "NTRP 1.5 – 2.5",
    levelCategory: "beginner",
    playersNeeded: 2,
    totalPlayers: 4,
    pricePerPlayer: "Rp110.000",
    hostName: "Dito & Kevin",
    courtType: "Outdoor Semi-Covered",
  },
  {
    id: "match-3",
    venueName: "Canggu Padel Sanctuary",
    city: "Bali",
    date: "Besok, 26 Agt",
    time: "17:00 - 19:00 (2 Jam)",
    level: "NTRP 3.5 – 4.5+",
    levelCategory: "advanced",
    playersNeeded: 1,
    totalPlayers: 4,
    pricePerPlayer: "Rp150.000",
    hostName: "Marcus (Pro)",
    courtType: "Panoramic Glass Luxury",
    isUrgent: true,
  },
  {
    id: "match-4",
    venueName: "BSD Court Central",
    city: "Tangerang",
    date: "Sabtu, 29 Agt",
    time: "16:00 - 18:00 (2 Jam)",
    level: "NTRP 2.0 – 3.0",
    levelCategory: "intermediate",
    playersNeeded: 2,
    totalPlayers: 4,
    pricePerPlayer: "Rp95.000",
    hostName: "Sarah & Dimas",
    courtType: "Indoor Air Conditioned",
  },
]

export function OpenMatchSection() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [joinedMatches, setJoinedMatches] = useState<string[]>([])

  const filteredMatches = mockMatches.filter(
    (m) => selectedFilter === "all" || m.levelCategory === selectedFilter,
  )

  const handleJoin = (match: OpenMatch) => {
    if (joinedMatches.includes(match.id)) return
    setJoinedMatches([...joinedMatches, match.id])
    alert(`🎉 Anda berhasil mendaftar ke match di ${match.venueName} bersama ${match.hostName}! Kode sparring telah dikirim ke WhatsApp Anda.`)
  }

  return (
    <section id="community-matches" className="scroll-mt-20 py-12 lg:py-16">
      <div className="safe-area-x mx-auto max-w-7xl space-y-8">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-urgent/30 bg-urgent/10 px-3 py-1 text-xs font-bold text-urgent">
              <Flame className="size-3.5" />
              <span>Komunitas Padel Indonesia</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
              Open Match & Sparring
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-ink-muted">
              Kurang 1–2 orang untuk main ganda? Gabung open match sesuai level permainanmu dengan sistem split-bill otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/matches"
              className="btn-cta text-xs font-bold shadow-xs px-4 py-2.5 inline-flex items-center gap-1.5"
            >
              <Sparkles className="size-4 text-ink" />
              <span>Buka Hub Open Match</span>
            </Link>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
            Filter Level:
          </span>
          {[
            { label: "Semua Level", value: "all" },
            { label: "Pemula (NTRP 1.5 - 2.5)", value: "beginner" },
            { label: "Menengah (NTRP 2.5 - 3.5)", value: "intermediate" },
            { label: "Kompetitif (NTRP 3.5+)", value: "advanced" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedFilter(tab.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
                selectedFilter === tab.value
                  ? "bg-ink text-white shadow-xs"
                  : "border border-border/80 bg-surface text-ink-muted hover:border-brand/40 hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Match Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredMatches.map((match) => {
            const isJoined = joinedMatches.includes(match.id)
            const filledSlots = match.totalPlayers - match.playersNeeded

            return (
              <article
                key={match.id}
                className="flex flex-col justify-between rounded-2xl border border-border/90 bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card"
              >
                <div className="space-y-3">
                  {/* Top Bar: Level & Urgency */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-mono text-[0.6875rem] font-bold text-brand">
                      {match.level}
                    </span>

                    {match.isUrgent && (
                      <span className="badge-coral text-[0.625rem] font-bold">
                        🔥 Sisa 1 Slot
                      </span>
                    )}
                  </div>

                  {/* Venue Name & Location */}
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">
                      {match.venueName}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="size-3 text-brand" />
                      <span>{match.city}</span>
                    </p>
                  </div>

                  {/* Court Specs & Date/Time */}
                  <div className="rounded-xl border border-border/60 bg-surface-muted/60 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-ink">
                      <Calendar className="size-3.5 text-brand" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-ink">
                      <Clock className="size-3.5 text-brand" />
                      <span>{match.time}</span>
                    </div>
                  </div>

                  {/* Player Slot Fill Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-semibold text-ink-muted text-[0.6875rem]">
                        <Users className="size-3" />
                        Pemain:
                      </span>
                      <span className="font-mono text-xs font-bold text-ink">
                        {filledSlots}/{match.totalPlayers} Slot ({match.playersNeeded} dibutuhkan)
                      </span>
                    </div>

                    {/* Progress visual circles */}
                    <div className="flex gap-1.5">
                      {Array.from({ length: match.totalPlayers }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-2 flex-1 rounded-full",
                            i < filledSlots
                              ? "bg-brand"
                              : "border border-dashed border-border-strong bg-surface-muted",
                          )}
                        />
                      ))}
                    </div>

                    <p className="text-[0.625rem] text-ink-muted">
                      Di-host oleh: <span className="font-semibold text-ink">{match.hostName}</span>
                    </p>
                  </div>
                </div>

                {/* Price & Join Action */}
                <div className="mt-5 border-t border-border/80 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[0.625rem] font-bold uppercase tracking-wider text-ink-muted">
                      Split Bill
                    </span>
                    <p className="font-mono text-sm font-extrabold text-ink">
                      {match.pricePerPlayer}
                      <span className="font-body text-[0.625rem] font-normal text-ink-muted"> /org</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoin(match)}
                    disabled={isJoined}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs",
                      isJoined
                        ? "bg-success text-white cursor-default"
                        : "btn-cta",
                    )}
                  >
                    {isJoined ? "✓ Terdaftar" : "Gabung"}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {/* Community Trust Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-surface p-5 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-ink">
                Sistem Matchmaking Terjamin
              </p>
              <p className="text-ink-muted">
                Semua pemain diwajibkan konfirmasi kehadiran. Pembayaran split-bill otomatis dikembalikan jika match tidak terpenuhi.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-brand shrink-0">
            <Sparkles className="size-3.5" />
            <span>Rating Fairplay 99.2%</span>
          </div>
        </div>
      </div>
    </section>
  )
}
