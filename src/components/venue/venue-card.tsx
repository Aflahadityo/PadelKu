import Link from "next/link"
import { Star, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface VenueCardProps {
  id: string
  name: string
  slug: string
  city: string
  photoUrl: string
  priceRange: { min: number; max: number }
  rating: number
  reviewCount: number
  facilities: string[]
  isVerified: boolean
  availableToday: boolean
  slotsLeftToday?: number
}

export function VenueCard({
  id,
  name,
  slug,
  city,
  photoUrl,
  priceRange,
  rating,
  reviewCount,
  facilities,
  isVerified,
  availableToday,
  slotsLeftToday,
}: VenueCardProps) {
  return (
    <Link href={`/venues/${id}`} className="block">
      <article className="card-venue card-venue-sidebar group active:scale-[0.99] transition-transform">
        {/* Photo with 16:9 aspect ratio */}
        <div className="relative aspect-video bg-border/30 overflow-hidden">
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Verified badge */}
          {isVerified && (
            <div className="absolute top-3 left-3">
              <Badge variant="brand">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Terverifikasi
              </Badge>
            </div>
          )}
          {/* Urgency badge */}
          {slotsLeftToday !== undefined && slotsLeftToday > 0 && slotsLeftToday <= 3 && (
            <div className="absolute top-3 right-3">
              <Badge variant="urgent">
                Sisa {slotsLeftToday} slot
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-h2 text-ink line-clamp-1">{name}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-[#F4B740] fill-[#F4B740]" />
              <span className="text-body font-medium text-ink">{rating.toFixed(1)}</span>
              <span className="text-caption text-ink-muted">({reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-ink-muted text-body">
            <MapPin className="w-4 h-4" />
            <span>{city}</span>
          </div>

          {/* Price */}
          <div className="font-mono text-body font-semibold text-ink tabular-nums">
            {formatCurrency(priceRange.min)}
            {priceRange.max > priceRange.min && ` – ${formatCurrency(priceRange.max)}`}
            <span className="font-body font-normal text-ink-muted"> /jam</span>
          </div>

          {/* Facilities */}
          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {facilities.slice(0, 3).map((f) => (
                <span
                  key={f}
                  className="text-caption bg-border/30 text-ink-muted px-2.5 py-1 rounded-[12px]"
                >
                  {f}
                </span>
              ))}
              {facilities.length > 3 && (
                <span className="text-caption text-ink-muted">
                  +{facilities.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Availability */}
          {availableToday && (
            <p className="text-caption text-success font-medium">
              Tersedia hari ini
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
