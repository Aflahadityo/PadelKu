import Image from "next/image"
import { Clock3, ExternalLink, MapPin, Star } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { VenueDetail } from "@/lib/data/marketplace"

export function VenueHeader({ venue }: { venue: VenueDetail }) {
  const mapHref = venue.latitude !== null && venue.longitude !== null
    ? `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.address}, ${venue.city}`)}`

  return (
    <section>
      <div className="grid gap-1 overflow-hidden bg-border sm:rounded-panel lg:grid-cols-[1.65fr_0.85fr]">
        <div className="relative aspect-[16/10] bg-surface-muted lg:row-span-2 lg:aspect-auto lg:min-h-[34rem]">
          <Image src={venue.imageUrls[0]} alt={`Lapangan utama ${venue.name}`} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
        </div>
        {venue.imageUrls.slice(1, 3).map((image, index) => (
          <div key={image} className="relative hidden min-h-[16.9rem] bg-surface-muted lg:block">
            <Image src={image} alt={`Area ${index + 2} di ${venue.name}`} fill sizes="34vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="grid gap-7 border-b border-border py-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-10">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-brand">
            <span className="border border-brand/30 px-2.5 py-1">APPROVED</span>
            <span className="flex items-center gap-1.5 text-ink">
              <Star className="size-4 fill-warning text-warning" aria-hidden="true" />
              {venue.reviewCount > 0 ? `${venue.rating.toFixed(1)} dari ${venue.reviewCount} ulasan` : "Belum ada ulasan"}
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.8rem,7vw,6.5rem)] font-bold leading-[0.86] tracking-[-0.065em] text-ink">
            {venue.name}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink-muted">
            {venue.description ?? `Venue padel terverifikasi di ${venue.city}.`}
          </p>
        </div>
        <aside className="border-t border-ink pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-1">
          <p className="flex gap-2 text-sm leading-6 text-ink-muted"><MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />{venue.address}, {venue.city}, {venue.province}</p>
          <p className="mt-3 flex gap-2 text-sm text-ink-muted"><Clock3 className="size-4 shrink-0" aria-hidden="true" />{venue.openingTime.slice(0, 5)} - {venue.closingTime.slice(0, 5)}</p>
          <p className="mt-5 font-mono text-lg font-bold tabular-nums text-ink">Mulai {formatCurrency(venue.startingPriceRupiah)}<span className="font-body text-xs font-normal text-ink-muted"> / jam</span></p>
          <a href={mapHref} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand hover:text-brand-strong">
            Buka petunjuk arah <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  )
}
