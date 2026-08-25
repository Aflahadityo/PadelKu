import Link from "next/link"
import { Building2, CalendarClock, Check, CircleAlert, ImageIcon, MapPin, Phone, WalletCards, X } from "lucide-react"
import { DashboardForm } from "@/components/dashboard/dashboard-form"
import { Panel, SectionTitle } from "@/components/dashboard/panel"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Metric } from "@/components/ui/metric"
import { PageHeader } from "@/components/ui/page-header"
import { approveVenueAction, rejectVenueAction } from "@/lib/dashboard/admin-actions"
import { getAdminOverview } from "@/lib/dashboard/admin-data"
import { formatCurrency } from "@/lib/utils"

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" })

export default async function AdminPage() {
  const overview = await getAdminOverview()

  return (
    <main className="space-y-8">
      <PageHeader
        eyebrow="Operasional hari ini"
        title="Pusat kendali"
        description="Verifikasi venue sebelum tayang. Pantau volume transaksi tanpa mengubah catatan pembayaran."
        actions={
          <Button asChild variant="secondary">
            <Link href="/admin/transactions"><WalletCards aria-hidden="true" /> Lihat transaksi</Link>
          </Button>
        }
      />

      <section aria-label="Ringkasan platform" className="grid gap-6 border-b border-border pb-8 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Menunggu verifikasi" value={overview.pendingVenues.length} detail="Diproses dari antrean terlama" />
        <Metric label="Venue aktif" value={overview.approvedVenueCount} detail={`${overview.suspendedVenueCount} venue ditangguhkan`} />
        <Metric label="Total booking" value={overview.bookingCount} detail={`${overview.totalUserCount} akun terdaftar`} />
        <Metric label="Pembayaran lunas" value={formatCurrency(overview.settledRevenueRupiah)} detail="Nilai bruto, bukan komisi platform" />
      </section>

      <Panel className="p-0 sm:p-0">
        <div className="p-5 sm:p-6">
          <SectionTitle detail={`${overview.pendingVenues.length} dari ${overview.totalVenueCount} venue`}>
            Antrean verifikasi venue
          </SectionTitle>
          <p className="max-w-2xl text-sm leading-6 text-ink-muted">
            Persetujuan membuka venue ke marketplace. Pastikan lokasi, kontak, foto, dan lapangan aktif sudah layak.
          </p>
        </div>

        {overview.pendingVenues.length === 0 ? (
          <EmptyState
            className="border-x-0 border-b-0"
            icon={<Building2 aria-hidden="true" />}
            title="Antrean sudah bersih"
            description="Venue baru yang dikirim pemilik akan muncul di sini."
          />
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {overview.pendingVenues.map((venue, index) => {
              const ready = venue.activeCourtCount > 0 && venue.imageCount > 0 && Boolean(venue.phone)
              return (
                <article key={venue.id} className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-ink-muted">#{String(index + 1).padStart(2, "0")}</span>
                      <StatusBadge status="PENDING" />
                      <time className="text-xs text-ink-muted" dateTime={venue.submittedAt}>
                        Dikirim {dateFormatter.format(new Date(venue.submittedAt))}
                      </time>
                    </div>
                    <h2 className="mt-4 text-wrap-balance font-display text-3xl font-bold leading-none tracking-[-0.045em] text-ink sm:text-4xl">
                      {venue.name}
                    </h2>
                    <p className="mt-3 text-sm font-semibold text-ink">{venue.ownerName}</p>
                    <p className="text-xs text-ink-muted">{venue.ownerEmail}</p>

                    <dl className="mt-6 grid gap-x-6 gap-y-4 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <dt className="flex items-center gap-2 text-xs font-semibold text-ink-muted"><MapPin className="size-4" aria-hidden="true" /> Lokasi</dt>
                        <dd className="mt-1 text-sm leading-6 text-ink">{venue.address}, {venue.city}, {venue.province}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-2 text-xs font-semibold text-ink-muted"><CalendarClock className="size-4" aria-hidden="true" /> Jam operasional</dt>
                        <dd className="mt-1 font-mono text-sm text-ink">{venue.openingTime} - {venue.closingTime}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-2 text-xs font-semibold text-ink-muted"><Phone className="size-4" aria-hidden="true" /> Kontak</dt>
                        <dd className="mt-1 text-sm text-ink">{venue.phone ?? "Belum diisi"}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="border border-border px-2.5 py-1.5 text-xs font-semibold text-ink">
                        {venue.activeCourtCount} lapangan aktif
                      </span>
                      <span className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs font-semibold text-ink">
                        <ImageIcon className="size-3.5" aria-hidden="true" /> {venue.imageCount} foto
                      </span>
                      {venue.facilities.map((facility) => <span key={facility} className="bg-surface-muted px-2.5 py-1.5 text-xs text-ink-muted">{facility}</span>)}
                    </div>

                    {!ready ? (
                      <p className="mt-5 flex gap-2 border-l-2 border-warning pl-3 text-xs leading-5 text-ink-muted">
                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                        Checklist belum lengkap. Persetujuan tetap memvalidasi minimal satu lapangan aktif di server.
                      </p>
                    ) : null}
                  </div>

                  <aside className="border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                    <p className="text-sm font-semibold text-ink">Keputusan admin</p>
                    <p className="mt-1 text-xs leading-5 text-ink-muted">Tindakan tercatat bersama akun admin dan waktu review.</p>
                    <DashboardForm
                      action={approveVenueAction.bind(null, venue.id)}
                      className="mt-5"
                      disabled={venue.activeCourtCount === 0}
                      pendingLabel="Menyetujui"
                      submitLabel="Setujui venue"
                    >
                      <p className="flex items-center gap-2 text-xs font-semibold text-success"><Check className="size-4" aria-hidden="true" /> Publikasikan ke marketplace</p>
                    </DashboardForm>
                    <details className="group mt-5 border-t border-border pt-5">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-error marker:content-none [&::-webkit-details-marker]:hidden">
                        <X className="size-4" aria-hidden="true" /> Tolak pengajuan
                      </summary>
                      <DashboardForm
                        action={rejectVenueAction.bind(null, venue.id)}
                        className="mt-3"
                        pendingLabel="Menolak"
                        submitLabel="Simpan penolakan"
                        variant="destructive"
                      >
                        <label className="block text-xs font-semibold text-ink" htmlFor={`reason-${venue.id}`}>Alasan untuk pemilik</label>
                        <textarea
                          id={`reason-${venue.id}`}
                          name="reason"
                          required
                          minLength={10}
                          maxLength={500}
                          placeholder="Contoh: Foto venue belum memperlihatkan kondisi lapangan secara jelas."
                          className="min-h-28 w-full resize-y rounded-control border border-border-strong bg-surface p-3 text-sm text-ink placeholder:text-ink-muted focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/15"
                        />
                      </DashboardForm>
                    </details>
                  </aside>
                </article>
              )
            })}
          </div>
        )}
      </Panel>
    </main>
  )
}
