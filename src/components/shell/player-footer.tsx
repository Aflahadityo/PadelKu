import Link from "next/link"
import { ArrowRight, Building2, Heart, Mail, ShieldCheck } from "lucide-react"
import { BrandMark } from "@/components/shell/brand-mark"

export function PlayerFooter() {
  return (
    <footer className="mt-16 border-t border-border/80 bg-surface pt-12 pb-24 md:pb-12 text-ink">
      <div className="safe-area-x mx-auto max-w-7xl space-y-12">
        {/* Partner Onboarding Banner */}
        <div className="rounded-3xl border border-brand/40 bg-gradient-to-br from-[#141E18] to-[#0A120E] p-6 sm:p-10 text-white shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-booking">
              <Building2 className="size-3.5" />
              <span>Kemitraan Arena Padel</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Punya Venue Lapangan Padel?
            </h3>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Tingkatkan okupansi slot non-prime dan permudah manajemen reservasi dengan sistem otomatisasi jadwal & split-bill PadelKu.
            </p>
          </div>

          <Link
            href="/venue-owner"
            className="btn-cta shrink-0 inline-flex items-center gap-2 px-6 py-3 font-display text-xs font-bold text-ink shadow-md"
          >
            <span>Daftarkan Venue Sekarang</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Footer Navigation Links */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Col 1: Brand info */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <BrandMark />
            <p className="text-xs text-ink-muted leading-relaxed">
              Platform marketplace & booking lapangan padel pertama di Indonesia dengan diagram jadwal real-time dan split-bill instan.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand">
              <ShieldCheck className="size-4" />
              <span>Mitra Resmi Padel Indonesia</span>
            </div>
          </div>

          {/* Col 2: Pemain & Komunitas */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-ink">Eksplorasi Pemain</h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/" className="hover:text-brand transition-colors">
                  Cari Lapangan Padel
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-brand transition-colors">
                  Open Match & Sparring
                </Link>
              </li>
              <li>
                <Link href="/coaches" className="hover:text-brand transition-colors">
                  Pelatih Padel Bersertifikasi
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="hover:text-brand transition-colors">
                  Sewa Raket & Alat
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-brand transition-colors">
                  Leaderboard & Turnamen
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-brand transition-colors">
                  Membership VIP Pro Pass
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Wilayah Populer */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-ink">Wilayah Populer</h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/?city=Jakarta+Selatan#venue-list" className="hover:text-brand transition-colors">
                  Jakarta Selatan (Kemang)
                </Link>
              </li>
              <li>
                <Link href="/?city=Jakarta+Pusat#venue-list" className="hover:text-brand transition-colors">
                  Jakarta Pusat (Senayan/SCBD)
                </Link>
              </li>
              <li>
                <Link href="/?city=Tangerang#venue-list" className="hover:text-brand transition-colors">
                  BSD City & Tangerang
                </Link>
              </li>
              <li>
                <Link href="/?city=Bali#venue-list" className="hover:text-brand transition-colors">
                  Bali (Canggu & Seminyak)
                </Link>
              </li>
              <li>
                <Link href="/?city=Bandung#venue-list" className="hover:text-brand transition-colors">
                  Bandung & Surabaya
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Pengelola & Kontak */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-ink">Bantuan & Mitra</h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/partner" className="hover:text-brand transition-colors">
                  Kemitraan & Estimasi ROI
                </Link>
              </li>
              <li>
                <Link href="/venue-owner" className="hover:text-brand transition-colors">
                  Portal Pemilik Venue
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-brand transition-colors">
                  Pusat Bantuan & FAQ
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand transition-colors">
                  Pusat Kendali Admin
                </Link>
              </li>
              <li className="flex items-center gap-1.5 pt-1 text-ink">
                <Mail className="size-3.5 text-brand" />
                <span>support@padelku.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="border-t border-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.6875rem] text-ink-muted">
          <p>© {new Date().getFullYear()} PadelKu Indonesia. Hak cipta dilindungi undang-undang.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/terms" className="hover:text-brand hover:underline">Ketentuan</Link>
            <Link href="/privacy" className="hover:text-brand hover:underline">Privasi</Link>
            <p className="flex items-center gap-1">
              Dibuat dengan <Heart className="size-3 fill-urgent text-urgent" /> untuk kemajuan padel nasional.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
