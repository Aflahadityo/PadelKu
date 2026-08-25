"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
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
}

const ownerItems: DashboardNavItem[] = [
  { href: "/venue-owner", label: "Ringkasan", icon: LayoutDashboard, exact: true },
]

const adminItems: DashboardNavItem[] = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { href: "/admin/transactions", label: "Transaksi", icon: WalletCards },
]

export interface DashboardSidebarProps {
  className?: string
  role: DashboardRole
}

export function DashboardSidebar({ className, role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const items = role === "admin" ? adminItems : ownerItems

  return (
    <aside className={cn("hidden min-h-dvh w-(--sidebar-width) flex-col border-r border-white/10 bg-ink px-4 py-5 text-white lg:flex", className)}>
      <BrandMark inverse />
      <div className="mt-8 border-y border-white/10 py-3">
        <p className="px-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-white/45">Workspace</p>
        <p className="mt-1 px-2 text-sm font-semibold text-white/90">
          {role === "admin" ? "Operasional PadelKu" : "Manajemen venue"}
        </p>
      </div>
      <nav aria-label="Navigasi dashboard" className="mt-5 space-y-1">
        {items.map(({ exact, href, icon: Icon, label }) => {
          const active = exact ? pathname === href : isRouteActive(pathname, href)

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors",
                active ? "bg-white text-ink" : "text-white/65 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className={cn("size-4", active && "text-brand")} aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto rounded-control border border-white/10 p-3 text-xs leading-5 text-white/55">
        <ShieldCheck className="mb-2 size-4 text-turquoise" aria-hidden="true" />
        Sesi dashboard dilindungi dan aktivitas operasional dicatat.
      </div>
    </aside>
  )
}
