"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Search, Sparkles, Swords, UserRound } from "lucide-react"
import { cn, isRouteActive } from "@/lib/utils"

export type MobileTabIcon = "search" | "matches" | "bookings" | "membership" | "profile"

export interface MobileTabItem {
  href: string
  icon: MobileTabIcon
  label: string
}

const defaultItems: MobileTabItem[] = [
  { href: "/", label: "Cari", icon: "search" },
  { href: "/matches", label: "Sparring", icon: "matches" },
  { href: "/bookings", label: "Tiket", icon: "bookings" },
  { href: "/membership", label: "VIP", icon: "membership" },
  { href: "/profile", label: "Profil", icon: "profile" },
]

const tabIcons = {
  search: Search,
  matches: Swords,
  bookings: CalendarDays,
  membership: Sparkles,
  profile: UserRound,
}

export interface MobileTabBarProps {
  className?: string
  items?: MobileTabItem[]
  userRole?: string
}

export function MobileTabBar({ className, items = defaultItems }: MobileTabBarProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama pemain"
      className={cn(
        "safe-area-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden",
        className,
      )}
    >
      <div className="mx-auto grid min-h-(--mobile-tab-height) max-w-lg grid-cols-5 px-1">
        {items.map(({ href, icon, label }) => {
          const active = isRouteActive(pathname, href)
          const Icon = tabIcons[icon]

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-control px-0.5 text-[0.6875rem] font-semibold transition-colors",
                active ? "text-brand-strong font-bold" : "text-ink-muted",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.35 : 1.8} aria-hidden="true" />
              <span className="truncate">{label}</span>
              {active ? <span className="absolute inset-x-3 top-0 h-0.5 bg-brand" aria-hidden="true" /> : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
