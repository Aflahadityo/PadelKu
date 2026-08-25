import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Info } from "lucide-react"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { ReviewList } from "@/components/venue/review-list"
import { VenueCourtGrid } from "@/components/venue/venue-court-grid"
import { VenueHeader } from "@/components/venue/venue-header"
import { getVenueDetail } from "@/lib/data/marketplace"
import { getOptionalShellPlayer } from "@/lib/data/player"

export default async function VenueDetailPage({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await params
  const [venue, user] = await Promise.all([getVenueDetail(venueId), getOptionalShellPlayer()])
  if (!venue) notFound()

  return (
    <div className="min-h-screen bg-canvas pb-24 text-ink md:pb-16">
      <PlayerHeader user={user ?? undefined} />

      <main className="safe-area-x mx-auto max-w-7xl space-y-8 pt-4">
        {/* Back breadcrumb */}
        <Link
          href="/#venue-list"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Kembali ke daftar venue</span>
        </Link>

        {/* Venue Profile Header */}
        <VenueHeader venue={venue} />

        {/* Court Scheduling Section */}
        <section id="court-grid-schedule" className="border-t border-border/80 pt-8 space-y-2">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-brand">
            <Clock className="size-3.5" />
            <span>Pilih Waktu Bermain</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-[-0.035em] text-ink">
            Jadwal Lapangan Real-Time
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            Pilih tanggal dan klik pada slot jam yang tersedia (kuning) untuk memesan lapangan secara instan.
          </p>

          <VenueCourtGrid venueId={venue.id} venueName={venue.name} />
        </section>

        {/* Venue Rules & Cancellation Policy Banner */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-ink font-display text-base font-bold">
            <Info className="size-4 text-brand" />
            <span>Ketentuan & Tata Tertib Bermain di {venue.name}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-xs text-ink-muted">
            <div className="space-y-1">
              <p className="font-bold text-ink">Pakaian & Sepatu</p>
              <p>Wajib menggunakan sepatu khusus padel/tenis (non-marking sole) dan pakaian olahraga yang sesuai.</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-ink">Kebijakan Reschedule</p>
              <p>Pengajuan ganti jadwal dapat dilakukan maksimal 6 jam sebelum sesi bermain dimulai melalui menu Booking.</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-ink">Sewa Alat & Bola</p>
              <p>Raket padel dan bola kompetisi tersedia untuk disewa di area resepsionis venue.</p>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="border-t border-border/80 pt-8">
          <h2 className="mb-6 font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-ink">
            Ulasan & Pengalaman Pemain
          </h2>
          <ReviewList reviews={venue.reviews} />
        </section>
      </main>

      <PlayerFooter />
      <MobileTabBar />
    </div>
  )
}
