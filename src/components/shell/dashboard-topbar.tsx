"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  ExternalLink,
  Search,
} from "lucide-react"
import { BrandMark } from "@/components/shell/brand-mark"
import { type DashboardRole } from "@/components/shell/dashboard-sidebar"
import { NotificationDrawer } from "@/components/shell/notification-drawer"
import { type ShellUser, UserMenu } from "@/components/shell/user-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DashboardTopbarProps {
  className?: string
  role: DashboardRole
  user: ShellUser
}

export function DashboardTopbar({ className, role, user }: DashboardTopbarProps) {
  const pathname = usePathname()

  const getBreadcrumbTitle = () => {
    if (pathname.includes("/admin/transactions")) return "Monitor Transaksi & Rekonsiliasi"
    if (pathname.includes("/admin")) return "Pusat Kendali Operasional"
    if (pathname.includes("/venue-owner")) return "Workspace Operasional Venue"
    return "Dashboard"
  }

  return (
    <header
      className={cn(
        "safe-area-top sticky top-0 z-30 border-b border-border/80 bg-surface/95 backdrop-blur-md shadow-2xs",
        className,
      )}
    >
      <div className="safe-area-x flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Breadcrumb trail */}
        <div className="flex items-center gap-3 min-w-0">
          <BrandMark className="lg:hidden" compact />

          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs font-semibold">
            <span className="font-mono text-ink-muted">
              {role === "admin" ? "Admin Console" : "Venue HQ"}
            </span>
            <ChevronRight className="size-3 text-ink-muted" />
            <span className="font-bold text-ink truncate">
              {getBreadcrumbTitle()}
            </span>
          </nav>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-brand">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Center: Command Palette Simulator */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-surface-muted/50 px-3 py-1.5 text-xs text-ink-muted hover:border-brand/40 transition-colors w-64 max-w-xs">
          <Search className="size-3.5 text-ink-muted" />
          <span className="flex-1 truncate">Cari booking, venue...</span>
          <kbd className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.625rem] font-bold border border-border text-ink-muted shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Right: Quick Marketplace link, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-bold px-3 hover:text-brand">
            <Link href="/" target="_blank">
              <span>Marketplace</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <NotificationDrawer />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
