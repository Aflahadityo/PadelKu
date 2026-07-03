"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VenueSearchProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: FilterOptions) => void
  className?: string
}

export interface FilterOptions {
  city?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: "price_asc" | "price_desc" | "rating" | "popular"
}

const cities = [
  "Jakarta Selatan",
  "Jakarta Utara",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Pusat",
  "Bandung",
  "Surabaya",
  "Bali",
  "Tangerang",
  "BSD",
  "Bekasi",
]

export function VenueSearch({ onSearch, onFilterChange, className }: VenueSearchProps) {
  const [query, setQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const updateFilter = (key: keyof FilterOptions, value: string | number | undefined) => {
    const next = { ...filters, [key]: value || undefined }
    setFilters(next)
    onFilterChange(next)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
          <input
            type="search"
            placeholder="Cari venue atau kota..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className={cn(
              "w-full h-11 pl-10 pr-4 rounded-[12px] border border-border bg-surface text-body text-ink",
              "placeholder:text-ink-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:border-brand"
            )}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "h-11 w-11 flex items-center justify-center rounded-[12px] border border-border transition-colors",
            showFilters ? "bg-brand/10 border-brand text-brand" : "bg-surface text-ink-muted"
          )}
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-surface rounded-card shadow-card p-4 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-semibold text-ink">Filter</h3>
            <button
              onClick={() => {
                setFilters({})
                onFilterChange({})
              }}
              className="text-caption text-brand"
            >
              Reset
            </button>
          </div>

          {/* City filter */}
          <div>
            <label className="text-caption text-ink-muted mb-2 block">Kota</label>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => updateFilter("city", filters.city === city ? "" : city)}
                  className={cn(
                    "px-3 py-1.5 rounded-[12px] text-caption border transition-colors",
                    filters.city === city
                      ? "bg-brand/10 border-brand text-brand"
                      : "border-border text-ink-muted hover:border-ink-muted"
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-caption text-ink-muted mb-2 block">Urutkan</label>
            <select
              value={filters.sortBy || ""}
              onChange={(e) => updateFilter("sortBy", e.target.value as any)}
              className="w-full h-11 rounded-[12px] border border-border bg-surface px-3 text-body text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              <option value="">Rekomendasi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
