"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Calendar, Crown, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Cari", Icon: Search },
  { href: "/bookings", label: "Booking Saya", Icon: Calendar },
  { href: "/membership", label: "Membership", Icon: Crown },
  { href: "/profile", label: "Profil", Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 h-full px-3 min-w-[64px]",
                "transition-colors relative"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-brand" : "text-ink-muted"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-brand" : "text-ink-muted"
                )}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 w-1 h-1 rounded-full bg-brand" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
