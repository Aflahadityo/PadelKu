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

interface NavGroup {
  groupName: string
  items: {
    exact?: boolean
    href: string
    icon: LucideIcon
    label: string
    badge?: string
  }[]
}

const ownerNavGroups: NavGroup[] = [
  {
    groupName: "Operasional",
    items: [
      { href: "/venue-owner", label: "Ringkasan Operasional", icon: LayoutDashboard, exact: true },
    ],
  },
]

const adminNavGroups: NavGroup[] = [
  {
    groupName: "Kurasi & Moderasi",
    items: [
      { href: "/admin", label: "Pusat Kendali & Kurasi", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    groupName: "Finansial & Transaksi",
    items: [
      { href: "/admin/transactions", label: "Monitor Transaksi", icon: WalletCards },
    ],
  },
]

export interface DashboardSidebarProps {
  className?: string
  role: DashboardRole
}

export function DashboardSidebar({ className, role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const groups = role === "admin" ? adminNavGroups : ownerNavGroups

  return (
    <aside
      className={cn(
        "hidden min-h-dvh w-[17.5rem] flex-col border-r border-border/80 bg-[#0B130E] px-4 py-5 text-white lg:flex shadow-xl z-20 relative",
        className,
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 pb-4 border-b border-white/10">
        <BrandMark inverse />
        <span className="font-mono text-[0.625rem] font-black uppercase tracking-wider text-booking bg-booking/10 px-2 py-0.5 rounded-full border border-booking/20">
          PRO v2
        </span>
      </div>

      {/* Workspace Context Card */}
      <div className="my-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand">
            {role === "admin" ? "ADMIN WORKSPACE" : "VENUE HQ PORTAL"}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[0.625rem] font-bold text-booking">
            <span className="size-1.5 rounded-full bg-booking animate-pulse" />
            LIVE
          </span>
        </div>
        <p className="mt-1 text-xs font-extrabold text-white truncate">
          {role === "admin" ? "Pusat Kendali Operasional" : "Manajemen Arena & Reservasi"}
        </p>
      </div>

      {/* Navigation Groups */}
      <nav aria-label="Navigasi dashboard" className="space-y-5 flex-1">
        {groups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <span className="px-3 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
              {group.groupName}
            </span>

            {group.items.map(({ exact, href, icon: Icon, label, badge }) => {
              const active = exact ? pathname === href : isRouteActive(pathname, href)

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex min-h-10 items-center justify-between rounded-xl px-3 text-xs font-bold transition-all duration-150",
                    active
                      ? "bg-brand text-white shadow-sm font-extrabold"
                      : "text-white/70 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "size-4 transition-colors",
                        active ? "text-booking" : "text-white/60 group-hover:text-white",
                      )}
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
          </div>
        ))}

        {/* Quick Access to Marketplace */}
        <div className="pt-3 border-t border-white/10 space-y-1">
          <span className="px-3 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
            Akses Publik
          </span>
          <Link
            href="/"
            className="flex min-h-9 items-center justify-between rounded-xl px-3 text-xs font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="size-3.5 text-booking" />
              <span>Lihat Marketplace</span>
            </div>
            <ExternalLink className="size-3 text-white/40" />
          </Link>
        </div>
      </nav>

      {/* Security SSL Audit Card Footer */}
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[0.6875rem] leading-relaxed text-white/60">
        <div className="flex items-center gap-1.5 text-brand font-bold mb-0.5">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          <span>Sesi SSL Terenkripsi</span>
        </div>
        Aktivitas approval dan finansial tercatat audit trail server.
      </div>
    </aside>
  )
}
