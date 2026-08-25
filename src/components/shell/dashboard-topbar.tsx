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
    <header className={cn("safe-area-top sticky top-0 z-30 border-b border-border bg-canvas/92 backdrop-blur-md", className)}>
      <div className="safe-area-x flex h-(--header-height) items-center gap-4">
        <BrandMark className="lg:hidden" compact />
        <div className="min-w-0">
          <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-brand">
            {role === "admin" ? "Admin console" : "Venue workspace"}
          </p>
          <p className="truncate text-sm font-semibold text-ink">
            {role === "admin" ? "Kontrol operasional" : "Kelola permainan hari ini"}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="ml-auto hidden sm:inline-flex">
          <Link href="/">
            Lihat marketplace
            <ExternalLink aria-hidden="true" />
          </Link>
        </Button>
        <UserMenu user={user} />
      </div>
    </header>
  )
}
