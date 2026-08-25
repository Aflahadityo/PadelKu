import { Panel, SectionTitle } from "@/components/dashboard/panel"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Metric } from "@/components/ui/metric"
import { PageHeader } from "@/components/ui/page-header"
import { getOwnerOverview } from "@/lib/dashboard/owner-data"
import { formatCurrency } from "@/lib/utils"

export default async function VenueOwnerDashboard() {
  const data = await getOwnerOverview()
  return <main className="space-y-8"><PageHeader eyebrow="Venue workspace" title="Operasional venue" description="Pantau status venue, booking masuk, dan pembagian nilai pembayaran sandbox." />
    <section className="grid gap-6 border-b border-border pb-8 sm:grid-cols-3"><Metric label="Gross lunas" value={formatCurrency(data.grossSettledRupiah)} /><Metric label="Komisi platform" value={formatCurrency(data.platformFeeRupiah)} /><Metric label="Net venue" value={formatCurrency(data.venueNetRupiah)} /></section>
    <Panel><SectionTitle detail={`${data.venues.length} venue`}>Venue saya</SectionTitle><div className="divide-y divide-border">{data.venues.map((venue) => <article key={venue.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><h2 className="font-display text-xl font-bold">{venue.name}</h2><p className="mt-1 text-xs text-ink-muted">{venue.city} · {venue.activeCourts} lapangan aktif</p>{venue.rejectionReason ? <p className="mt-2 text-xs text-error">{venue.rejectionReason}</p> : null}</div><StatusBadge status={venue.status} /></article>)}</div>{!data.venues.length ? <p className="py-8 text-sm text-ink-muted">Belum ada venue.</p> : null}</Panel>
    <Panel><SectionTitle detail={`${data.bookings.length} terbaru`}>Booking masuk</SectionTitle><div className="divide-y divide-border">{data.bookings.map((booking) => <article key={booking.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-mono text-xs font-semibold">{booking.bookingCode}</p><p className="mt-1 text-sm font-semibold">{booking.venueName}</p></div><div className="flex gap-2"><StatusBadge status={booking.status} />{booking.paymentStatus ? <StatusBadge status={booking.paymentStatus} /> : null}</div><p className="font-mono font-semibold sm:text-right">{formatCurrency(booking.totalPriceRupiah)}</p></article>)}</div></Panel>
  </main>
}
