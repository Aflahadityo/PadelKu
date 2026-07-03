import { VenueHeader } from "@/components/venue/venue-header"
import { VenueCourtGrid } from "@/components/venue/venue-court-grid"

const demoVenue = {
  id: "1",
  name: "Padel House Kemang",
  photos: [
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80",
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&q=80",
    "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=1200&q=80",
  ],
  city: "Jakarta Selatan",
  address: "Jl. Kemang Raya No. 42",
  rating: 4.5,
  reviewCount: 28,
  facilities: ["Indoor", "Parkir", "Kantin", "AC", "Mushola"],
  openingTime: "08:00",
  closingTime: "22:00",
  phone: "021-2278-9012",
  description: "Venue padel indoor premium di jantung Kemang. Dilengkapi 4 lapangan berstandar internasional, cafe, dan pro shop. Cocok untuk main santai maupun latihan rutin.",
  startingPrice: 150000,
  courts: [
    { id: "c1", name: "Lapangan 1", courtNumber: 1, pricePerHour: 250000, isActive: true },
    { id: "c2", name: "Lapangan 2", courtNumber: 2, pricePerHour: 200000, isActive: true },
    { id: "c3", name: "Lapangan 3", courtNumber: 3, pricePerHour: 180000, isActive: true },
    { id: "c4", name: "Lapangan 4", courtNumber: 4, pricePerHour: 150000, isActive: false },
  ],
}

export default function VenueDetailPage() {
  return (
    <div className="space-y-4 pt-4 pb-8">
      <VenueHeader {...demoVenue} />

      <div className="pt-4">
        <h2 className="text-h2 font-display text-ink mb-4 px-1">Pilih Jadwal</h2>
        <VenueCourtGrid venueId={demoVenue.id} courts={demoVenue.courts} />
      </div>

      {/* Reviews section placeholder */}
      <div className="pt-4 px-1">
        <h2 className="text-h2 font-display text-ink mb-4">Ulasan</h2>
        <p className="text-body text-ink-muted">Fitur review akan tersedia setelah booking.</p>
      </div>
    </div>
  )
}
