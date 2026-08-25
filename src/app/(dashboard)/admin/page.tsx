import Link from "next/link"
import {
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { AdminActiveVenues } from "@/components/dashboard/admin-active-venues"
import { VenueInspectionWorkbench } from "@/components/dashboard/venue-inspection-workbench"
import { Panel, SectionTitle } from "@/components/dashboard/panel"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { getAdminOverview } from "@/lib/dashboard/admin-data"
import { formatCurrency } from "@/lib/utils"

export default async function AdminPage() {
  const overview = await getAdminOverview()

  return (
    <main className="space-y-8">
      {/* Page Header */}
      <PageHeader
        eyebrow="Operasional & Kurasi Venue"
        title="Pusat Kendali Admin"
        description="Verifikasi kelayakan venue sebelum dibuka ke marketplace, pantau volume GMV transaksi, dan kontrol direktori arena aktif."
        actions={
          <div className="flex items-center gap-2.5">
            <Button asChild variant="secondary" className="text-xs font-bold shadow-2xs">
              <Link href="/">Lihat Marketplace</Link>
            </Button>
            <Button asChild className="btn-cta text-xs font-bold shadow-xs">
              <Link href="/admin/transactions">
                <WalletCards className="size-4" aria-hidden="true" />
                <span>Monitor Transaksi</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Operational KPI Metric HUD Cards */}
      <section
        aria-label="Ringkasan platform"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-2xl border border-brand/40 bg-surface p-5 shadow-xs transition-all hover:border-brand/70">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Antrean Verifikasi</span>
            <span className="badge-coral text-[0.625rem] font-bold">
              {overview.pendingVenues.length} Menunggu
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-ink">
            {overview.pendingVenues.length}
          </p>
          <p className="mt-1 text-[0.6875rem] text-ink-muted">Diproses dari pengajuan terlama</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-brand/40">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Venue Aktif Tayang</span>
            <span className="badge-turf text-[0.625rem] font-bold">
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

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-brand/40">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Total Booking Masuk</span>
            <span className="font-mono text-[0.625rem] font-bold text-brand">
              {overview.totalUserCount} Pengguna
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-ink">
            {overview.bookingCount}
          </p>
          <p className="mt-1 text-[0.6875rem] text-ink-muted">Total jadwal di seluruh arena mitra</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-brand/40">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Gross GMV Lunas</span>
            <span className="badge-optic text-[0.625rem] font-black">SETTLED</span>
          </div>
          <p className="mt-3 font-mono text-2xl font-black text-ink truncate">
            {formatCurrency(overview.settledRevenueRupiah)}
          </p>
          <p className="mt-1 text-[0.6875rem] text-ink-muted">Total pembayaran berhasil diproses</p>
        </div>
      </section>

      {/* Venue Verification Workbench Section */}
      <Panel className="p-5 sm:p-6 shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <SectionTitle detail={`${overview.pendingVenues.length} venue menunggu persetujuan`}>
              Workbench Verifikasi Venue
            </SectionTitle>
            <p className="max-w-2xl text-xs sm:text-sm text-ink-muted">
              Tinjau kelengkapan foto, lapangan aktif, jam operasional, dan kontak WhatsApp sebelum mengaktifkan pembayaran publik.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
            <ShieldCheck className="size-3.5" />
            <span>Standar Kurasi WPT</span>
          </span>
        </div>

        <VenueInspectionWorkbench pendingVenues={overview.pendingVenues} />
      </Panel>

      {/* Active Venues & City Distribution Directory */}
      <section className="space-y-4">
        <AdminActiveVenues
          venues={overview.approvedVenuesList}
          cityDistribution={overview.cityDistribution}
        />
      </section>
    </main>
  )
}
