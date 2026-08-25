"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  ExternalLink,
  LayoutDashboard,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import { BrandMark } from "@/components/shell/brand-mark"
import { cn, isRouteActive } from "@/lib/utils"

export type DashboardRole = "owner" | "admin"

interface DashboardNavItem {
  exact?: boolean
  href: string
  icon: LucideIcon
  label: string
  badge?: string
}

const ownerItems: DashboardNavItem[] = [
  { href: "/venue-owner", label: "Ringkasan Venue", icon: LayoutDashboard, exact: true },
]

const adminItems: DashboardNavItem[] = [
  { href: "/admin", label: "Pusat Kendali", icon: LayoutDashboard, exact: true },
  { href: "/admin/transactions", label: "Monitor Transaksi", icon: WalletCards },
]

export interface DashboardSidebarProps {
  className?: string
  role: DashboardRole
}

export function DashboardSidebar({ className, role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const items = role === "admin" ? adminItems : ownerItems

  return (
    <aside
      className={cn(
        "hidden min-h-dvh w-[17.5rem] flex-col border-r border-white/10 bg-[#121B16] px-4 py-6 text-white lg:flex shadow-xl",
        className,
      )}
    >
      {/* Brand logo inverse */}
      <BrandMark inverse />

      {/* Role Workspace pill */}
      <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-white/50">
            {role === "admin" ? "ADMIN CONSOLE" : "VENUE PORTAL"}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[0.625rem] font-bold text-booking">
            <span className="size-1.5 rounded-full bg-booking animate-pulse" />
            LIVE
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-white">
          {role === "admin" ? "Pusat Kendali Operasional" : "Manajemen Arena & Jadwal"}
        </p>
      </div>

      {/* Navigation list */}
      <nav aria-label="Navigasi dashboard" className="mt-6 space-y-1.5">
        <span className="px-3 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-white/40">
          Menu Utama
        </span>
        {items.map(({ exact, href, icon: Icon, label, badge }) => {
          const active = exact ? pathname === href : isRouteActive(pathname, href)

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 items-center justify-between rounded-xl px-3.5 text-xs font-bold transition-all duration-150",
                active
                  ? "bg-brand text-white shadow-sm font-extrabold"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn("size-4", active ? "text-booking" : "text-white/60 group-hover:text-white")}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 font-mono text-[0.625rem] font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Switch to public marketplace */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <Link
          href="/"
          className="flex min-h-10 items-center justify-between rounded-xl px-3 text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="size-3.5 text-booking" />
            <span>Lihat Marketplace</span>
          </div>
          <ExternalLink className="size-3 text-white/40" />
        </Link>
      </div>

      {/* Security alert footer */}
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3.5 text-[0.6875rem] leading-relaxed text-white/60">
        <div className="flex items-center gap-2 text-brand font-bold mb-1">
          <ShieldCheck className="size-4" aria-hidden="true" />
          <span>Sesi Terenkripsi</span>
        </div>
        Aktivitas approval dan finansial tercatat audit trail server.
      </div>
    </aside>
  )
}
