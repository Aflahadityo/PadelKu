import { MapPin, TrendingUp, Wallet } from "lucide-react"
import { Panel, SectionTitle } from "@/components/dashboard/panel"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { getOwnerOverview } from "@/lib/dashboard/owner-data"
import { formatCurrency } from "@/lib/utils"

export default async function VenueOwnerDashboard() {
  const data = await getOwnerOverview()

  return (
    <main className="space-y-8">
      {/* Page Header */}
      <PageHeader
        eyebrow="Portal Pengelola Venue"
        title="Operasional & Pendapatan Venue"
        description="Pantau performa reservasi lapangan, ringkasan bagi hasil pembayaran lunas, dan jadwal pemain yang masuk."
      />

      {/* Financial Split HUD Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Gross Pembayaran Lunas</span>
            <Wallet className="size-4 text-brand" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-ink">
            {formatCurrency(data.grossSettledRupiah)}
          </p>
          <p className="text-[0.6875rem] text-ink-muted">Total nilai reservasi yang sudah diselesaikan</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Komisi Platform (5%)</span>
            <span className="font-mono text-[0.625rem] font-bold text-ink-muted bg-surface-muted px-2 py-0.5 rounded-full">
              SLA 99.9%
            </span>
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-ink-muted">
            {formatCurrency(data.platformFeeRupiah)}
          </p>
          <p className="text-[0.6875rem] text-ink-muted">Biaya pemeliharaan sistem & payment gateway</p>
        </div>

        <div className="rounded-2xl border-2 border-brand bg-brand/5 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-brand">
            <span>Net Payout Bersih Venue</span>
            <TrendingUp className="size-4 text-brand" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-brand">
            {formatCurrency(data.venueNetRupiah)}
          </p>
          <p className="text-[0.6875rem] text-ink-muted">Dana bersih siap ditarik ke rekening terdaftar</p>
        </div>
      </section>

      {/* My Venues Section */}
      <Panel className="p-0 sm:p-0 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border/80 bg-surface-muted/30">
          <SectionTitle detail={`${data.venues.length} venue terdaftar`}>
            Daftar Venue Saya
          </SectionTitle>
          <p className="text-xs text-ink-muted">Status listing dan ketersediaan lapangan di marketplace</p>
        </div>

        <div className="divide-y divide-border/80">
          {data.venues.map((venue) => (
            <article
              key={venue.id}
              className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 hover:bg-surface-muted/20 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-ink">{venue.name}</h2>
                  <StatusBadge status={venue.status} />
                </div>
                <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <MapPin className="size-3.5 text-brand" />
                  <span>{venue.city}</span>
                  <span>·</span>
                  <span className="font-semibold text-ink">{venue.activeCourts} lapangan aktif</span>
                </p>
                {venue.rejectionReason && (
                  <p className="mt-2 text-xs font-semibold text-error">
                    Catatan admin: &ldquo;{venue.rejectionReason}&rdquo;
                  </p>
                )}
              </div>
            </article>
          ))}

          {!data.venues.length && (
            <p className="py-8 text-center text-xs text-ink-muted">
              Belum ada venue yang terdaftar di akun ini.
            </p>
          )}
        </div>
      </Panel>

      {/* Incoming Bookings Section */}
      <Panel className="p-0 sm:p-0 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border/80 bg-surface-muted/30">
          <SectionTitle detail={`${data.bookings.length} booking masuk`}>
            Jadwal Booking Masuk
          </SectionTitle>
          <p className="text-xs text-ink-muted">Reservasi real-time dari pemain PadelKu</p>
        </div>

        <div className="divide-y divide-border/80">
          {data.bookings.map((booking) => (
            <article
              key={booking.id}
              className="grid gap-3 p-5 sm:p-6 sm:grid-cols-[1fr_auto_auto] sm:items-center hover:bg-surface-muted/20 transition-colors"
            >
              <div>
                <span className="font-mono text-xs font-bold text-ink">
                  {booking.bookingCode}
                </span>
                <p className="mt-0.5 font-display text-sm font-bold text-ink">
                  {booking.venueName}
                </p>
              </div>

              <div className="flex gap-2">
                <StatusBadge status={booking.status} />
                {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} />}
              </div>

              <p className="font-mono text-base font-extrabold sm:text-right text-ink">
                {formatCurrency(booking.totalPriceRupiah)}
              </p>
            </article>
          ))}

          {!data.bookings.length && (
            <p className="py-8 text-center text-xs text-ink-muted">
              Belum ada booking masuk untuk jadwal hari ini.
            </p>
          )}
        </div>
      </Panel>
    </main>
  )
}
