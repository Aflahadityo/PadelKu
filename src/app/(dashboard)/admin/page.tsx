import Link from "next/link"
import {
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleAlert,
  ImageIcon,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  WalletCards,
  X,
  XCircle,
} from "lucide-react"
import { DashboardForm } from "@/components/dashboard/dashboard-form"
import { Panel, SectionTitle } from "@/components/dashboard/panel"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { approveVenueAction, rejectVenueAction } from "@/lib/dashboard/admin-actions"
import { getAdminOverview } from "@/lib/dashboard/admin-data"
import { formatCurrency } from "@/lib/utils"

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

export default async function AdminPage() {
  const overview = await getAdminOverview()

  return (
    <main className="space-y-8">
      {/* Page Header */}
      <PageHeader
        eyebrow="Operasional & Moderasi"
        title="Pusat Kendali Admin"
        description="Verifikasi kelayakan venue mitra sebelum tayang di marketplace dan pantau kesehatan volume transaksi."
        actions={
          <Button asChild className="btn-cta text-xs font-bold shadow-xs">
            <Link href="/admin/transactions">
              <WalletCards className="size-4" aria-hidden="true" />
              <span>Monitor Transaksi</span>
            </Link>
          </Button>
        }
      />

      {/* Operational KPI Metric HUD Cards */}
      <section
        aria-label="Ringkasan platform"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-2xl border border-brand/40 bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Menunggu Verifikasi</span>
            <span className="badge-coral text-[0.625rem]">
              {overview.pendingVenues.length} Antrean
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-ink">
            {overview.pendingVenues.length}
          </p>
          <p className="mt-1 text-[0.6875rem] text-ink-muted">Diproses berdasarkan urutan masuk</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Venue Aktif</span>
            <span className="badge-turf text-[0.625rem]">
              {overview.approvedVenueCount} Tayang
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-ink">
            {overview.approvedVenueCount}
          </p>
          <p className="mt-1 text-[0.6875rem] text-ink-muted">
            {overview.suspendedVenueCount} venue ditangguhkan
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Total Booking Masuk</span>
            <span className="font-mono text-[0.625rem] font-bold text-brand">
              {overview.totalUserCount} Pengguna
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-ink">
            {overview.bookingCount}
          </p>
          <p className="mt-1 text-[0.6875rem] text-ink-muted">Total reservasi di seluruh arena</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Volume Gross Lunas</span>
            <span className="badge-optic text-[0.625rem] font-black">GMV</span>
          </div>
          <p className="mt-3 font-mono text-2xl font-black text-ink truncate">
            {formatCurrency(overview.settledRevenueRupiah)}
          </p>
          <p className="mt-1 text-[0.6875rem] text-ink-muted">Total pembayaran berhasil diproses</p>
        </div>
      </section>

      {/* Venue Verification Workbench */}
      <Panel className="p-0 sm:p-0 overflow-hidden">
        <div className="border-b border-border/80 p-5 sm:p-6 bg-surface-muted/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionTitle detail={`${overview.pendingVenues.length} venue butuh tindakan`}>
                Workbench Verifikasi Venue
              </SectionTitle>
              <p className="max-w-2xl text-xs sm:text-sm text-ink-muted">
                Tinjau kelengkapan informasi, legalitas lokasi, lapangan aktif, dan foto sebelum mengizinkan venue menerima pembayaran dari publik.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
              <ShieldCheck className="size-3.5" />
              <span>Standar Akurasi 100%</span>
            </span>
          </div>
        </div>

        {overview.pendingVenues.length === 0 ? (
          <EmptyState
            className="border-0 py-12"
            icon={<Building2 className="size-8" aria-hidden="true" />}
            title="Semua Antrean Verifikasi Bersih"
            description="Tidak ada pengajuan venue baru yang menunggu review saat ini. Pengajuan baru akan langsung muncul di sini."
          />
        ) : (
          <div className="divide-y divide-border/80">
            {overview.pendingVenues.map((venue, index) => {
              const hasCourts = venue.activeCourtCount > 0
              const hasImages = venue.imageCount > 0
              const hasPhone = Boolean(venue.phone)
              const isFullyReady = hasCourts && hasImages && hasPhone

              return (
                <article
                  key={venue.id}
                  className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_22rem] items-start hover:bg-surface-muted/20 transition-colors"
                >
                  <div className="min-w-0 space-y-4">
                    {/* Header meta */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-xs font-bold text-white">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <StatusBadge status="PENDING" />
                      <time className="text-xs text-ink-muted" dateTime={venue.submittedAt}>
                        Diajukan {dateFormatter.format(new Date(venue.submittedAt))}
                      </time>
                    </div>

                    {/* Venue title & Owner info */}
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                        {venue.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                        <span className="flex items-center gap-1 font-semibold text-ink">
                          <User className="size-3 text-brand" />
                          {venue.ownerName}
                        </span>
                        <span>·</span>
                        <span>{venue.ownerEmail}</span>
                      </div>
                    </div>

                    {/* Operational Details Grid */}
                    <dl className="grid gap-4 rounded-2xl border border-border/80 bg-surface-muted/50 p-4 sm:grid-cols-3 text-xs">
                      <div>
                        <dt className="flex items-center gap-1.5 font-bold text-ink-muted">
                          <MapPin className="size-3.5 text-brand" />
                          <span>Lokasi Venue</span>
                        </dt>
                        <dd className="mt-1 font-medium text-ink leading-relaxed">
                          {venue.address}, {venue.city}, {venue.province}
                        </dd>
                      </div>

                      <div>
                        <dt className="flex items-center gap-1.5 font-bold text-ink-muted">
                          <CalendarClock className="size-3.5 text-brand" />
                          <span>Jam Operasional</span>
                        </dt>
                        <dd className="mt-1 font-mono font-semibold text-ink">
                          {venue.openingTime} – {venue.closingTime} WIB
                        </dd>
                      </div>

                      <div>
                        <dt className="flex items-center gap-1.5 font-bold text-ink-muted">
                          <Phone className="size-3.5 text-brand" />
                          <span>Kontak Pengelola</span>
                        </dt>
                        <dd className="mt-1 font-mono font-semibold text-ink">
                          {venue.phone ?? "Belum diisi"}
                        </dd>
                      </div>
                    </dl>

                    {/* Facilities & Specs Checklist */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                          hasCourts
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-error/30 bg-error/10 text-error"
                        }`}
                      >
                        {hasCourts ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                        {venue.activeCourtCount} Lapangan Aktif
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                          hasImages
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-error/30 bg-error/10 text-error"
                        }`}
                      >
                        <ImageIcon className="size-3" />
                        {venue.imageCount} Foto Diunggah
                      </span>

                      {venue.facilities.map((facility) => (
                        <span
                          key={facility}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-ink-muted"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>

                    {!isFullyReady && (
                      <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-ink leading-relaxed">
                        <CircleAlert className="size-4 shrink-0 text-warning mt-0.5" />
                        <span>
                          Checklist belum lengkap. Pastikan minimal 1 lapangan aktif dan nomor telepon sebelum memberikan persetujuan publik.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Decision Workbench Panel */}
                  <aside className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4">
                    <div>
                      <p className="font-display text-sm font-bold text-ink">Keputusan Verifikasi</p>
                      <p className="text-[0.6875rem] text-ink-muted">
                        Tindakan langsung memperbarui status di database & mengirim notifikasi ke pemilik.
                      </p>
                    </div>

                    {/* Approve Action */}
                    <DashboardForm
                      action={approveVenueAction.bind(null, venue.id)}
                      disabled={venue.activeCourtCount === 0}
                      pendingLabel="Menyetujui..."
                      submitLabel="✓ Setujui & Publikasikan"
                    >
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                        <Check className="size-3.5" />
                        <span>Buka ke Marketplace PadelKu</span>
                      </p>
                    </DashboardForm>

                    {/* Reject Action with Reason Templates */}
                    <details className="group border-t border-border/80 pt-4">
                      <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-bold text-error marker:content-none hover:underline">
                        <span className="flex items-center gap-1.5">
                          <X className="size-3.5" />
                          <span>Tolak Pengajuan</span>
                        </span>
                        <span className="text-[0.625rem] font-normal text-ink-muted">Buka formulir</span>
                      </summary>

                      <DashboardForm
                        action={rejectVenueAction.bind(null, venue.id)}
                        className="mt-3 space-y-3"
                        pendingLabel="Menolak..."
                        submitLabel="Kirim Penolakan"
                        variant="destructive"
                      >
                        <div>
                          <label
                            className="block text-xs font-bold text-ink mb-1"
                            htmlFor={`reason-${venue.id}`}
                          >
                            Alasan Penolakan (untuk pemilik)
                          </label>
                          <textarea
                            id={`reason-${venue.id}`}
                            name="reason"
                            required
                            minLength={10}
                            maxLength={500}
                            placeholder="Contoh: Foto lapangan belum jelas memperlihatkan kondisi rumput dan jaring. Silakan unggah foto resolusi tinggi."
                            className="min-h-24 w-full resize-y rounded-xl border border-border-strong bg-surface p-3 text-xs text-ink placeholder:text-ink-muted focus:border-error focus:outline-none focus:ring-2 focus:ring-error/20"
                          />
                        </div>
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
