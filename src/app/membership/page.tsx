"use client"

import { Crown, Check, Shield } from "lucide-react"
import { PlayerHeader } from "@/components/shell/player-header"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"

const plans = [
  {
    name: "Free Player",
    price: "Rp0",
    period: "selamanya",
    description: "Akses standar reservasi lapangan padel di seluruh Indonesia.",
    features: [
      "Akses pencarian & booking semua venue",
      "Diagram jadwal lapangan real-time",
      "Split bill pembayaran via QRIS",
      "Riwayat booking & e-tiket digital",
    ],
    isPopular: false,
    ctaText: "Akun Standar Aktif",
    ctaVariant: "secondary" as const,
  },
  {
    name: "PadelKu Pro Pass",
    price: "Rp149.000",
    period: "/bulan",
    description: "Untuk pemain aktif yang ingin hemat & selalu dapat slot jam favorit.",
    features: [
      "Diskon 10% di semua venue mitra",
      "Prioritas booking 5 hari lebih awal",
      "Bebas biaya sewa raket (1x/minggu)",
      "Akses grup Open Match VIP & WhatsApp per area",
      "Notifikasi instan jika ada slot cancel di venue favorit",
    ],
    isPopular: true,
    ctaText: "Mulai Langganan Pro",
    ctaVariant: "primary" as const,
  },
  {
    name: "Elite All-Access VIP",
    price: "Rp399.000",
    period: "/bulan",
    description: "Paket lengkap untuk pemain kompetitif, turnamen, dan sparring rutin.",
    features: [
      "Diskon 20% di seluruh jaringan venue",
      "Prioritas booking 7 hari lebih awal (Jam Prima 18-21)",
      "Gratis 1 kaleng bola padel WPT baru setiap bulan",
      "Undangan resmi PadelKu Championship Series",
      "Konsultasi coaching online & analitik match",
    ],
    isPopular: false,
    ctaText: "Daftar Elite VIP",
    ctaVariant: "secondary" as const,
  },
]

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader />

      <main className="safe-area-x mx-auto max-w-5xl pt-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-surface px-3 py-1 text-xs font-bold text-brand shadow-2xs">
            <Crown className="size-3.5" />
            <span>PadelKu Membership Program</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink">
            Pilih Paket Membership Padel Anda
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Dapatkan prioritas slot jam prima, diskon biaya sewa lapangan, dan benefit eksklusif di seluruh venue mitra PadelKu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                plan.isPopular
                  ? "border-2 border-brand bg-surface shadow-card relative -translate-y-1"
                  : "border-border bg-surface/90 shadow-xs"
              }`}
            >
              <div>
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="badge-optic text-xs font-extrabold shadow-xs">
                      🔥 PALING DIMINATI
                    </span>
                  </div>
                )}

                <div className="space-y-2 pb-4 border-b border-border/80">
                  <h2 className="font-display text-xl font-bold text-ink">{plan.name}</h2>
                  <p className="text-xs text-ink-muted min-h-[32px] leading-relaxed">{plan.description}</p>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="font-mono text-3xl font-black text-ink">{plan.price}</span>
                    <span className="text-xs font-semibold text-ink-muted">{plan.period}</span>
                  </div>
                </div>

                <div className="py-5 space-y-2.5">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted block">
                    Keuntungan:
                  </span>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-ink font-medium leading-tight">
                        <Check className="size-4 text-brand shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-border/80">
                <button
                  onClick={() => alert(`Anda memilih paket ${plan.name}. Fitur checkout membership segera aktif!`)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                    plan.isPopular
                      ? "btn-cta shadow-xs"
                      : "btn-secondary"
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="rounded-2xl border border-border bg-surface-muted/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-ink">Garansi Fleksibel 100%</p>
              <p className="text-ink-muted">Dapat dibatalkan atau di-upgrade kapan saja tanpa biaya penalti.</p>
            </div>
          </div>
          <span className="font-mono font-bold text-brand">Bebas komitmen jangka panjang</span>
        </div>
      </main>

      <MobileTabBar />
    </div>
  )
}
