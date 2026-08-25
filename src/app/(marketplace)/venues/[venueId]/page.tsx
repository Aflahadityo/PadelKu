import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
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
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke pencarian
        </Link>
        <VenueHeader venue={venue} />
        <section className="border-t border-border pt-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-brand">Pilih waktu main</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-ink">Jadwal lapangan</h2>
          <VenueCourtGrid venueId={venue.id} venueName={venue.name} />
        </section>
        <section className="py-8">
          <h2 className="mb-5 font-display text-3xl font-bold tracking-[-0.04em] text-ink">Ulasan pemain</h2>
          <ReviewList reviews={venue.reviews} />
        </section>
      </main>
      <MobileTabBar />
    </div>
  )
}
