import Link from "next/link"
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

const demoBookings = [
  {
    id: "b1",
    venueName: "Padel House Kemang",
    venueId: "1",
    courtName: "Lapangan 1",
    date: "2026-07-05",
    startTime: "18:00",
    endTime: "19:00",
    price: 250000,
    status: "CONFIRMED",
    orderId: "PK-JUL5-001",
  },
  {
    id: "b2",
    venueName: "Arena Padel BSD",
    venueId: "2",
    courtName: "Lapangan 2",
    date: "2026-07-08",
    startTime: "16:00",
    endTime: "17:00",
    price: 160000,
    status: "PENDING_PAYMENT",
    orderId: "PK-JUL8-002",
  },
  {
    id: "b3",
    venueName: "Canggu Padel Club",
    venueId: "3",
    courtName: "Lapangan 1",
    date: "2026-06-28",
    startTime: "10:00",
    endTime: "11:00",
    price: 240000,
    status: "COMPLETED",
    orderId: "PK-JUN28-003",
  },
]

const statusConfig = {
  CONFIRMED: { label: "Dikonfirmasi", variant: "success" as const },
  PENDING_PAYMENT: { label: "Menunggu Pembayaran", variant: "urgent" as const },
  COMPLETED: { label: "Selesai", variant: "brand" as const },
  CANCELLED: { label: "Dibatalkan", variant: "default" as const },
}

export default function BookingsPage() {
  return (
    <div className="space-y-4 pt-4">
      <h1 className="text-h1 font-display text-ink">Booking Saya</h1>

      {demoBookings.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 text-border mx-auto mb-4" />
          <h2 className="text-h2 font-display text-ink mb-2">Belum Ada Booking</h2>
          <p className="text-body text-ink-muted mb-6">
            Cari & booking lapangan pertamamu sekarang!
          </p>
          <Link href="/" className="btn-primary inline-block">
            Cari Venue
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {demoBookings.map((booking) => {
            const config = statusConfig[booking.status as keyof typeof statusConfig]
            return (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block bg-surface rounded-card shadow-card p-4 space-y-3 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-body font-semibold text-ink">
                    {booking.venueName}
                  </h3>
                  <Badge variant={config?.variant || "default"}>
                    {config?.label || booking.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-body text-ink-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.courtName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">
                      {booking.startTime} – {booking.endTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono font-bold text-body text-ink">
                    {formatCurrency(booking.price)}
                  </span>
                  <ArrowRight className="w-5 h-5 text-ink-muted" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
