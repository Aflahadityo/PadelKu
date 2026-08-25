import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, ArrowRight, ShieldCheck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { VenueDiscoveryItem } from "@/lib/data/marketplace"

interface VenueCardProps {
  date?: string
  venue: VenueDiscoveryItem
}

export function VenueCard({ date, venue }: VenueCardProps) {
  const href = date ? `/venues/${venue.slug}?date=${encodeURIComponent(date)}` : `/venues/${venue.slug}`
  const isUrgent = venue.availableSlotCount > 0 && venue.availableSlotCount <= 3

  return (
    <article className="card-venue group relative flex flex-col overflow-hidden rounded-[1.25rem] border border-border/80 bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card">
      <Link href={href} className="flex h-full flex-col">
        {/* Photo container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
          <Image
            src={venue.imageUrl}
            alt={`Arena lapangan di ${venue.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-black/20" />

          {/* Top badges */}
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-ink/80 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide text-white backdrop-blur-md">
              <ShieldCheck className="size-3 text-brand" />
              <span>Verifikasi WPT</span>
            </span>

            {isUrgent ? (
              <span className="badge-coral shadow-xs">
                🔥 Sisa {venue.availableSlotCount} Slot
              </span>
            ) : venue.availableSlotCount > 0 ? (
              <span className="badge-optic shadow-xs">
                🟢 {venue.availableSlotCount} Slot Siap
              </span>
            ) : (
              <span className="rounded-full bg-ink/75 px-2.5 py-1 text-[0.6875rem] font-bold text-white backdrop-blur-md">
                Penuh Hari Ini
              </span>
            )}
          </div>

          {/* Bottom photo overlay info */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-white">
            <p className="flex items-center gap-1 text-xs font-semibold drop-shadow-sm">
              <MapPin className="size-3.5 text-brand" aria-hidden="true" />
              <span>{venue.city}</span>
            </p>
            <span className="flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 font-mono text-xs font-bold text-ink backdrop-blur-sm shadow-xs">
              <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              {venue.reviewCount > 0 ? venue.rating.toFixed(1) : "4.8"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[1.25rem] font-bold leading-tight tracking-tight text-ink transition-colors group-hover:text-brand">
              {venue.name}
            </h3>
          </div>

          {/* Facilities pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {venue.facilities.slice(0, 3).map((facility) => (
              <span
                key={facility}
                className="rounded-md border border-border/60 bg-surface-muted/70 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-muted"
              >
                {facility}
              </span>
            ))}
            {venue.facilities.length > 3 && (
              <span className="rounded-md border border-border/60 bg-surface-muted/70 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-ink-muted">
                +{venue.facilities.length - 3}
              </span>
            )}
          </div>

          {/* Pricing & CTA footer */}
          <div className="mt-auto flex items-end justify-between pt-5 border-t border-border/60">
            <div>
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">Mulai dari</span>
              <p className="font-mono text-base font-extrabold tabular-nums text-ink">
                {venue.minPriceRupiah > 0 ? formatCurrency(venue.minPriceRupiah) : "Rp150.000"}
                <span className="font-body text-xs font-normal text-ink-muted"> /jam</span>
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand group-hover:text-brand-strong">
              Pilih Jadwal
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

