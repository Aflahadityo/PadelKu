import { Search, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { MarketplaceFilters, MarketplaceSort } from "@/lib/data/marketplace"

interface VenueSearchProps {
  cities: string[]
  facilities: string[]
  filters: MarketplaceFilters
}

const sortOptions: Array<{ label: string; value: MarketplaceSort }> = [
  { label: "Rekomendasi", value: "recommended" },
  { label: "Rating tertinggi", value: "rating" },
  { label: "Harga terendah", value: "price_asc" },
  { label: "Harga tertinggi", value: "price_desc" },
  { label: "Nama A-Z", value: "name" },
]

export function VenueSearch({ cities, facilities, filters }: VenueSearchProps) {
  const hasFilters = Boolean(filters.q || filters.city || filters.date || filters.facility || (filters.sort && filters.sort !== "recommended"))
  return (
    <form action="/" method="get" className="border-y border-border bg-surface/80 py-4 backdrop-blur sm:rounded-card sm:border sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1.5fr)_repeat(4,minmax(8rem,0.75fr))_auto]">
        <label className="relative block">
          <span className="sr-only">Cari venue atau lokasi</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Nama venue atau lokasi"
            className="h-11 w-full rounded-control border border-border-strong bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-ink-muted"
          />
        </label>
        <label>
          <span className="sr-only">Kota</span>
          <select name="city" defaultValue={filters.city ?? ""} className="h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-ink">
            <option value="">Semua kota</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Tanggal bermain</span>
          <input name="date" type="date" defaultValue={filters.date} className="h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-ink" />
        </label>
        <label>
          <span className="sr-only">Fasilitas</span>
          <select name="facility" defaultValue={filters.facility ?? ""} className="h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-ink">
            <option value="">Semua fasilitas</option>
            {facilities.map((facility) => <option key={facility} value={facility}>{facility}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Urutkan venue</span>
          <select name="sort" defaultValue={filters.sort ?? "recommended"} className="h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-ink">
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <Button type="submit" className="px-4">
          <SlidersHorizontal aria-hidden="true" />
          Terapkan
        </Button>
      </div>
      {hasFilters ? (
        <Link href="/" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-strong">
          <X className="size-3.5" aria-hidden="true" />
          Hapus semua filter
        </Link>
      ) : null}
    </form>
  )
}
