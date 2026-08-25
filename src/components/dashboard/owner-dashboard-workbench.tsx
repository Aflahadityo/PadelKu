"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  CalendarClock,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  ImageIcon,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { OwnerBookingSummary, OwnerVenueSummary } from "@/lib/dashboard/owner-data"
import { formatCurrency } from "@/lib/utils"

interface OwnerDashboardWorkbenchProps {
  venues: OwnerVenueSummary[]
  bookings: OwnerBookingSummary[]
  grossSettledRupiah: number
  platformFeeRupiah: number
  venueNetRupiah: number
}

export function OwnerDashboardWorkbench({
  venues,
  bookings,
  grossSettledRupiah,
  platformFeeRupiah,
  venueNetRupiah,
}: OwnerDashboardWorkbenchProps) {
  const [bookingFilter, setBookingFilter] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"overview" | "venues" | "bookings" | "financials">("overview")
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false)
  const [checkinCode, setCheckinCode] = useState<string>("")
  const [checkinResult, setCheckinResult] = useState<{ success: boolean; message: string } | null>(null)
  const [selectedImageModal, setSelectedImageModal] = useState<{ title: string; url: string } | null>(null)

  const totalCourts = venues.reduce((acc, v) => acc + v.activeCourts, 0)

  const filteredBookings = bookings.filter((b) => {
    if (!bookingFilter) return true
    return (
      b.bookingCode.toLowerCase().includes(bookingFilter.toLowerCase()) ||
      b.venueName.toLowerCase().includes(bookingFilter.toLowerCase())
    )
  })

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkinCode.trim()) return
    const found = bookings.find((b) => b.bookingCode.toUpperCase() === checkinCode.trim().toUpperCase())
    if (found) {
      setCheckinResult({
        success: true,
        message: `Tiket Terverifikasi Valid: ${found.bookingCode} di ${found.venueName} (Status: ${found.status})`,
      })
    } else {
      setCheckinResult({
        success: false,
        message: `Kode booking "${checkinCode.toUpperCase()}" tidak ditemukan dalam jadwal aktif hari ini.`,
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. TOP HERO OPERATIONAL STRIP */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0D1812] via-[#121E17] to-[#15251C] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-16 size-48 rounded-full bg-booking/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/20 border border-brand/30 px-3 py-1 text-xs font-extrabold text-brand">
                <span className="size-2 rounded-full bg-brand animate-pulse" />
                Live Hub Operasional
              </span>
              <span className="font-mono text-xs text-white/50">
                {new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date())}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pusat Manajemen & Okupansi Arena
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Pantau {totalCourts} lapangan di {venues.length} arena terdaftar. Terima reservasi real-time dan validasi kedatangan pemain secara instan.
            </p>
          </div>

          {/* Quick Receptionist Check-in Form */}
          <div className="w-full lg:w-auto shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="size-4 text-booking" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/80">
                Resepsionis Check-In
              </span>
            </div>

            <form onSubmit={handleCheckin} className="flex gap-2">
              <input
                type="text"
                value={checkinCode}
                onChange={(e) => {
                  setCheckinCode(e.target.value)
                  setCheckinResult(null)
                }}
                placeholder="Kode booking (e.g. BK-99218)"
                className="h-10 w-full lg:w-56 rounded-xl border border-white/20 bg-black/40 px-3 font-mono text-xs font-bold uppercase text-white placeholder:normal-case placeholder:font-normal placeholder:text-white/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
              <button
                type="submit"
                className="btn-cta shrink-0 h-10 px-4 text-xs font-extrabold text-ink shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Cek
              </button>
            </form>
          </div>
        </div>

        {checkinResult && (
          <div
            className={`mt-4 rounded-2xl border p-4 text-xs font-bold backdrop-blur-md animate-in fade-in-50 flex items-center justify-between ${
              checkinResult.success
                ? "border-success/40 bg-success/15 text-emerald-300"
                : "border-error/40 bg-error/15 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {checkinResult.success ? (
                <BadgeCheck className="size-4 shrink-0 text-emerald-400" />
              ) : (
                <X className="size-4 shrink-0 text-rose-400" />
              )}
              <span>{checkinResult.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setCheckinResult(null)}
              className="text-white/60 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. REFINED KPI METRICS STRIP */}
      <section aria-label="Metrik Finansial & Operasional" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Revenue */}
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs transition-all hover:border-brand/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Gross Lunas (GMV)</span>
            <div className="grid size-8 place-items-center rounded-xl bg-brand/10 text-brand">
              <Wallet className="size-4" />
            </div>
          </div>
          <div>
            <p className="font-mono text-2xl font-black text-ink">
              {formatCurrency(grossSettledRupiah)}
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-muted">Total transaksi selesai diproses</p>
          </div>
        </div>

        {/* Platform Fee 5% */}
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs transition-all hover:border-brand/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Biaya Layanan (5%)</span>
            <span className="font-mono text-[0.625rem] font-bold text-ink-muted bg-surface-muted px-2 py-0.5 rounded-full border border-border">
              SLA 99.9%
            </span>
          </div>
          <div>
            <p className="font-mono text-2xl font-black text-ink-muted">
              {formatCurrency(platformFeeRupiah)}
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-muted">Pemeliharaan sistem & server gateway</p>
          </div>
        </div>

        {/* Net Payout Bersih */}
        <div className="rounded-3xl border-2 border-brand bg-gradient-to-br from-brand/10 via-surface to-brand/5 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand">Net Payout Bersih (95%)</span>
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(true)}
              className="badge-optic text-[0.625rem] font-black hover:scale-105 transition-transform"
            >
              Cairkan
            </button>
          </div>
          <div>
            <p className="font-mono text-2xl font-black text-brand">
              {formatCurrency(venueNetRupiah)}
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-muted">Saldo siap ditarik ke rekening BCA</p>
          </div>
        </div>

        {/* Okupansi & Kapasitas */}
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs transition-all hover:border-brand/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Okupansi Hari Ini</span>
            <span className="badge-turf text-[0.625rem] font-bold">78% PRIMA</span>
          </div>
          <div>
            <p className="font-mono text-2xl font-black text-ink">
              {bookings.length} Booking
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
              Terdistribusi di {totalCourts} lapangan aktif
            </p>
          </div>
        </div>
      </section>

      {/* 3. SEGMENTED NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface p-1 shadow-2xs">
          {[
            { id: "overview", label: "Ringkasan Operasional" },
            { id: "venues", label: `Venue Saya (${venues.length})` },
            { id: "bookings", label: `Jadwal & Reservasi (${bookings.length})` },
            { id: "financials", label: "Bagi Hasil & Payout" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink-muted hover:text-ink hover:bg-surface-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWithdrawModalOpen(true)}
            className="btn-cta inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold shadow-xs"
          >
            <Wallet className="size-3.5" />
            <span>Tarik Saldo ({formatCurrency(venueNetRupiah)})</span>
          </button>
        </div>
      </div>

      {/* 4. TAB CONTENT 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Active Schedule & Occupancy Visualizer */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Occupancy Card (7 Cols) */}
            <div className="lg:col-span-7 rounded-3xl border border-border/90 bg-surface p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-brand" />
                  <h3 className="font-display text-base font-bold text-ink">
                    Okupansi Lapangan & Jam Sibuk
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-ink">
                  {totalCourts} Total Lapangan
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-ink">Pagi & Siang (07:00 – 16:00)</span>
                    <span className="font-mono text-brand font-bold">60% Terisi</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: "60%" }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-ink">Prime-Time Malam (17:00 – 23:00)</span>
                    <span className="font-mono text-booking-text font-bold bg-booking/20 px-2 py-0.5 rounded-md">
                      100% Penuh (Sold Out)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-muted/50 p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-ink">Rating Kepuasan Pemain</p>
                  <p className="text-[0.6875rem] text-ink-muted">Berdasarkan ulasan terverifikasi setelah bermain</p>
                </div>
                <div className="flex items-center gap-1 font-mono text-base font-black text-ink">
                  <span className="text-amber-500">★</span>
                  <span>4.9 / 5.0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card (5 Cols) */}
            <div className="lg:col-span-5 rounded-3xl border border-border/90 bg-surface p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/80 pb-3">
                <Sparkles className="size-4 text-brand" />
                <h3 className="font-display text-base font-bold text-ink">
                  Aksi & Pengaturan Cepat
                </h3>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("venues")}
                  className="w-full flex items-center justify-between rounded-2xl border border-border bg-surface-muted/30 p-3.5 text-xs font-bold text-ink hover:border-brand/40 hover:bg-surface transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-xl bg-brand/10 text-brand">
                      <Plus className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold text-ink">Kelola Lapangan / Court</p>
                      <p className="text-[0.6875rem] font-normal text-ink-muted">Ubah tarif per jam & status aktif</p>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-ink-muted" />
                </button>

                <button
                  type="button"
                  onClick={() => alert("Fitur Blokir Jadwal: Anda dapat memblokir slot untuk turnamen internal atau jadwal perawatan rutin.")}
                  className="w-full flex items-center justify-between rounded-2xl border border-border bg-surface-muted/30 p-3.5 text-xs font-bold text-ink hover:border-brand/40 hover:bg-surface transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-xl bg-urgent/10 text-urgent">
                      <Calendar className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold text-ink">Blokir Slot (Turnamen/Maintenance)</p>
                      <p className="text-[0.6875rem] font-normal text-ink-muted">Tutup sementara slot jam tertentu</p>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-ink-muted" />
                </button>

                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(true)}
                  className="w-full flex items-center justify-between rounded-2xl border border-border bg-surface-muted/30 p-3.5 text-xs font-bold text-ink hover:border-brand/40 hover:bg-surface transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-2xl bg-success/10 text-success">
                      <CreditCard className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold text-ink">Rekening Penampungan Payout</p>
                      <p className="text-[0.6875rem] font-normal text-ink-muted">BCA ****8819 (Terverifikasi)</p>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-ink-muted" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preview of Venues & Bookings */}
          <div className="rounded-3xl border border-border/90 bg-surface shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/80 bg-surface-muted/30 p-5 sm:p-6">
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-ink">
                  Reservasi Masuk Terbaru
                </h3>
                <p className="text-xs text-ink-muted">Pemain yang telah menyelesaikan pembayaran tiket</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("bookings")}
                className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua ({bookings.length})</span>
                <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="divide-y divide-border/80">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-surface-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-xl bg-brand/10 text-brand font-mono font-bold text-xs">
                      🎾
                    </span>
                    <div>
                      <span className="font-mono text-xs font-bold text-ink">
                        {booking.bookingCode}
                      </span>
                      <p className="font-display text-sm font-bold text-ink">
                        {booking.venueName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={booking.status} />
                    {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} />}
                  </div>

                  <p className="font-mono text-sm font-black text-ink">
                    {formatCurrency(booking.totalPriceRupiah)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT 2: RICH VENUE CARDS */}
      {activeTab === "venues" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Daftar Venue Terdaftar</h3>
              <p className="text-xs text-ink-muted">
                Kelola status operasional, jadwal, foto, dan lapangan aktif di setiap arena
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert("Formulir pengajuan arena baru: Silakan hubungi tim kurasi PadelKu jika butuh bantuan.")}
              className="btn-turf inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Daftarkan Arena Baru</span>
            </button>
          </div>

          {/* High-End Rich Venue Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {venues.map((venue) => {
              const coverPhoto = venue.imageUrls?.[0]

              return (
                <article
                  key={venue.id}
                  className="group overflow-hidden rounded-3xl border border-border/90 bg-surface shadow-card hover:border-brand/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Photo Header */}
                    <div className="relative aspect-[16/8] w-full overflow-hidden bg-surface-muted">
                      {coverPhoto ? (
                        <Image
                          src={coverPhoto}
                          alt={venue.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/10 via-surface-muted to-brand/5 text-ink-muted">
                          <ImageIcon className="size-8 text-brand/40" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Header overlay badges */}
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/10">
                          {venue.city}
                        </span>
                        <StatusBadge status={venue.status} />
                      </div>

                      {/* Photo preview button */}
                      {venue.imageUrls && venue.imageUrls.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedImageModal({
                              title: venue.name,
                              url: venue.imageUrls[0],
                            })
                          }
                          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-ink/70 text-white backdrop-blur-md hover:bg-ink transition-colors"
                          title="Lihat Foto"
                        >
                          <Eye className="size-3.5" />
                        </button>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h4 className="font-display text-xl font-bold tracking-tight">
                          {venue.name}
                        </h4>
                        <p className="mt-0.5 text-xs text-white/80 line-clamp-1">
                          {venue.address}
                        </p>
                      </div>
                    </div>

                    {/* Venue Body Details */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Operational hours & active courts */}
                      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface-muted/50 p-3.5 text-xs">
                        <div>
                          <span className="flex items-center gap-1 text-[0.6875rem] font-semibold text-ink-muted">
                            <CalendarClock className="size-3 text-brand" />
                            <span>Jam Buka</span>
                          </span>
                          <p className="mt-1 font-mono font-bold text-ink">
                            {venue.openingTime} – {venue.closingTime} WIB
                          </p>
                        </div>

                        <div>
                          <span className="flex items-center gap-1 text-[0.6875rem] font-semibold text-ink-muted">
                            <ShieldCheck className="size-3 text-brand" />
                            <span>Kapasitas</span>
                          </span>
                          <p className="mt-1 font-mono font-bold text-brand">
                            {venue.activeCourts} Lapangan Aktif
                          </p>
                        </div>
                      </div>

                      {/* Court items list */}
                      <div className="space-y-2">
                        <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                          Daftar Lapangan & Tarif:
                        </span>
                        <div className="space-y-1.5">
                          {venue.courts.map((court) => (
                            <div
                              key={court.id}
                              className="flex items-center justify-between rounded-xl border border-border/80 bg-surface px-3 py-2 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-brand" />
                                <span className="font-semibold text-ink">{court.name}</span>
                              </div>
                              <span className="font-mono font-bold text-ink">
                                {formatCurrency(court.pricePerHour)}/jam
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Facilities */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {venue.facilities.map((fac) => (
                          <span
                            key={fac}
                            className="rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-[0.6875rem] font-medium text-ink-muted"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>

                      {venue.rejectionReason && (
                        <div className="rounded-xl border border-error/30 bg-error/5 p-3 text-xs text-error">
                          <p className="font-bold">Catatan Verifikasi Admin:</p>
                          <p className="mt-0.5">&ldquo;{venue.rejectionReason}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center gap-2 border-t border-border/80 p-5 bg-surface-muted/30">
                    <Link
                      href={`/venues/${venue.slug}`}
                      target="_blank"
                      className="btn-secondary flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl shadow-2xs"
                    >
                      <span>Lihat Halaman Publik</span>
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT 3: BOOKINGS & CHECK-IN TABLE */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Semua Booking Masuk</h3>
              <p className="text-xs text-ink-muted">
                Jadwal reservasi pemain yang sudah terkonfirmasi di database
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                placeholder="Cari kode booking..."
                className="h-10 w-64 rounded-xl border border-border-strong bg-surface pl-9 pr-3 text-xs text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border/90 bg-surface shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[50rem] text-left text-xs">
                <thead className="bg-surface-muted text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-5 py-3.5">Kode Booking</th>
                    <th className="px-5 py-3.5">Venue</th>
                    <th className="px-5 py-3.5">Status Booking</th>
                    <th className="px-5 py-3.5">Status Pembayaran</th>
                    <th className="px-5 py-3.5 text-right">Nilai Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-muted/20 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-ink text-sm">
                        {b.bookingCode}
                      </td>
                      <td className="px-5 py-4 font-semibold text-ink">
                        {b.venueName}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-4">
                        {b.paymentStatus ? (
                          <StatusBadge status={b.paymentStatus} />
                        ) : (
                          <span className="text-ink-muted">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-black text-sm text-ink">
                        {formatCurrency(b.totalPriceRupiah)}
                      </td>
                    </tr>
                  ))}
                  {!filteredBookings.length && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-ink-muted">
                        Tidak ada booking yang cocok dengan kata kunci pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT 4: FINANCIALS & PAYOUT */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/90 bg-surface p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Ringkasan Bagi Hasil & Payout</h3>
              <p className="text-xs text-ink-muted">
                PadelKu menerapkan skema transparan 95% net payout untuk venue dan 5% platform service fee.
              </p>
            </div>

            {/* Visual Progress Split */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <span className="text-ink">Gross Lunas: {formatCurrency(grossSettledRupiah)}</span>
                <span className="text-brand">Net Payout Venue (95%): {formatCurrency(venueNetRupiah)}</span>
                <span className="text-ink-muted">Platform Fee (5%): {formatCurrency(platformFeeRupiah)}</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full bg-brand" style={{ width: "95%" }} />
                <div className="h-full bg-ink-muted" style={{ width: "5%" }} />
              </div>
            </div>

            {/* Bank Account Info Card */}
            <div className="rounded-2xl border border-border bg-surface-muted/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="grid size-12 place-items-center rounded-2xl bg-brand text-white shadow-2xs">
                  <CreditCard className="size-6" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-ink">Rekening Penampungan Payout</p>
                  <p className="font-mono text-xs text-ink-muted">Bank Central Asia (BCA) · **** 8819</p>
                  <p className="text-[0.625rem] text-success font-semibold">✓ Terverifikasi Otomatis</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWithdrawModalOpen(true)}
                className="btn-cta text-xs font-bold px-5 py-2.5 shadow-xs shrink-0"
              >
                Cairkan Saldo Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PHOTO PREVIEW MODAL */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-float space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="font-display text-base font-bold text-ink">
                {selectedImageModal.title}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedImageModal(null)}
                className="grid size-8 place-items-center rounded-full border border-border hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
              <Image
                src={selectedImageModal.url}
                alt={selectedImageModal.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* 9. WITHDRAW PAYOUT MODAL */}
      {withdrawModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setWithdrawModalOpen(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-float space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-brand" />
                <h4 className="font-display text-base font-bold text-ink">
                  Pencairan Dana (Withdraw Payout)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                className="grid size-8 place-items-center rounded-full border border-border hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4 space-y-1">
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-brand">
                Saldo Tersedia untuk Ditarik:
              </span>
              <p className="font-mono text-2xl font-black text-ink">{formatCurrency(venueNetRupiah)}</p>
            </div>

            <div className="space-y-3 text-xs text-ink-muted">
              <p>Dana akan ditransfer langsung ke rekening penampungan terdaftar:</p>
              <div className="rounded-xl border border-border p-3 font-mono text-xs font-bold text-ink bg-surface-muted/40">
                BCA — 8820 1928 33 (a.n. PT Padel Arena Indonesia)
              </div>
              <p className="text-[0.6875rem]">Proses pencairan diproses otomatis setiap hari kerja pukul 16:00 WIB.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                alert("Permintaan pencairan dana berhasil diajukan! Dana akan masuk ke rekening Anda dalam 1x24 jam.")
                setWithdrawModalOpen(false)
              }}
              className="btn-cta w-full text-xs font-bold py-3 rounded-xl shadow-xs"
            >
              Konfirmasi Penarikan ({formatCurrency(venueNetRupiah)})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
