"use client"

import { useState } from "react"
import {
  Award,
  Check,
  GraduationCap,
  MapPin,
  Star,
  X,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CoachItem {
  id: string
  name: string
  title: string
  license: string
  city: string
  venueNames: string[]
  pricePerHour: number
  rating: number
  reviewCount: number
  specialties: string[]
  experienceYears: number
  availableToday: boolean
}

const coachesData: CoachItem[] = [
  {
    id: "coach-1",
    name: "Coach Carlos Morales",
    title: "Head Coach & WPT Certified Instructor",
    license: "WPT / FIP Level 2 Certified (Spain)",
    city: "Jakarta",
    venueNames: ["Padel House Kemang", "Senayan Central Padel"],
    pricePerHour: 450000,
    rating: 4.95,
    reviewCount: 48,
    specialties: ["Vibora & Bandeja Technique", "Tactical Positioning", "Advanced Doubles Strategy"],
    experienceYears: 8,
    availableToday: true,
  },
  {
    id: "coach-2",
    name: "Coach Rian Hidayat",
    title: "Senior National Padel Coach",
    license: "PBPI Certified Coach Level 2",
    city: "Tangerang & BSD",
    venueNames: ["Arena Padel BSD"],
    pricePerHour: 350000,
    rating: 4.88,
    reviewCount: 36,
    specialties: ["Pemula ke Intermediate", "Footwork & Wall Rebound", "Serve & Volley"],
    experienceYears: 5,
    availableToday: true,
  },
  {
    id: "coach-3",
    name: "Coach Elena Rodriguez",
    title: "Pro Tour Player & Youth Coach",
    license: "European Padel Federation Level 1",
    city: "Bali",
    venueNames: ["Canggu Padel Club"],
    pricePerHour: 500000,
    rating: 5.0,
    reviewCount: 62,
    specialties: ["Power Smash (Por Tres)", "Defensive Wall Play", "High-Intensity Drills"],
    experienceYears: 7,
    availableToday: false,
  },
  {
    id: "coach-4",
    name: "Coach Yudi Pratama",
    title: "Technique & Fundamentals Specialist",
    license: "Certified Padel Instructor",
    city: "Bandung",
    venueNames: ["Padel Studio Bandung"],
    pricePerHour: 300000,
    rating: 4.85,
    reviewCount: 29,
    specialties: ["Dasar Pegangan Continental", "Grip & Swing Flow", "Clinic Grup Pemula"],
    experienceYears: 4,
    availableToday: true,
  },
]

export function CoachesHub() {
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [bookModalCoach, setBookModalCoach] = useState<CoachItem | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [sessionType, setSessionType] = useState<"private" | "semi-private">("private")
  const [selectedDate, setSelectedDate] = useState<string>("Hari Ini (16:00 WIB)")

  const filteredCoaches = coachesData.filter((c) => {
    if (selectedCity !== "all" && !c.city.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false
    }
    return true
  })

  const handleBook = () => {
    if (!bookModalCoach) return
    setBookingSuccess(`✓ Reservasi sesi coaching bersama ${bookModalCoach.name} berhasil! Konfirmasi jadwal telah dikirim ke profil dan WhatsApp Anda.`)
    setBookModalCoach(null)
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-border/90 bg-gradient-to-br from-[#121F17] via-[#16291E] to-[#101D15] p-6 sm:p-10 text-white shadow-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 -bottom-16 size-56 rounded-full bg-booking/10 blur-3xl" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/20 border border-brand/30 px-3 py-1 text-xs font-extrabold text-brand">
            <GraduationCap className="size-3.5" />
            <span>Padel Academy & Pro Coaches</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Tingkatkan Skill Bersama Pelatih Padel Bersertifikasi
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Kuasai teknik pukulan Bandeja, Vibora, Bajada, dan taktik positioning bersama pelatih berlisensi resmi internasional (FIP & WPT). Tersedia sesi privat dan klinik grup.
          </p>
        </div>
      </div>

      {bookingSuccess && (
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-xs font-bold text-success flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <Check className="size-4 shrink-0 stroke-[3]" />
            <span>{bookingSuccess}</span>
          </div>
          <button type="button" onClick={() => setBookingSuccess(null)} className="text-ink-muted hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* City Filter */}
      <div className="flex flex-wrap items-center gap-1.5 bg-surface p-4 rounded-2xl border border-border shadow-2xs">
        <span className="text-xs font-bold text-ink-muted mr-1">Kota:</span>
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
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
              selectedCity === city.id
                ? "bg-ink text-white shadow-xs"
                : "bg-surface-muted/60 text-ink-muted hover:text-ink"
            }`}
          >
            {city.label}
          </button>
        ))}
      </div>

      {/* Coaches Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredCoaches.map((coach) => (
          <article
            key={coach.id}
            className="group flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-xs hover:border-brand/40 hover:shadow-card transition-all duration-200"
          >
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-brand text-white font-display text-lg font-black shadow-2xs">
                    {coach.name.split(" ")[1]?.charAt(0) ?? "C"}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand transition-colors">
                      {coach.name}
                    </h3>
                    <p className="text-xs font-medium text-ink-muted">{coach.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-mono text-xs font-bold bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{coach.rating.toFixed(2)}</span>
                  <span className="text-[0.625rem] text-ink-muted">({coach.reviewCount})</span>
                </div>
              </div>

              {/* License Badge */}
              <div className="flex items-center gap-1.5 rounded-xl border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs text-brand font-semibold">
                <Award className="size-3.5 shrink-0" />
                <span className="truncate">{coach.license}</span>
              </div>

              {/* Locations & Venues */}
              <div className="space-y-1 text-xs">
                <span className="text-[0.6875rem] font-bold text-ink-muted">Home Venue Mengajar:</span>
                <div className="flex flex-wrap gap-1.5">
                  {coach.venueNames.map((venue) => (
                    <span
                      key={venue}
                      className="rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs text-ink flex items-center gap-1"
                    >
                      <MapPin className="size-3 text-brand" />
                      <span>{venue}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-1 text-xs">
                <span className="text-[0.6875rem] font-bold text-ink-muted">Spesialisasi Latihan:</span>
                <div className="flex flex-wrap gap-1">
                  {coach.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="rounded-md bg-surface-muted px-2 py-0.5 text-[0.6875rem] text-ink-muted"
                    >
                      ✓ {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Booking Button */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
              <div>
                <span className="text-[0.6875rem] text-ink-muted block">Tarif Sesi Privat:</span>
                <span className="font-mono text-base font-black text-ink">
                  {formatCurrency(coach.pricePerHour)}
                  <span className="text-xs font-normal text-ink-muted"> / jam</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setBookModalCoach(coach)}
                className="btn-cta px-4 py-2 text-xs font-bold text-ink rounded-xl hover:scale-105 transition-all shadow-xs"
              >
                Booking Pelatih
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Booking Coach Modal */}
      {bookModalCoach && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setBookModalCoach(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-float space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-brand" />
                <h3 className="font-display text-base font-bold text-ink">
                  Booking Sesi Coaching
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBookModalCoach(null)}
                className="grid size-8 place-items-center rounded-full border border-border hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 space-y-1">
                <h4 className="font-display text-base font-bold text-ink">{bookModalCoach.name}</h4>
                <p className="text-ink-muted">{bookModalCoach.title}</p>
                <p className="font-mono font-bold text-brand">{bookModalCoach.license}</p>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Pilih Jenis Sesi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionType("private")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      sessionType === "private"
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border bg-surface text-ink-muted"
                    }`}
                  >
                    1-on-1 Privat
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionType("semi-private")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      sessionType === "semi-private"
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border bg-surface text-ink-muted"
                    }`}
                  >
                    Semi-Privat (2 Org)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Pilihan Jadwal</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
                >
                  <option value="Hari Ini (16:00 WIB)">Hari Ini (16:00 – 17:00 WIB)</option>
                  <option value="Hari Ini (18:00 WIB)">Hari Ini (18:00 – 19:00 WIB)</option>
                  <option value="Besok (08:00 WIB)">Besok Pagi (08:00 – 09:00 WIB)</option>
                  <option value="Besok (19:00 WIB)">Besok Malam (19:00 – 20:00 WIB)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-bold text-ink">Total Biaya Sesi</span>
                <span className="font-mono text-lg font-black text-brand">
                  {formatCurrency(sessionType === "private" ? bookModalCoach.pricePerHour : bookModalCoach.pricePerHour * 1.3)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBook}
              className="btn-cta w-full text-xs font-bold py-3 rounded-xl shadow-xs"
            >
              Konfirmasi & Amankan Jadwal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
