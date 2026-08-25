import Link from "next/link"
import {
  ExternalLink,
  Globe,
  MapPin,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { AdminActiveVenueItem } from "@/lib/dashboard/admin-data"

interface AdminActiveVenuesProps {
  venues: AdminActiveVenueItem[]
  cityDistribution: Array<{ city: string; count: number }>
}

export function AdminActiveVenues({
  venues,
  cityDistribution,
}: AdminActiveVenuesProps) {
  const totalCourts = venues.reduce((acc, v) => acc + v.activeCourts, 0)

  return (
    <div className="space-y-8">
      {/* City Distribution & Platform Health */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* City Distribution (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-border/90 bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-brand" />
              <h3 className="font-display text-base font-bold text-ink">
                Distribusi Venue Berdasarkan Wilayah
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-ink">
              {totalCourts} Total Lapangan Aktif
            </span>
          </div>

          <div className="space-y-3">
            {cityDistribution.map((item) => {
              const percentage = Math.round((item.count / Math.max(1, venues.length)) * 100)
              return (
                <div key={item.city} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink">
                    <span>{item.city}</span>
                    <span className="font-mono text-ink-muted">
                      {item.count} Venue ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* System Infrastructure Health (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-border/90 bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <Server className="size-4 text-brand" />
            <h3 className="font-display text-base font-bold text-ink">
              Status Infrastruktur & Gateway
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-brand" />
                <div>
                  <p className="font-bold text-ink">Sandbox Payment Gateway</p>
                  <p className="text-[0.6875rem] text-ink-muted">VA, QRIS, & E-Wallet Engine</p>
                </div>
              </div>
              <span className="badge-optic text-[0.625rem] font-bold">ONLINE (100%)</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-brand" />
                <div>
                  <p className="font-bold text-ink">Real-time Court Engine</p>
                  <p className="text-[0.6875rem] text-ink-muted">10-Min Lock Anti-Double Booking</p>
                </div>
              </div>
              <span className="badge-turf text-[0.625rem] font-bold">TERAKURASI</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand" />
                <div>
                  <p className="font-bold text-ink">Supabase Auth & RLS</p>
                  <p className="text-[0.6875rem] text-ink-muted">Session Isolation Terenkripsi</p>
                </div>
              </div>
              <span className="badge-turf text-[0.625rem] font-bold">AKTIF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Approved Venues Table */}
      <div className="rounded-3xl border border-border/90 bg-surface shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-surface-muted/30 p-5 sm:p-6">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Direktori Venue Aktif di Marketplace
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              {venues.length} venue aktif terverifikasi menerima pemesanan publik
            </p>
          </div>

          <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
            {venues.length} APPROVED
          </span>
        </div>

        {venues.length === 0 ? (
          <p className="p-8 text-center text-xs text-ink-muted">Belum ada venue aktif.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[54rem] text-left text-xs">
              <thead className="bg-surface-muted text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-5 py-3.5">Nama Venue</th>
                  <th className="px-5 py-3.5">Kota</th>
                  <th className="px-5 py-3.5">Kapasitas</th>
                  <th className="px-5 py-3.5">Jam Buka</th>
                  <th className="px-5 py-3.5">Kontak & Pemilik</th>
                  <th className="px-5 py-3.5 text-right">Status & Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {venues.map((venue) => (
                  <tr
                    key={venue.id}
                    className="hover:bg-surface-muted/25 transition-colors align-middle"
                  >
                    <td className="px-5 py-4 font-display text-sm font-bold text-ink">
                      {venue.name}
                    </td>

                    <td className="px-5 py-4 font-medium text-ink">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-brand" />
                        {venue.city}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-ink">
                      <span className="rounded-md bg-brand/10 px-2 py-0.5 text-brand">
                        {venue.activeCourts} Lapangan
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-ink-muted">
                      {venue.openingTime} – {venue.closingTime}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink">{venue.ownerName}</p>
                      <p className="font-mono text-[0.6875rem] text-ink-muted">
                        {venue.phone ?? "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <StatusBadge status={venue.status} />
                        <Link
                          href={`/`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[0.6875rem] font-bold text-brand hover:border-brand/40 hover:bg-surface-muted"
                        >
                          <span>Marketplace</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
