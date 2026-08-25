import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Ticket,
} from "lucide-react"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { requireUser } from "@/lib/auth"
import { getPlayerBookings } from "@/lib/data/player"
import { formatCurrency } from "@/lib/utils"

export default async function BookingsPage() {
  const user = await requireUser()
  const bookings = await getPlayerBookings(user.id)

  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader user={{ email: user.email, name: user.fullName, role: "Player" }} />

      <main className="safe-area-x mx-auto max-w-5xl space-y-8 py-8">
        <PageHeader
          eyebrow="Reservasi Pemain"
          title="Booking Saya"
          description="Pantau status pembayaran, jadwal bermain, dan riwayat booking Anda."
        />

        {!bookings.length ? (
          <div className="rounded-3xl border border-border bg-surface p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
              <CalendarDays className="size-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-display text-xl font-bold text-ink">Belum Ada Riwayat Booking</h3>
              <p className="text-xs sm:text-sm text-ink-muted">
                Pilih venue favorit dan jadwal yang tersedia untuk mulai bermain padel bersama teman.
              </p>
            </div>
            <Link
              href="/#venue-list"
              className="btn-cta inline-flex items-center gap-2 px-6 py-3 font-display text-xs font-bold text-ink shadow-md"
            >
              <span>Cari & Booking Lapangan</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const first = booking.items[0]

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-3xl border border-border/90 bg-surface shadow-card transition-all duration-200 hover:border-brand/40"
                >
                  {/* Ticket Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-surface-muted/60 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Ticket className="size-4 text-brand" />
                      <span className="font-mono text-xs font-bold text-ink">
                        KODE: {booking.bookingCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={booking.status} />
                      {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} />}
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] items-center">
                    <div className="space-y-3">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-ink">
                          {booking.venueName}
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                          <MapPin className="size-3.5 text-brand" />
                          <span>{booking.venueCity}</span>
                          <span>·</span>
                          <span className="font-semibold text-ink">
                            {first?.courtName ?? "Lapangan Utama"}
                          </span>
                        </p>
                      </div>

                      {first && (
                        <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2 text-xs shadow-2xs">
                          <div className="flex items-center gap-1.5 font-semibold text-ink">
                            <Clock className="size-3.5 text-brand" />
                            <span className="font-mono">
                              {new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "full",
                                timeStyle: "short",
                              }).format(new Date(first.startsAt))}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 border-t sm:border-t-0 sm:border-l border-border/80 pt-4 sm:pt-0 sm:pl-6">
                      <div className="text-left sm:text-right">
                        <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                          Total Pembayaran
                        </span>
                        <p className="font-mono text-xl font-black text-ink">
                          {formatCurrency(booking.totalPriceRupiah)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-surface-muted/30 px-6 py-3.5 text-xs">
                    <Link
                      href={`/venues/${booking.venueSlug}`}
                      className="inline-flex items-center gap-1 font-bold text-brand hover:underline"
                    >
                      <span>Buka Halaman Venue</span>
                      <ExternalLink className="size-3" />
                    </Link>

                    <Link
                      href={`/bookings/${booking.id}`}
                      className="btn-secondary inline-flex min-h-9 items-center gap-1.5 px-3 text-[0.6875rem] font-bold"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <PlayerFooter />
      <MobileTabBar />
    </div>
  )
}
