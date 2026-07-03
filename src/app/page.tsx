import Link from "next/link"
import { Search } from "lucide-react"
import { VenueCard } from "@/components/venue/venue-card"
import { VenueSearch } from "@/components/venue/venue-search"

// Placeholder data for static demo
const demoVenues = [
  {
    id: "1", name: "Padel House Kemang", slug: "padel-house-kemang", city: "Jakarta Selatan",
    photoUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
    priceRange: { min: 150000, max: 250000 }, rating: 4.5, reviewCount: 28,
    facilities: ["Indoor", "Parkir", "Kantin"], isVerified: true, availableToday: true, slotsLeftToday: 3,
  },
  {
    id: "2", name: "Arena Padel BSD", slug: "arena-padel-bsd", city: "BSD",
    photoUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
    priceRange: { min: 120000, max: 200000 }, rating: 4.2, reviewCount: 15,
    facilities: ["Outdoor", "Parkir"], isVerified: true, availableToday: true,
  },
  {
    id: "3", name: "Canggu Padel Club", slug: "canggu-padel-club", city: "Bali",
    photoUrl: "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80",
    priceRange: { min: 180000, max: 300000 }, rating: 4.8, reviewCount: 42,
    facilities: ["Indoor", "Outdoor", "Parkir", "Kantin", "Pro Shop"], isVerified: true, availableToday: true, slotsLeftToday: 2,
  },
  {
    id: "4", name: "Padel Studio Bandung", slug: "padel-studio-bandung", city: "Bandung",
    photoUrl: "https://images.unsplash.com/photo-1593078165899-8e00959c7a24?w=800&q=80",
    priceRange: { min: 130000, max: 180000 }, rating: 4.0, reviewCount: 9,
    facilities: ["Indoor", "Parkir", "AC"], isVerified: false, availableToday: false,
  },
  {
    id: "5", name: "Surabaya Padel Center", slug: "surabaya-padel-center", city: "Surabaya",
    photoUrl: "https://images.unsplash.com/photo-1560090995-01632a28895b?w=800&q=80",
    priceRange: { min: 120000, max: 160000 }, rating: 4.3, reviewCount: 21,
    facilities: ["Outdoor", "Parkir", "Mushola"], isVerified: true, availableToday: true,
  },
  {
    id: "6", name: "Padel Sportivo Senayan", slug: "padel-sportivo-senayan", city: "Jakarta Pusat",
    photoUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&q=80",
    priceRange: { min: 200000, max: 350000 }, rating: 4.6, reviewCount: 35,
    facilities: ["Indoor", "Parkir", "Kantin", "AC", "Pro Shop"], isVerified: true, availableToday: true, slotsLeftToday: 1,
  },
]

export default function HomePage() {
  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-display text-ink">
            Cari Lapangan
          </h1>
          <p className="text-body text-ink-muted">Temukan venue padel terdekat</p>
        </div>
        <Link
          href="/login"
          className="btn-secondary text-caption px-4 py-2 h-auto"
        >
          Masuk
        </Link>
      </div>

      {/* Search */}
      <VenueSearch
        onSearch={() => {}}
        onFilterChange={() => {}}
      />

      {/* Venue grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoVenues.map((venue) => (
          <VenueCard key={venue.id} {...venue} />
        ))}
      </div>
    </div>
  )
}
