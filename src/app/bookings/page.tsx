import Link from "next/link"
import { CalendarDays, MapPin } from "lucide-react"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerHeader } from "@/components/shell/player-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { requireUser } from "@/lib/auth"
import { getPlayerBookings } from "@/lib/data/player"
import { formatCurrency } from "@/lib/utils"

export default async function BookingsPage() {
  const user = await requireUser()
  const bookings = await getPlayerBookings(user.id)
  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16">
      <PlayerHeader user={{ email: user.email, name: user.fullName, role: "Player" }} />
      <main className="safe-area-x mx-auto max-w-4xl space-y-8 py-8">
        <PageHeader eyebrow="Aktivitas saya" title="Booking saya" description="Status booking dan pembayaran terbaru dari sistem." />
        {!bookings.length ? <EmptyState icon={<CalendarDays />} title="Belum ada booking" description="Pilih venue dan slot yang tersedia untuk mulai bermain." action={<Link href="/" className="font-semibold text-brand">Cari venue</Link>} /> : (
          <div className="divide-y divide-border border-y border-border">
            {bookings.map((booking) => {
              const first = booking.items[0]
              return <article key={booking.id} className="grid gap-5 py-6 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-semibold">{booking.bookingCode}</span><StatusBadge status={booking.status} />{booking.paymentStatus ? <StatusBadge status={booking.paymentStatus} /> : null}</div><h2 className="mt-3 font-display text-2xl font-bold text-ink">{booking.venueName}</h2><p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted"><MapPin className="size-4" />{booking.venueCity} · {first?.courtName ?? "Lapangan"}</p>{first ? <p className="mt-3 font-mono text-sm">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(first.startsAt))}</p> : null}</div>
                <div className="sm:text-right"><p className="font-mono text-lg font-bold">{formatCurrency(booking.totalPriceRupiah)}</p><Link href={`/venues/${booking.venueSlug}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand">Lihat venue</Link></div>
              </article>
            })}
          </div>
        )}
      </main><MobileTabBar />
    </div>
  )
}
