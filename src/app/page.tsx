import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerHeader } from "@/components/shell/player-header"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { VenueCard } from "@/components/venue/venue-card"
import { VenueSearch } from "@/components/venue/venue-search"
import { getMarketplaceDiscovery, type MarketplaceFilters, type MarketplaceSort } from "@/lib/data/marketplace"
import { getOptionalShellPlayer } from "@/lib/data/player"

type SearchParams = Promise<Record<string, string | string[] | undefined>>
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const filters: MarketplaceFilters = {
    city: single(raw.city), date: single(raw.date), facility: single(raw.facility), q: single(raw.q),
    sort: single(raw.sort) as MarketplaceSort | undefined,
  }
  const [discovery, user] = await Promise.all([getMarketplaceDiscovery(filters), getOptionalShellPlayer()])
  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16">
      <PlayerHeader user={user ?? undefined} />
      <main className="safe-area-x mx-auto max-w-7xl space-y-8 py-8 sm:py-12">
        <PageHeader eyebrow="Marketplace venue terverifikasi" title="Temukan lapangan. Pilih waktu. Main." description="Ketersediaan dan harga dibaca langsung dari jadwal venue." />
        <VenueSearch cities={discovery.cities} facilities={discovery.facilities} filters={filters} />
        {discovery.venues.length ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Daftar venue">
            {discovery.venues.map((venue) => <VenueCard key={venue.id} venue={venue} date={filters.date} />)}
          </section>
        ) : <EmptyState title="Venue tidak ditemukan" description="Ubah lokasi, tanggal, atau fasilitas yang dipilih." />}
      </main>
      <MobileTabBar />
    </div>
  )
}
