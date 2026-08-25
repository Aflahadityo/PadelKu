import { Calendar, Filter, MapPin, Search, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { MarketplaceFilters, MarketplaceSort } from "@/lib/data/marketplace"

interface VenueSearchProps {
  cities: string[]
  facilities: string[]
  filters: MarketplaceFilters
}

const sortOptions: Array<{ label: string; value: MarketplaceSort }> = [
  { label: "Rekomendasi Terbaik", value: "recommended" },
  { label: "Rating Tertinggi", value: "rating" },
  { label: "Harga Terendah", value: "price_asc" },
  { label: "Harga Tertinggi", value: "price_desc" },
  { label: "Nama A-Z", value: "name" },
]

export function VenueSearch({ cities, facilities, filters }: VenueSearchProps) {
  const hasFilters = Boolean(
    filters.q ||
      filters.city ||
      filters.date ||
      filters.facility ||
      (filters.sort && filters.sort !== "recommended"),
  )

  return (
    <div id="venue-search-box" className="space-y-3">
      <form
        action="/#venue-list"
        method="get"
        className="rounded-3xl border border-border/90 bg-surface/95 p-4 shadow-card backdrop-blur-md sm:p-5"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1.4fr)_repeat(3,minmax(8.5rem,0.85fr))_minmax(10rem,1fr)_auto]">
          {/* Keyword Search */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="Cari arena, nama klub, atau jalan..."
              className="h-11 w-full rounded-xl border border-border-strong/80 bg-surface pl-10 pr-3 text-xs sm:text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            />
          </div>

          {/* City Selector */}
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <select
              name="city"
              defaultValue={filters.city ?? ""}
              className="h-11 w-full rounded-xl border border-border-strong/80 bg-surface pl-10 pr-3 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            >
              <option value="">Semua Kota</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              name="date"
              type="date"
              defaultValue={filters.date}
              className="h-11 w-full rounded-xl border border-border-strong/80 bg-surface pl-10 pr-3 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            />
          </div>

          {/* Facility Filter */}
          <div className="relative">
            <Filter
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <select
              name="facility"
              defaultValue={filters.facility ?? ""}
              className="h-11 w-full rounded-xl border border-border-strong/80 bg-surface pl-10 pr-3 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            >
              <option value="">Semua Fasilitas</option>
              {facilities.map((facility) => (
                <option key={facility} value={facility}>
                  {facility}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              name="sort"
              defaultValue={filters.sort ?? "recommended"}
              className="h-11 w-full rounded-xl border border-border-strong/80 bg-surface px-3 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="btn-cta text-xs font-bold px-5 h-11 shadow-xs">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span>Terapkan</span>
          </Button>
        </div>

        {/* Active Filters bar */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
              <span className="font-semibold text-ink">Filter aktif:</span>
              {filters.city && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 font-medium text-brand">
                  Kota: {filters.city}
                </span>
              )}
              {filters.date && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 font-medium text-brand">
                  Tanggal: {filters.date}
                </span>
              )}
              {filters.facility && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 font-medium text-brand">
                  Fasilitas: {filters.facility}
                </span>
              )}
              {filters.q && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 font-medium text-brand">
                  Kata Kunci: &ldquo;{filters.q}&rdquo;
                </span>
              )}
            </div>

            <Link
              href="/#venue-list"
              className="inline-flex items-center gap-1 text-xs font-bold text-error hover:underline"
            >
              <X className="size-3.5" aria-hidden="true" />
              <span>Reset Filter</span>
            </Link>
          </div>
        )}
      </form>
    </div>
  )
}
