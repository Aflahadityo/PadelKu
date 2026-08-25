"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, isRouteActive } from "@/lib/utils"

export interface PlayerNavItem {
  href: string
  label: string
  isHot?: boolean
}

export const playerNavItems: PlayerNavItem[] = [
  { href: "/", label: "Cari Venue" },
  { href: "/#venue-list", label: "Jadwal Venue" },
  { href: "/#community-matches", label: "Open Match", isHot: true },
  { href: "/bookings", label: "Booking Saya" },
  { href: "/membership", label: "Membership" },
]

export interface DesktopNavProps {
  className?: string
  items?: PlayerNavItem[]
}

export function DesktopNav({ className, items = playerNavItems }: DesktopNavProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi pemain"
      className={cn(
        "hidden items-center gap-1 rounded-full border border-border/80 bg-surface/85 p-1 shadow-2xs backdrop-blur-md md:flex",
        className,
      )}
    >
      {items.map((item) => {
        const active = isRouteActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex min-h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all duration-150",
              active
                ? "bg-ink text-white shadow-xs"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            {item.label}
            {item.isHot && (
              <span className="flex size-1.5 rounded-full bg-urgent animate-pulse" aria-hidden="true" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

