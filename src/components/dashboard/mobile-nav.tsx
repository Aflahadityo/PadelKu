import Link from "next/link"
import type { DashboardRole } from "@/lib/dashboard/types"

const ownerLinks = [
  ["Ringkasan", "/venue-owner"],
  ["Venue", "/venue-owner/venues"],
  ["Lapangan", "/venue-owner/courts"],
  ["Jadwal", "/venue-owner/schedule"],
  ["Booking", "/venue-owner/bookings"],
  ["Laporan", "/venue-owner/reports"],
] as const

const adminLinks = [
  ["Ringkasan", "/admin"],
  ["Venue", "/admin/venues"],
  ["Transaksi", "/admin/transactions"],
  ["Review", "/admin/disputes"],
  ["Pengguna", "/admin/users"],
  ["Audit", "/admin/audit"],
] as const

export function MobileDashboardNav({ role }: { role: DashboardRole }) {
  const links = role === "ADMIN" ? adminLinks : ownerLinks
  return (
    <nav aria-label="Navigasi dashboard mobile" className="-mx-4 mb-7 overflow-x-auto border-b border-border px-4 pb-3 lg:hidden">
      <div className="flex min-w-max gap-1">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-control px-3 py-2 text-sm font-semibold text-ink-muted hover:bg-surface hover:text-ink">
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
