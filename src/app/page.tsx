import { HeroSection } from "@/components/home/hero-section"
import { OpenMatchSection } from "@/components/home/open-match-section"
import { FeaturesBento } from "@/components/home/features-bento"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { EmptyState } from "@/components/ui/empty-state"
import { VenueCard } from "@/components/venue/venue-card"
import { VenueSearch } from "@/components/venue/venue-search"
import { getMarketplaceDiscovery, type MarketplaceFilters, type MarketplaceSort } from "@/lib/data/marketplace"
import { getOptionalShellPlayer } from "@/lib/data/player"
import { Building2 } from "lucide-react"

type SearchParams = Promise<Record<string, string | string[] | undefined>>
const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const filters: MarketplaceFilters = {
    city: single(raw.city),
    date: single(raw.date),
    facility: single(raw.facility),
    q: single(raw.q),
    sort: single(raw.sort) as MarketplaceSort | undefined,
  }

  const [discovery, user] = await Promise.all([
    getMarketplaceDiscovery(filters),
    getOptionalShellPlayer(),
  ])

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      {/* Sticky Topbar Navigation */}
      <PlayerHeader user={user ?? undefined} />

      <main className="space-y-4">
        {/* Hero Section with Live Court Demo & City Chips */}
        <HeroSection totalVenues={discovery.venues.length} selectedCity={filters.city} />

        {/* Marketplace Discovery Section */}
        <section id="venue-list" className="scroll-mt-20 safe-area-x mx-auto max-w-7xl space-y-8 py-8">
          {/* Section Heading */}
          <div className="flex flex-col items-start justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-surface px-3 py-0.5 text-xs font-bold text-brand shadow-2xs">
                <Building2 className="size-3.5" />
                <span>Arena Padel Terverifikasi</span>
              </div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Temukan Arena & Lapangan
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted">
                Jadwal dan ketersediaan slot dibaca langsung secara real-time dari venue.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
              <span className="font-mono font-bold text-ink">{discovery.venues.length}</span> Venue Ditemukan
            </div>
          </div>

          {/* Search & Filter Bar */}
          <VenueSearch
            cities={discovery.cities}
            facilities={discovery.facilities}
            filters={filters}
          />

          {/* Venue Grid */}
          {discovery.venues.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Daftar venue">
              {discovery.venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} date={filters.date} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Venue tidak ditemukan"
              description="Coba ubah kata kunci pencarian, kota, tanggal, atau fasilitas yang Anda pilih."
            />
          )}
        </section>

        {/* Community Open Match Section */}
        <OpenMatchSection />

        {/* Platform Advantages Bento Grid */}
        <FeaturesBento />
      </main>

      {/* Global Footer */}
      <PlayerFooter />

      {/* Mobile Tab Bar */}
      <MobileTabBar userRole={user?.role} />
    </div>
  )
}
