import Link from "next/link"
import { Plus, CalendarDays, TrendingUp, ListOrdered } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export default function VenueOwnerDashboard() {
  return (
    <div className="space-y-6 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-display text-ink">Dashboard</h1>
          <p className="text-body text-ink-muted">Kelola venue kamu</p>
        </div>
        <Link href="/venue-owner/courts/new" className="btn-primary text-sm px-4 py-2 h-auto flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          Tambah
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 space-y-1">
            <CalendarDays className="w-5 h-5 text-brand" />
            <p className="text-h2 font-bold font-mono text-ink">4</p>
            <p className="text-caption text-ink-muted">Booking Hari Ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <TrendingUp className="w-5 h-5 text-success" />
            <p className="text-h2 font-bold font-mono text-ink">{formatCurrency(2800000)}</p>
            <p className="text-caption text-ink-muted">Pendapatan Bulan Ini</p>
          </CardContent>
        </Card>
      </div>

      {/* My Venues */}
      <div>
        <h2 className="text-h2 font-display text-ink mb-3">Venue Saya</h2>
        <div className="space-y-3">
          {[
            { name: "Padel House Kemang", status: "APPROVED", bookings: 12, revenue: 3200000 },
            { name: "Padel Studio Menteng", status: "PENDING", bookings: 0, revenue: 0 },
          ].map((venue) => (
            <Link
              key={venue.name}
              href="/venue-owner/venues/1"
              className="block bg-surface rounded-card shadow-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-body font-semibold text-ink">{venue.name}</h3>
                <Badge variant={venue.status === "APPROVED" ? "success" : "urgent"}>
                  {venue.status === "APPROVED" ? "Aktif" : "Menunggu Verifikasi"}
                </Badge>
              </div>
              <div className="flex gap-4 text-caption text-ink-muted">
                <span>{venue.bookings} booking</span>
                <span className="font-mono">{formatCurrency(venue.revenue)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/venue-owner/courts" className="bg-surface rounded-card shadow-card p-4 text-center space-y-1">
          <ListOrdered className="w-5 h-5 text-brand mx-auto" />
          <span className="text-caption text-ink">Lapangan</span>
        </Link>
        <Link href="/venue-owner/schedule" className="bg-surface rounded-card shadow-card p-4 text-center space-y-1">
          <CalendarDays className="w-5 h-5 text-brand mx-auto" />
          <span className="text-caption text-ink">Jadwal</span>
        </Link>
        <Link href="/venue-owner/reports" className="bg-surface rounded-card shadow-card p-4 text-center space-y-1">
          <TrendingUp className="w-5 h-5 text-brand mx-auto" />
          <span className="text-caption text-ink">Laporan</span>
        </Link>
      </div>
    </div>
  )
}
