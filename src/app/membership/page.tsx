"use client"

import { useState } from "react"
import { Crown, Check, Shield, HelpCircle } from "lucide-react"
import { PlayerHeader } from "@/components/shell/player-header"
import { PlayerFooter } from "@/components/shell/player-footer"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { cn } from "@/lib/utils"

export default function MembershipPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const plans = [
    {
      name: "Free Player",
      monthlyPrice: "Rp0",
      yearlyPrice: "Rp0",
      period: "selamanya",
      description: "Akses standar reservasi lapangan padel di seluruh Indonesia.",
      features: [
        "Akses pencarian & booking semua venue mitra",
        "Diagram jadwal lapangan real-time (Court Grid)",
        "Fitur split-bill pembayaran via QRIS",
        "E-tiket digital & riwayat bermain",
      ],
      isPopular: false,
      ctaText: "Akun Standar Aktif",
      ctaVariant: "secondary" as const,
    },
    {
      name: "PadelKu Pro Pass",
      monthlyPrice: "Rp149.000",
      yearlyPrice: "Rp1.430.000",
      period: billingCycle === "monthly" ? "/bulan" : "/tahun (Hemat 20%)",
      description: "Untuk pemain aktif yang ingin hemat & selalu dapat slot jam favorit.",
      features: [
        "Diskon 10% di semua venue mitra PadelKu",
        "Prioritas booking 5 hari lebih awal",
        "Gratis sewa raket (1x setiap minggu)",
        "Akses grup Open Match VIP WhatsApp per area",
        "Notifikasi instan jika ada pembatalan slot prima",
      ],
      isPopular: true,
      ctaText: "Mulai Langganan Pro",
      ctaVariant: "primary" as const,
    },
    {
      name: "Elite All-Access VIP",
      monthlyPrice: "Rp399.000",
      yearlyPrice: "Rp3.830.000",
      period: billingCycle === "monthly" ? "/bulan" : "/tahun (Hemat 20%)",
      description: "Paket lengkap untuk pemain kompetitif, turnamen, dan sparring rutin.",
      features: [
        "Diskon 20% di seluruh jaringan venue mitra",
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

  const faqs = [
    {
      q: "Bagaimana cara kerja prioritas booking?",
      a: "Member Pro dan Elite VIP dapat melihat dan memesan jadwal lapangan hingga 5-7 hari lebih awal sebelum jadwal dibuka untuk umum.",
    },
    {
      q: "Apakah diskon berlaku di semua venue mitra?",
      a: "Ya, diskon otomatis terpotong saat proses pembayaran di seluruh venue bertanda 'Mitra Resmi PadelKu'.",
    },
    {
      q: "Apakah saya bisa membatalkan langganan kapan saja?",
      a: "Tentu. Anda dapat membatalkan atau mengubah paket membership kapan saja dari menu Profil tanpa biaya penalti.",
    },
  ]

  return (
    <div className="min-h-screen bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader />

      <main className="safe-area-x mx-auto max-w-6xl pt-8 space-y-12">
        {/* Header & Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-surface px-3 py-1 text-xs font-bold text-brand shadow-2xs">
            <Crown className="size-3.5" />
            <span>PadelKu Membership Program</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Tingkatkan Permainanmu dengan Membership VIP
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Dapatkan prioritas slot jam prima, diskon biaya sewa lapangan, dan benefit eksklusif di seluruh arena mitra PadelKu.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-2xs mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-all",
                billingCycle === "monthly"
                  ? "bg-ink text-white shadow-xs"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              Tagihan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all",
                billingCycle === "yearly"
                  ? "bg-ink text-white shadow-xs"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              <span>Tagihan Tahunan</span>
              <span className="badge-optic text-[0.625rem] font-black px-1.5 py-0.5">
                HEMAT 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

            return (
              <div
                key={plan.name}
                className={cn(
                  "rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-200",
                  plan.isPopular
                    ? "border-2 border-brand bg-surface shadow-card relative -translate-y-1"
                    : "border-border/90 bg-surface/90 shadow-xs",
                )}
              >
                <div>
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="badge-optic text-xs font-extrabold shadow-xs">
                        🔥 PALING DIMINATI
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 pb-5 border-b border-border/80">
                    <h2 className="font-display text-xl font-bold text-ink">{plan.name}</h2>
                    <p className="text-xs text-ink-muted min-h-[32px] leading-relaxed">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1.5 pt-2">
                      <span className="font-mono text-3xl sm:text-4xl font-black text-ink">
                        {price}
                      </span>
                      <span className="text-xs font-semibold text-ink-muted">{plan.period}</span>
                    </div>
                  </div>

                  <div className="py-5 space-y-3">
                    <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted block">
                      Benefit Eksklusif:
                    </span>
                    <ul className="space-y-2.5 text-xs">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-ink font-medium leading-tight">
                          <Check className="size-4 text-brand shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 border-t border-border/80">
                  <button
                    type="button"
                    onClick={() =>
                      alert(`Anda memilih paket ${plan.name}. Fitur checkout membership segera aktif!`)
                    }
                    className={cn(
                      "w-full py-3 rounded-xl text-xs font-bold transition-all shadow-xs",
                      plan.isPopular ? "btn-cta" : "btn-secondary",
                    )}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-2xs">
              <Shield className="size-6" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">Garansi Fleksibel 100%</p>
              <p className="text-xs text-ink-muted">
                Dapat dibatalkan atau di-upgrade kapan saja tanpa biaya tersembunyi.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-brand shrink-0">
            Bebas komitmen jangka panjang
          </span>
        </div>

        {/* FAQ Section */}
        <section className="space-y-4 max-w-3xl mx-auto pt-4">
          <div className="text-center space-y-1">
            <h3 className="font-display text-xl font-bold text-ink">Pertanyaan Umum</h3>
            <p className="text-xs text-ink-muted">Informasi seputar sistem membership PadelKu</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-1.5">
                <p className="font-display text-sm font-bold text-ink flex items-center gap-2">
                  <HelpCircle className="size-4 text-brand" />
                  {faq.q}
                </p>
                <p className="text-xs text-ink-muted leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PlayerFooter />
      <MobileTabBar />
    </div>
  )
}
