"use client"

import { useState } from "react"
import {
  Calendar,
  Check,
  Clock,
  MapPin,
  Plus,
  Swords,
  X,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface MatchItem {
  id: string
  title: string
  venueName: string
  city: string
  date: string
  time: string
  levelRange: string
  levelTag: string
  format: string
  filledSlots: number
  totalSlots: number
  pricePerPlayer: number
  hostName: string
  hostRating: string
  players: string[]
}

const initialMatches: MatchItem[] = [
  {
    id: "match-1",
    title: "Sparring Santai Sore (Casual Game)",
    venueName: "Padel House Kemang",
    city: "Jakarta Selatan",
    date: "Hari Ini, 26 Agu",
    time: "17:00 – 19:00 WIB",
    levelRange: "NTRP 2.0 – 3.0",
    levelTag: "Pemula / Intermediate",
    format: "Ganda (2 vs 2)",
    filledSlots: 3,
    totalSlots: 4,
    pricePerPlayer: 87500,
    hostName: "Dimas Pratama",
    hostRating: "NTRP 2.5",
    players: ["Dimas P.", "Reza K.", "Farhan M."],
  },
  {
    id: "match-2",
    title: "Competitive Mixed Doubles Round",
    venueName: "Arena Padel BSD",
    city: "Tangerang",
    date: "Hari Ini, 26 Agu",
    time: "19:00 – 21:00 WIB",
    levelRange: "NTRP 3.5 – 4.5",
    levelTag: "Kompetitif / Advance",
    format: "Ganda (2 vs 2)",
    filledSlots: 2,
    totalSlots: 4,
    pricePerPlayer: 105000,
    hostName: "Sarah Wijaya",
    hostRating: "NTRP 4.0",
    players: ["Sarah W.", "Kevin A."],
  },
  {
    id: "match-3",
    title: "Morning Sunset Sparring & Coffee",
    venueName: "Canggu Padel Club",
    city: "Bali",
    date: "Besok, 27 Agu",
    time: "07:00 – 09:00 WITA",
    levelRange: "NTRP 2.5 – 3.5",
    levelTag: "Intermediate",
    format: "Ganda (2 vs 2)",
    filledSlots: 1,
    totalSlots: 4,
    pricePerPlayer: 95000,
    hostName: "Liam Evans",
    hostRating: "NTRP 3.0",
    players: ["Liam E."],
  },
  {
    id: "match-4",
    title: "Weekly Bandung Smash Challenge",
    venueName: "Padel Studio Bandung",
    city: "Bandung",
    date: "Kamis, 28 Agu",
    time: "18:00 – 20:00 WIB",
    levelRange: "NTRP 3.0 – 4.0",
    levelTag: "Intermediate",
    format: "Ganda (2 vs 2)",
    filledSlots: 3,
    totalSlots: 4,
    pricePerPlayer: 85000,
    hostName: "Budi Santoso",
    hostRating: "NTRP 3.5",
    players: ["Budi S.", "Aldi R.", "Gita M."],
  },
  {
    id: "match-5",
    title: "Late Night King of the Court",
    venueName: "Senayan Central Padel",
    city: "Jakarta Pusat",
    date: "Jumat, 29 Agu",
    time: "20:00 – 22:00 WIB",
    levelRange: "NTRP 4.0 – 5.0",
    levelTag: "Turnamen / Semi-Pro",
    format: "Ganda (2 vs 2)",
    filledSlots: 2,
    totalSlots: 4,
    pricePerPlayer: 125000,
    hostName: "Adrian Tandiono",
    hostRating: "NTRP 4.5",
    players: ["Adrian T.", "Dennis L."],
  },
]

export function MatchesHub() {
  const [matches, setMatches] = useState<MatchItem[]>(initialMatches)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [joinModalMatch, setJoinModalMatch] = useState<MatchItem | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)
  const [joinedSuccess, setJoinedSuccess] = useState<string | null>(null)

  // New match form state
  const [newTitle, setNewTitle] = useState("")
  const [newVenue, setNewVenue] = useState("Padel House Kemang")
  const [newLevel, setNewLevel] = useState("NTRP 2.5 – 3.5")
  const [newDate, setNewDate] = useState("Hari Ini")
  const [newTime, setNewTime] = useState("19:00 – 21:00 WIB")
  const [newPrice, setNewPrice] = useState("85000")

  const filteredMatches = matches.filter((m) => {
    if (selectedCity !== "all" && !m.city.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false
    }
    if (selectedLevel === "beginner" && !m.levelRange.includes("2.0") && !m.levelRange.includes("2.5")) {
      return false
    }
    if (selectedLevel === "intermediate" && !m.levelRange.includes("3.0") && !m.levelRange.includes("3.5")) {
      return false
    }
    if (selectedLevel === "advanced" && !m.levelRange.includes("4.0") && !m.levelRange.includes("4.5") && !m.levelRange.includes("5.0")) {
      return false
    }
    return true
  })

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle) return

    const created: MatchItem = {
      id: `match-${Date.now()}`,
      title: newTitle,
      venueName: newVenue,
      city: newVenue.includes("BSD") ? "Tangerang" : newVenue.includes("Bali") ? "Bali" : "Jakarta",
      date: newDate,
      time: newTime,
      levelRange: newLevel,
      levelTag: newLevel.includes("4.") ? "Kompetitif" : "Intermediate",
      format: "Ganda (2 vs 2)",
      filledSlots: 1,
      totalSlots: 4,
      pricePerPlayer: Number(newPrice) || 85000,
      hostName: "Saya (Host)",
      hostRating: "NTRP 3.0",
      players: ["Saya (Host)"],
    }

    setMatches([created, ...matches])
    setCreateModalOpen(false)
    setNewTitle("")
    setJoinedSuccess(`✓ Match "${created.title}" berhasil dibuat! Slot Anda telah dikonfirmasi sebagai Host.`)
  }

  const handleJoinMatch = () => {
    if (!joinModalMatch) return

    const updated = matches.map((m) => {
      if (m.id === joinModalMatch.id) {
        return {
          ...m,
          filledSlots: Math.min(m.totalSlots, m.filledSlots + 1),
          players: [...m.players, "Anda (Baru)"],
        }
      }
      return m
    })

    setMatches(updated)
    setJoinedSuccess(`✓ Berhasil bergabung ke match "${joinModalMatch.title}"! E-Tiket Match Pass siap di menu Tiket & Booking.`)
    setJoinModalMatch(null)
  }

  return (
    <div className="space-y-8">
      {/* Hero Sparring Banner */}
      <div className="rounded-3xl border border-border/90 bg-gradient-to-br from-[#121F17] via-[#16291E] to-[#101D15] p-6 sm:p-10 text-white shadow-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 -bottom-16 size-56 rounded-full bg-booking/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/20 border border-brand/30 px-3 py-1 text-xs font-extrabold text-brand">
              <Swords className="size-3.5" />
              <span>Komunitas Open Match Indonesia</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Cari Lawan Sparring & Teman Main Padel
            </h1>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Kurang orang untuk main ganda? Bergabunglah dengan sesi open match yang dibuat oleh komunitas, sesuaikan level NTRP, dan nikmati split bill otomatis via QRIS/VA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="btn-cta inline-flex items-center gap-2 px-6 py-3.5 text-xs font-black text-ink shadow-lg shrink-0 hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="size-4 stroke-[3]" />
            <span>Buat Open Match Baru</span>
          </button>
        </div>
      </div>

      {joinedSuccess && (
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-xs font-bold text-success flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <Check className="size-4 shrink-0 stroke-[3]" />
            <span>{joinedSuccess}</span>
          </div>
          <button type="button" onClick={() => setJoinedSuccess(null)} className="text-ink-muted hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-border shadow-2xs">
        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-ink-muted mr-1">Wilayah:</span>
          {[
            { id: "all", label: "Semua Kota" },
            { id: "jakarta", label: "Jakarta" },
            { id: "tangerang", label: "BSD / Tangerang" },
            { id: "bali", label: "Bali" },
            { id: "bandung", label: "Bandung" },
          ].map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => setSelectedCity(city.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                selectedCity === city.id
                  ? "bg-ink text-white shadow-xs"
                  : "bg-surface-muted/60 text-ink-muted hover:text-ink"
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>

        {/* NTRP Level Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-ink-muted mr-1">Tingkat Skill:</span>
          {[
            { id: "all", label: "Semua Level" },
            { id: "beginner", label: "Pemula (2.0 - 2.5)" },
            { id: "intermediate", label: "Intermediate (3.0 - 3.5)" },
            { id: "advanced", label: "Kompetitif (4.0+)" },
          ].map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setSelectedLevel(lvl.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                selectedLevel === lvl.id
                  ? "bg-brand text-white shadow-xs"
                  : "bg-surface-muted/60 text-ink-muted hover:text-ink"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMatches.map((match) => {
          const isFull = match.filledSlots >= match.totalSlots

          return (
            <article
              key={match.id}
              className="group flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-xs hover:border-brand/40 hover:shadow-card transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Header Meta */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-brand/10 px-2 py-0.5 font-mono text-xs font-bold text-brand border border-brand/20">
                    {match.levelRange}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isFull
                        ? "bg-surface-muted text-ink-muted"
                        : "bg-booking/20 text-booking-text font-black"
                    }`}
                  >
                    {isFull ? "Slot Penuh" : `Tersisa ${match.totalSlots - match.filledSlots} Slot`}
                  </span>
                </div>

                {/* Match Title & Venue */}
                <div>
                  <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand transition-colors">
                    {match.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                    <MapPin className="size-3.5 text-brand shrink-0" />
                    <span className="font-medium text-ink truncate">{match.venueName}</span>
                    <span>·</span>
                    <span>{match.city}</span>
                  </div>
                </div>

                {/* Date & Time Info Card */}
                <div className="rounded-2xl border border-border bg-surface-muted/50 p-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-ink">
                      <Calendar className="size-3.5 text-brand" />
                      <span>{match.date}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono font-bold text-ink">
                      <Clock className="size-3.5 text-brand" />
                      <span>{match.time}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-ink-muted pt-1 border-t border-border/60">
                    <span>Format: {match.format}</span>
                    <span>Host: {match.hostName}</span>
                  </div>
                </div>

                {/* Player Slots Visualizer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink-muted">Pemain Terdaftar ({match.filledSlots}/{match.totalSlots}):</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: match.totalSlots }).map((_, i) => {
                      const isFilled = i < match.filledSlots
                      const playerName = match.players[i]

                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-xl p-2 text-center text-[0.6875rem] font-bold border transition-colors ${
                            isFilled
                              ? "border-brand/30 bg-brand/10 text-brand"
                              : "border-dashed border-border bg-surface-muted/40 text-ink-muted"
                          }`}
                        >
                          {isFilled ? (
                            <span className="truncate block">{playerName ?? "Pemain"}</span>
                          ) : (
                            <span>+ Kosong</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer with Price & Join CTA */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
                <div>
                  <span className="text-[0.6875rem] text-ink-muted block">Split Bill per Pemain:</span>
                  <span className="font-mono text-base font-black text-ink">
                    {formatCurrency(match.pricePerPlayer)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => setJoinModalMatch(match)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                    isFull
                      ? "bg-surface-muted text-ink-muted cursor-not-allowed"
                      : "btn-cta text-ink hover:scale-105"
                  }`}
                >
                  {isFull ? "Sudah Penuh" : "Gabung Match"}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Join Match Modal Dialog */}
      {joinModalMatch && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setJoinModalMatch(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-float space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Swords className="size-4 text-brand" />
                <h3 className="font-display text-base font-bold text-ink">
                  Gabung Sesi Open Match
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setJoinModalMatch(null)}
                className="grid size-8 place-items-center rounded-full border border-border hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 space-y-1">
                <h4 className="font-display text-base font-bold text-ink">{joinModalMatch.title}</h4>
                <p className="text-ink-muted">{joinModalMatch.venueName} · {joinModalMatch.city}</p>
                <p className="font-mono font-semibold text-brand">{joinModalMatch.date}, {joinModalMatch.time}</p>
              </div>

              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Tingkat Skill Required</span>
                <span className="font-bold text-ink">{joinModalMatch.levelRange}</span>
              </div>

              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Host Pertandingan</span>
                <span className="font-semibold text-ink">{joinModalMatch.hostName} ({joinModalMatch.hostRating})</span>
              </div>

              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Format & Durasi</span>
                <span className="font-semibold text-ink">{joinModalMatch.format} · 2 Jam</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-ink">Total Split Bill Anda</span>
                <span className="font-mono text-lg font-black text-brand">
                  {formatCurrency(joinModalMatch.pricePerPlayer)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleJoinMatch}
                className="btn-cta w-full text-xs font-bold py-3 rounded-xl shadow-xs"
              >
                Konfirmasi & Bayar via QRIS / VA
              </button>
              <p className="text-[0.625rem] text-center text-ink-muted">
                Slot Anda otomatis diamankan dan e-tiket langsung dikirim via notifikasi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Match Modal Dialog */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-float space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Plus className="size-4 text-brand" />
                <h3 className="font-display text-base font-bold text-ink">
                  Buat Open Match Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="grid size-8 place-items-center rounded-full border border-border hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Judul Match</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Sparring Ganda Santai Sore"
                  className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">Pilih Venue</label>
                  <select
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
                  >
                    <option value="Padel House Kemang">Padel House Kemang (Jakarta)</option>
                    <option value="Arena Padel BSD">Arena Padel BSD (Tangerang)</option>
                    <option value="Canggu Padel Club">Canggu Padel Club (Bali)</option>
                    <option value="Padel Studio Bandung">Padel Studio Bandung (Bandung)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Target Skill (NTRP)</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
                  >
                    <option value="NTRP 1.5 – 2.5">Pemula (NTRP 1.5 - 2.5)</option>
                    <option value="NTRP 2.5 – 3.5">Intermediate (NTRP 2.5 - 3.5)</option>
                    <option value="NTRP 3.5 – 4.5">Kompetitif (NTRP 3.5 - 4.5)</option>
                    <option value="NTRP 4.5 – 5.5">Turnamen (NTRP 4.5+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">Jadwal Tanggal</label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="Contoh: Hari Ini / Besok"
                    className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Jam Main</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Contoh: 18:00 – 20:00 WIB"
                    className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Biaya per Pemain (Split Bill IDR)</label>
                <input
                  type="number"
                  required
                  min={20000}
                  step={5000}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="85000"
                  className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 font-mono text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="btn-cta w-full text-xs font-bold py-3 rounded-xl shadow-xs mt-2"
              >
                Terbitkan Open Match
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
