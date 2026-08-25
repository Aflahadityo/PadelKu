import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { BrandMark } from "@/components/shell/brand-mark"
import { type DashboardRole } from "@/components/shell/dashboard-sidebar"
import { type ShellUser, UserMenu } from "@/components/shell/user-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DashboardTopbarProps {
  className?: string
  role: DashboardRole
  user: ShellUser
}

export function DashboardTopbar({ className, role, user }: DashboardTopbarProps) {
  return (
    <header
      className={cn(
        "safe-area-top sticky top-0 z-30 border-b border-border/80 bg-canvas/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="safe-area-x flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandMark className="lg:hidden" compact />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.15em] text-brand">
                {role === "admin" ? "ADMIN CONSOLE" : "VENUE WORKSPACE"}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[0.625rem] font-bold text-brand">
                ● Live Sync
              </span>
            </div>
            <p className="truncate text-xs sm:text-sm font-bold text-ink">
              {role === "admin" ? "Pusat Kendali Operasional" : "Kelola Venue & Jadwal Hari Ini"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-bold px-3">
            <Link href="/">
              <span>Marketplace</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
