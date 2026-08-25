import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  ReceiptText,
  Star,
  Ticket,
} from "lucide-react"
import { BookingDetailActions } from "@/components/booking/booking-detail-actions"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { requireUser } from "@/lib/auth"
import { getPlayerBooking } from "@/lib/data/player"
import { formatCurrency } from "@/lib/utils"

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full",
  timeStyle: "short",
})

const shortDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

const paymentMethodLabels: Record<string, string> = {
  EWALLET: "E-Wallet",
  QRIS: "QRIS",
  VA: "Virtual Account",
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const booking = await getPlayerBooking(user.id, id)
  if (!booking) notFound()

  return (
    <div className="min-h-dvh bg-canvas pb-24 text-ink md:pb-16">
      <PlayerHeader user={{ email: user.email, name: user.fullName, role: "Player" }} />

      <main className="safe-area-x mx-auto max-w-5xl space-y-6 py-8">
        <Link
          href="/bookings"
          className="inline-flex min-h-11 items-center gap-2 rounded-control text-sm font-semibold text-ink-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Booking Saya
        </Link>

        <section className="overflow-hidden rounded-3xl border border-border/90 bg-surface shadow-card">
          <div className="flex flex-col gap-5 border-b border-border/80 bg-surface-muted/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-brand">
                <Ticket className="size-4" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">Detail Booking</span>
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
                {booking.bookingCode}
              </h1>
              <p className="text-sm text-ink-muted">
                Dibuat {shortDateTimeFormatter.format(new Date(booking.createdAt))}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <StatusBadge status={booking.status} />
              {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} />}
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-8 p-6 sm:p-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-brand" />
                  <h2 className="font-display text-lg font-bold text-ink">Venue</h2>
                </div>
                <div className="rounded-2xl border border-border bg-surface-muted/35 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-display text-xl font-bold text-ink">{booking.venueName}</p>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-ink-muted">
                        {booking.venueAddress}, {booking.venueCity}
                      </p>
                    </div>
                    <Link
                      href={`/venues/${booking.venueSlug}`}
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border border-border-strong bg-surface px-4 text-xs font-bold text-brand transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      Lihat Venue
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-brand" />
                  <h2 className="font-display text-lg font-bold text-ink">Jadwal Bermain</h2>
                </div>
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                  {booking.items.map((item) => (
                    <div key={item.id} className="grid gap-3 bg-surface px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="font-display text-base font-bold text-ink">{item.courtName}</p>
                        {item.courtNumber > 0 && (
                          <p className="mt-0.5 text-xs text-ink-muted">Lapangan #{item.courtNumber}</p>
                        )}
                      </div>
                      <div className="space-y-1 text-sm sm:text-right">
                        <p className="flex items-center gap-2 font-semibold text-ink sm:justify-end">
                          <Clock className="size-3.5 text-brand" />
                          {dateTimeFormatter.format(new Date(item.startsAt))}
                        </p>
                        <p className="text-xs text-ink-muted">
                          Selesai {shortDateTimeFormatter.format(new Date(item.endsAt))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {booking.review && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-brand" />
                    <h2 className="font-display text-lg font-bold text-ink">Ulasan Anda</h2>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface-muted/35 p-5">
                    <div className="flex gap-1" aria-label={`${booking.review.rating} dari 5 bintang`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`size-4 ${
                            index < booking.review!.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-border-strong"
                          }`}
                        />
                      ))}
                    </div>
                    {booking.review.comment && (
                      <p className="mt-3 text-sm leading-6 text-ink-muted">&ldquo;{booking.review.comment}&rdquo;</p>
                    )}
                  </div>
                </section>
              )}

              {booking.cancellationReason && (
                <section className="rounded-2xl border border-error/25 bg-error/5 p-5">
                  <h2 className="font-display text-base font-bold text-error">Alasan pembatalan</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{booking.cancellationReason}</p>
                </section>
              )}
            </div>

            <aside className="space-y-6 border-t border-border bg-surface-muted/25 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <ReceiptText className="size-4 text-brand" />
                  <h2 className="font-display text-lg font-bold text-ink">Ringkasan Pembayaran</h2>
                </div>
                <div className="space-y-3 text-sm">
                  {booking.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 text-ink-muted">
                      <span>{item.courtName}</span>
                      <span className="shrink-0 font-mono text-ink">{formatCurrency(item.priceRupiah)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                    <span className="font-bold text-ink">Total</span>
                    <span className="font-mono text-xl font-black text-ink">
                      {formatCurrency(booking.totalPriceRupiah)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex items-center gap-2 font-semibold text-ink">
                  <CreditCard className="size-4 text-brand" />
                  Informasi Pembayaran
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Metode</dt>
                    <dd className="text-right font-semibold text-ink">
                      {booking.paymentMethod
                        ? paymentMethodLabels[booking.paymentMethod] ?? booking.paymentMethod
                        : "Belum dipilih"}
                    </dd>
                  </div>
                  {booking.paymentExpiresAt && booking.status === "PENDING_PAYMENT" && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-muted">Batas pembayaran</dt>
                      <dd className="text-right font-semibold text-ink">
                        {shortDateTimeFormatter.format(new Date(booking.paymentExpiresAt))}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className="border-t border-border pt-5">
                <BookingDetailActions
                  bookingCode={booking.bookingCode}
                  bookingId={booking.id}
                  hasReview={Boolean(booking.review)}
                  status={booking.status}
                  venueName={booking.venueName}
                />
              </section>
            </aside>
          </div>
        </section>
      </main>

      <PlayerFooter />
      <MobileTabBar />
    </div>
  )
}
