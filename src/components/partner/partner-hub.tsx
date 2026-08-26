"use client"

import { useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Globe,
  QrCode,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function PartnerHub() {
  // Calculator state
  const [courtCount, setCourtCount] = useState<number>(3)
  const [hourlyPrice, setHourlyPrice] = useState<number>(350000)
  const [occupancyRate, setOccupancyRate] = useState<number>(65)

  // Form state
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [venueName, setVenueName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [city, setCity] = useState("Jakarta Selatan")

  // Calculations (30 days * 14 operating hours = 420 hours per court/month)
  const totalOperatingHours = 420
  const monthlyGross = Math.round(courtCount * totalOperatingHours * hourlyPrice * (occupancyRate / 100))
  const platformFee = Math.round(monthlyGross * 0.05)
  const netPayout = monthlyGross - platformFee

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-border/90 bg-gradient-to-br from-[#121F17] via-[#16291E] to-[#101D15] p-6 sm:p-12 text-white shadow-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-brand/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 -bottom-16 size-64 rounded-full bg-booking/10 blur-3xl" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/20 border border-brand/30 px-3.5 py-1 text-xs font-extrabold text-brand">
            <Building2 className="size-3.5" />
            <span>PadelKu Venue Partner Network</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Tingkatkan Okupansi Arena Padel Anda Hingga 85%+
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
            Gantikan pencatatan manual via WhatsApp. Bergabunglah dengan marketplace padel #1 di Indonesia dengan sistem sinkronisasi jadwal real-time dan pembayaran lunas otomatis.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#registration-form"
              className="btn-cta inline-flex items-center gap-2 px-6 py-3.5 text-xs font-black text-ink rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              <span>Daftarkan Arena Anda</span>
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#roi-calculator"
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold text-white border-white/20 bg-white/5 hover:bg-white/10 rounded-xl"
            >
              <span>Hitung Estimasi Pendapatan</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4 Key Advantages */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="font-display text-2xl font-bold text-ink">
            Mengapa Pemilik Arena Memilih PadelKu?
          </h2>
          <p className="text-xs text-ink-muted">
            Solusi menyeluruh dari distribusi marketplace hingga sistem operasional resepsionis.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Zap className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">Anti Double-Booking</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Sistem 10-minute hold lock otomatis mengunci slot saat pemain checkout, menjamin tidak ada jadwal yang bentrok.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-brand/10 text-brand">
              <QrCode className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">Split Bill QRIS Otomatis</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Pemain dapat membagi tagihan otomatis dengan rekan mainnya tanpa Anda perlu merekap transfer manual.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-brand/10 text-brand">
              <TrendingUp className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">95% Net Payout Bersih</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Skema bagi hasil paling kompetitif di industri: 95% net payout untuk arena Anda dan 5% platform fee tanpa biaya tersembunyi.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Globe className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">Discovery Ribuan Pemain</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Arena Anda langsung dipromosikan ke komunitas pemain padel aktif di Jakarta, Bali, BSD, Bandung, dan kota lainnya.
            </p>
          </div>
        </div>
      </section>

      {/* ROI & Revenue Calculator */}
      <section id="roi-calculator" className="rounded-3xl border border-border/90 bg-surface p-6 sm:p-10 shadow-card space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-brand uppercase tracking-wider">
              <BarChart3 className="size-3.5" />
              <span>Simulasi Pendapatan Venue</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Kalkulator Potensi Pendapatan Bulanan
            </h2>
            <p className="text-xs text-ink-muted">
              Sesuaikan jumlah lapangan, tarif per jam, dan target okupansi untuk melihat simulasi GMV arena Anda.
            </p>
          </div>

          <span className="badge-optic font-black text-xs px-3 py-1">
            ESTIMASI REALISTIS
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Sliders (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Court Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>Jumlah Lapangan Aktif:</span>
                <span className="font-mono text-base text-brand">{courtCount} Lapangan</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={courtCount}
                onChange={(e) => setCourtCount(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-[0.6875rem] text-ink-muted font-mono">
                <span>1 Lapangan</span>
                <span>8 Lapangan</span>
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>Rata-Rata Tarif per Jam:</span>
                <span className="font-mono text-base text-brand">{formatCurrency(hourlyPrice)} / jam</span>
              </div>
              <input
                type="range"
                min={200000}
                max={500000}
                step={25000}
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-[0.6875rem] text-ink-muted font-mono">
                <span>Rp 200.000</span>
                <span>Rp 500.000</span>
              </div>
            </div>

            {/* Occupancy Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>Target Okupansi Rata-Rata:</span>
                <span className="font-mono text-base text-brand">{occupancyRate}% Terisi</span>
              </div>
              <input
                type="range"
                min={30}
                max={95}
                step={5}
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-[0.6875rem] text-ink-muted font-mono">
                <span>30% (Awal Buka)</span>
                <span>95% (Prime-Time Penuh)</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl border-2 border-brand bg-gradient-to-br from-brand/10 via-surface-muted to-brand/5 p-6 shadow-sm space-y-4">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-brand block">
              Estimasi Payout Bersih per Bulan:
            </span>

            <p className="font-mono text-3xl sm:text-4xl font-black text-brand leading-none">
              {formatCurrency(netPayout)}
            </p>

            <div className="space-y-2 border-t border-border/80 pt-3 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Gross GMV Reservasi:</span>
                <span className="font-mono font-semibold text-ink">{formatCurrency(monthlyGross)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Platform Service Fee (5%):</span>
                <span className="font-mono font-semibold text-ink">{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-brand pt-1 border-t border-border/60">
                <span>Net Payout Anda (95%):</span>
                <span className="font-mono">{formatCurrency(netPayout)}</span>
              </div>
            </div>

            <p className="text-[0.6875rem] text-ink-muted">
              *Perhitungan berbasis 14 jam operasional per hari (07:00 – 21:00) selama 30 hari kalender.
            </p>
          </div>
        </div>
      </section>

      {/* Registration Application Form */}
      <section id="registration-form" className="rounded-3xl border border-border/90 bg-surface p-6 sm:p-10 shadow-card space-y-6 max-w-2xl mx-auto">
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-brand uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Formulir Kemitraan</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">
            Daftarkan Arena Anda ke PadelKu
          </h2>
          <p className="text-xs text-ink-muted">
            Tim kurasi kami akan menghubungi Anda dalam 1x24 jam untuk verifikasi lokasi & integrasi jadwal.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-success text-white">
              <BadgeCheck className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">Pengajuan Berhasil Dikirim!</h3>
            <p className="text-xs text-ink-muted leading-relaxed max-w-md mx-auto">
              Terima kasih <strong>{ownerName}</strong>. Pengajuan untuk <strong>{venueName}</strong> ({city}) telah kami terima. Tim kurasi PadelKu akan segera menghubungi WhatsApp <strong>{ownerPhone}</strong> untuk proses integrasi lapangan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-ink mb-1">Nama Arena / Venue Padel</label>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Contoh: Padel Club Kemang"
                className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink mb-1">Nama Pengelola / Owner</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Nomor WhatsApp Pengelola</label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 font-mono text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-ink mb-1">Kota Lokasi Arena</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs text-ink focus:border-brand focus:outline-none"
              >
                <option value="Jakarta Selatan">Jakarta Selatan</option>
                <option value="Jakarta Pusat">Jakarta Pusat</option>
                <option value="Jakarta Barat">Jakarta Barat</option>
                <option value="Jakarta Utara">Jakarta Utara</option>
                <option value="Tangerang / BSD">Tangerang / BSD City</option>
                <option value="Bali (Canggu / Seminyak / Sanur)">Bali</option>
                <option value="Bandung">Bandung</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-cta w-full text-xs font-bold py-3.5 rounded-xl shadow-sm mt-2"
            >
              Kirim Pengajuan Kemitraan
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
