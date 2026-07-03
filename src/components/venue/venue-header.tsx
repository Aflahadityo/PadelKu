"use client"

import { useState } from "react"
import { MapPin, Star, Clock, ChevronLeft, ChevronRight, Phone, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface VenueHeaderProps {
  name: string
  photos: string[]
  city: string
  address: string
  rating: number
  reviewCount: number
  facilities: string[]
  openingTime: string
  closingTime: string
  phone?: string
  description?: string
  startingPrice: number
}

export function VenueHeader({
  name,
  photos,
  city,
  address,
  rating,
  reviewCount,
  facilities,
  openingTime,
  closingTime,
  phone,
  description,
  startingPrice,
}: VenueHeaderProps) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const displayPhotos = photos.length > 0 ? photos : ["/placeholder-venue.svg"]

  return (
    <div className="space-y-4">
      {/* Photo gallery */}
      <div className="relative aspect-video bg-border/30 rounded-card overflow-hidden">
        <img
          src={displayPhotos[photoIdx]}
          alt={`${name} - foto ${photoIdx + 1}`}
          className="w-full h-full object-cover"
        />
        {displayPhotos.length > 1 && (
          <>
            <button
              onClick={() => setPhotoIdx((p) => (p > 0 ? p - 1 : displayPhotos.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-surface/80 rounded-full flex items-center justify-center shadow"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 text-ink" />
            </button>
            <button
              onClick={() => setPhotoIdx((p) => (p < displayPhotos.length - 1 ? p + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-surface/80 rounded-full flex items-center justify-center shadow"
              aria-label="Foto berikutnya"
            >
              <ChevronRight className="w-5 h-5 text-ink" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {displayPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === photoIdx ? "bg-surface" : "bg-surface/50"
                  }`}
                  aria-label={`Ke foto ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Venue info */}
      <div className="space-y-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-display-detail font-display text-ink">{name}</h1>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-5 h-5 text-[#F4B740] fill-[#F4B740]" />
            <span className="text-body font-semibold text-ink">{rating.toFixed(1)}</span>
            <span className="text-caption text-ink-muted">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-body text-ink-muted">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{address}, {city}</span>
        </div>

        <div className="flex items-center gap-4 text-body text-ink-muted">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{openingTime} – {closingTime}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{phone}</span>
            </div>
          )}
        </div>

        <div className="font-mono text-h2 font-bold text-ink tabular-nums">
          Mulai {formatCurrency(startingPrice)} <span className="font-body font-normal text-ink-muted text-body">/jam</span>
        </div>

        {/* Facilities */}
        <div className="flex flex-wrap gap-2">
          {facilities.map((f) => (
            <Badge key={f} variant="default">{f}</Badge>
          ))}
        </div>

        {description && (
          <p className="text-body text-ink-muted leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  )
}
