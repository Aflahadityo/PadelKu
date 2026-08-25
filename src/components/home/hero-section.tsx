"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  totalVenues?: number
  selectedCity?: string
}

const popularCities = [
  { name: "Semua Kota", value: "" },
  { name: "Jakarta Selatan", value: "Jakarta Selatan" },
  { name: "Senayan & SCBD", value: "Jakarta Pusat" },
  { name: "BSD City", value: "Tangerang" },
  { name: "Bali", value: "Bali" },
  { name: "Bandung", value: "Bandung" },
]

export function HeroSection({ totalVenues = 18, selectedCity = "" }: HeroSectionProps) {
  // Interactive mini court grid demo inside Hero
  const [selectedDemoSlot, setSelectedDemoSlot] = useState<string>("19:00-c1")

  const demoSlots = [
    { time: "08:00", c1: { status: "available", price: 200 }, c2: { status: "booked", price: 200 } },
    { time: "16:00", c1: { status: "booked", price: 250 }, c2: { status: "available", price: 250 } },
    { time: "19:00", c1: { status: "available", price: 300, isPrime: true }, c2: { status: "available", price: 300, isPrime: true } },
    { time: "20:00", c1: { status: "available", price: 300, isPrime: true }, c2: { status: "booked", price: 300, isPrime: true } },
  ]

  return (
    <section className="relative overflow-hidden pt-4 pb-12 lg:pt-8 lg:pb-16">
      {/* Background Decorative Court Turf Grid lines */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-35"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(14, 158, 150, 0.12), transparent 70%),
            linear-gradient(to right, rgba(20, 30, 24, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(20, 30, 24, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 3rem 3rem, 3rem 3rem",
        }}
        aria-hidden="true"
      />

      <div className="safe-area-x mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline, Value Proposition & City Filter Chips */}
          <div className="space-y-6 text-left lg:col-span-7">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-surface/90 px-3.5 py-1.5 shadow-2xs backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                100% Real-Time Court Sync
              </span>
              <span className="text-border-strong">·</span>
              <span className="text-xs font-semibold text-ink-muted">Jadwal Langsung dari Venue</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-extrabold leading-[1.03] tracking-[-0.04em] text-ink">
                Booking Lapangan Padel{" "}
                <span className="relative inline-block text-brand">
                  Terbaik
                  <span className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full bg-booking/80" />
                </span>{" "}
                di Indonesia.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
                Pilih jadwal dalam format diagram lapangan padel (*Court Grid*), kunci slot favorit dalam hitungan detik, dan split bill otomatis dengan teman sparring.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#venue-list"
                className="btn-cta inline-flex h-12 items-center gap-2.5 px-6 font-display text-sm font-bold text-ink shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calendar className="size-4" />
                <span>Cari Lapangan Sekarang</span>
                <ChevronRight className="size-4 stroke-[3]" />
              </a>

              <Link
                href="/#community-matches"
                className="btn-secondary inline-flex h-12 items-center gap-2 px-5 text-sm font-bold shadow-2xs hover:border-brand/40"
              >
                <Flame className="size-4 text-urgent" />
                <span>Cari Lawan Sparring</span>
              </Link>
            </div>

            {/* Quick City Filter Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                Kota Populer:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularCities.map((c) => {
                  const isActive = (c.value === "" && !selectedCity) || selectedCity === c.value
                  const href = c.value ? `/?city=${encodeURIComponent(c.value)}#venue-list` : "/#venue-list"
                  return (
                    <Link
                      key={c.name}
                      href={href}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150",
                        isActive
                          ? "bg-ink text-white shadow-xs"
                          : "border border-border/80 bg-surface/80 text-ink-muted hover:border-brand/40 hover:bg-surface hover:text-ink",
                      )}
                    >
                      <MapPin className={cn("size-3", isActive ? "text-booking" : "text-brand")} />
                      <span>{c.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 border-t border-border/80 pt-5 sm:gap-6">
              <div>
                <p className="font-mono text-2xl font-black text-ink sm:text-3xl">
                  {totalVenues}+
                </p>
                <p className="mt-0.5 text-xs font-medium text-ink-muted">
                  Arena Terverifikasi
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-black text-ink sm:text-3xl">
                  60s
                </p>
                <p className="mt-0.5 text-xs font-medium text-ink-muted">
                  Rata-rata Booking
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-black text-brand sm:text-3xl">
                  4.9★
                </p>
                <p className="mt-0.5 text-xs font-medium text-ink-muted">
                  Kepuasan Pemain
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Signature "Court Grid" Interactive Teaser */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-3xl border-2 border-border/90 bg-surface p-5 shadow-card backdrop-blur-sm sm:p-6">
              {/* Decorative Header */}
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-2xs">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink">
                      Diagram Court Grid
                    </h3>
                    <p className="text-[0.6875rem] font-medium text-ink-muted">
                      Kemang Padel Club · Lapangan 1 & 2
                    </p>
                  </div>
                </div>
                <span className="badge-turf text-[0.625rem] font-bold">
                  🟢 Live View
                </span>
              </div>

              {/* Court Header */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-ink">
                <div className="font-mono text-[0.6875rem] text-ink-muted">Jam</div>
                <div className="rounded-lg bg-surface-muted/90 py-1.5">Lapangan 1</div>
                <div className="rounded-lg bg-surface-muted/90 py-1.5">Lapangan 2</div>
              </div>

              {/* Slot Rows */}
              <div className="mt-2.5 space-y-2">
                {demoSlots.map((slot) => {
                  const key1 = `${slot.time}-c1`
                  const key2 = `${slot.time}-c2`
                  const isSel1 = selectedDemoSlot === key1
                  const isSel2 = selectedDemoSlot === key2

                  return (
                    <div key={slot.time} className="grid grid-cols-3 items-center gap-2">
                      <span className="text-center font-mono text-xs font-bold tabular-nums text-ink">
                        {slot.time}
                      </span>

                      {/* Lapangan 1 Cell */}
                      <button
                        type="button"
                        disabled={slot.c1.status !== "available"}
                        onClick={() => slot.c1.status === "available" && setSelectedDemoSlot(key1)}
                        className={cn(
                          "relative flex h-10 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all",
                          isSel1
                            ? "border-2 border-ink bg-booking text-ink font-extrabold shadow-sm scale-102"
                            : slot.c1.status === "available"
                            ? "border border-border/90 bg-surface hover:border-brand hover:bg-brand/5 active:scale-95"
                            : "border border-border/40 bg-surface-muted/60 text-ink-muted/50 cursor-not-allowed",
                        )}
                      >
                        {isSel1 ? (
                          <span className="flex items-center gap-1">
                            <Check className="size-3 stroke-[3]" />
                            <span>PILIH</span>
                          </span>
                        ) : slot.c1.status === "available" ? (
                          <span>Rp{slot.c1.price}k</span>
                        ) : (
                          <span className="text-[0.625rem]">Terisi</span>
                        )}
                        {slot.c1.isPrime && !isSel1 && (
                          <span className="absolute -top-1 -right-1 size-2 rounded-full bg-urgent" />
                        )}
                      </button>

                      {/* Lapangan 2 Cell */}
                      <button
                        type="button"
                        disabled={slot.c2.status !== "available"}
                        onClick={() => slot.c2.status === "available" && setSelectedDemoSlot(key2)}
                        className={cn(
                          "relative flex h-10 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all",
                          isSel2
                            ? "border-2 border-ink bg-booking text-ink font-extrabold shadow-sm scale-102"
                            : slot.c2.status === "available"
                            ? "border border-border/90 bg-surface hover:border-brand hover:bg-brand/5 active:scale-95"
                            : "border border-border/40 bg-surface-muted/60 text-ink-muted/50 cursor-not-allowed",
                        )}
                      >
                        {isSel2 ? (
                          <span className="flex items-center gap-1">
                            <Check className="size-3 stroke-[3]" />
                            <span>PILIH</span>
                          </span>
                        ) : slot.c2.status === "available" ? (
                          <span>Rp{slot.c2.price}k</span>
                        ) : (
                          <span className="text-[0.625rem]">Terisi</span>
                        )}
                        {slot.c2.isPrime && !isSel2 && (
                          <span className="absolute -top-1 -right-1 size-2 rounded-full bg-urgent" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Dynamic Interactive Selection Banner */}
              <div className="mt-4 rounded-2xl border border-brand/30 bg-brand/5 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-brand" />
                    <div>
                      <p className="font-semibold text-ink">
                        Slot: {selectedDemoSlot.includes("c1") ? "Lapangan 1" : "Lapangan 2"} ({selectedDemoSlot.split("-")[0]})
                      </p>
                      <p className="text-[0.6875rem] text-ink-muted">Siap dikunci 10 menit untuk pembayaran</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-ink">
                    Rp300.000
                  </span>
                </div>
              </div>

              {/* Guarantee footer */}
              <div className="mt-3 flex items-center justify-between text-[0.6875rem] text-ink-muted">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-brand" />
                  Garansi Anti Double-Booking
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-ink-muted" />
                  Instant QRIS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
