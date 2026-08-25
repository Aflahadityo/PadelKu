import Image from "next/image"
import {
  Clock3,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { VenueDetail } from "@/lib/data/marketplace"

export function VenueHeader({ venue }: { venue: VenueDetail }) {
  const mapHref =
    venue.latitude !== null && venue.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${venue.address}, ${venue.city}`,
        )}`

  return (
    <section className="space-y-6">
      {/* Photo Gallery Grid */}
      <div className="grid gap-2 overflow-hidden rounded-3xl bg-surface-muted lg:grid-cols-12 lg:h-[28rem]">
        {/* Main Photo (8 Cols) */}
        <div className="relative aspect-[16/10] w-full lg:col-span-8 lg:aspect-auto lg:h-full overflow-hidden group">
          <Image
            src={venue.imageUrls[0]}
            alt={`Lapangan utama ${venue.name}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/80 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <ShieldCheck className="size-3.5 text-brand" />
              <span>Verifikasi Standar WPT</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/80 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <Sparkles className="size-3.5 text-booking" />
              <span>{venue.courts.length} Lapangan Aktif</span>
            </span>
          </div>
        </div>

        {/* Secondary Photos (4 Cols) */}
        <div className="hidden lg:col-span-4 lg:grid lg:grid-rows-2 lg:gap-2">
          {venue.imageUrls.slice(1, 3).map((image, index) => (
            <div key={image} className="relative h-full overflow-hidden group">
              <Image
                src={image}
                alt={`Area ${index + 2} di ${venue.name}`}
                fill
                sizes="34vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
          {venue.imageUrls.length <= 1 && (
            <div className="relative h-full overflow-hidden group bg-surface-muted">
              <Image
                src={venue.imageUrls[0]}
                alt={`Area 2 di ${venue.name}`}
                fill
                sizes="34vw"
                className="object-cover opacity-80"
              />
            </div>
          )}
        </div>
      </div>

      {/* Info & Details Section */}
      <div className="grid gap-8 border-b border-border/80 pb-8 lg:grid-cols-12 lg:items-start">
        {/* Left: Venue info (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
              <ShieldCheck className="size-3.5" />
              <span>MITRA RESMI TERVERIFIKASI</span>
            </span>

            <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs font-bold text-ink shadow-2xs">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>
                {venue.reviewCount > 0
                  ? `${venue.rating.toFixed(1)} (${venue.reviewCount} ulasan pemain)`
                  : "4.8 (Belum ada ulasan)"}
              </span>
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-[-0.035em] text-ink">
            {venue.name}
          </h1>

          <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-ink-muted">
            {venue.description ??
              `Venue arena padel berstandar internasional di ${venue.city}. Dilengkapi fasilitas lengkap, rumput sintetis premium, dan pencahayaan kompetisi.`}
          </p>

          {/* Facility Pills */}
          <div className="space-y-2 pt-2">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
              Fasilitas Venue:
            </span>
            <div className="flex flex-wrap gap-2">
              {venue.facilities.map((facility) => (
                <span
                  key={facility}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs"
                >
                  <span className="size-1.5 rounded-full bg-brand" />
                  {facility}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Operational Card (4 Cols) */}
        <aside className="rounded-3xl border border-border/90 bg-surface p-6 shadow-card space-y-4 lg:col-span-4">
          <div>
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
              Harga Lapangan
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-ink">
                {formatCurrency(venue.startingPriceRupiah)}
              </span>
              <span className="text-xs text-ink-muted font-medium">/ jam</span>
            </div>
          </div>

          <div className="space-y-3 border-y border-border/80 py-4 text-xs">
            <div className="flex items-start gap-2.5 text-ink">
              <MapPin className="size-4 text-brand shrink-0 mt-0.5" />
              <span>
                {venue.address}, {venue.city}, {venue.province}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-ink">
              <Clock3 className="size-4 text-brand shrink-0" />
              <span className="font-mono font-semibold">
                {venue.openingTime.slice(0, 5)} – {venue.closingTime.slice(0, 5)} WIB
              </span>
            </div>

            {venue.phone && (
              <div className="flex items-center gap-2.5 text-ink">
                <Phone className="size-4 text-brand shrink-0" />
                <span className="font-mono">{venue.phone}</span>
              </div>
            )}
          </div>

          <a
            href={mapHref}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary w-full inline-flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl shadow-xs hover:border-brand/40"
          >
            <span>Petunjuk Arah Google Maps</span>
            <ExternalLink className="size-3.5" />
          </a>
        </aside>
      </div>
    </section>
  )
}
