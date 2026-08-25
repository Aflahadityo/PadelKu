"use client"

import Link from "next/link"
import { LogOut, Settings, UserRound } from "lucide-react"
import { cn, getInitials } from "@/lib/utils"

export interface ShellUser {
  email?: string
  name: string
  role?: string
}

export interface UserMenuProps {
  align?: "left" | "right"
  className?: string
  user: ShellUser
}

export function UserMenu({ align = "right", className, user }: UserMenuProps) {
  return (
    <details className={cn("group relative", className)}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-control px-1.5 pr-2 text-left transition-colors marker:content-none hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
        <span className="grid size-9 shrink-0 place-items-center rounded-[0.55rem] bg-ink font-mono text-xs font-bold text-canvas">
          {getInitials(user.name)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-36 truncate text-sm font-semibold leading-4 text-ink">{user.name}</span>
          {user.role ? <span className="mt-0.5 block text-[0.6875rem] leading-4 text-ink-muted">{user.role}</span> : null}
        </span>
        <span className="sr-only">Buka menu pengguna</span>
      </summary>

      <div
        className={cn(
          "absolute top-[calc(100%+0.5rem)] z-50 w-64 rounded-card border border-border bg-surface-raised p-2 shadow-float",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        <div className="border-b border-border px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          {user.email ? <p className="mt-0.5 truncate text-xs text-ink-muted">{user.email}</p> : null}
        </div>
        <nav aria-label="Menu akun" className="py-1">
          <Link href="/profile" className="flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium text-ink hover:bg-surface-muted">
            <UserRound aria-hidden="true" className="size-4 text-ink-muted" />
            Profil
          </Link>
          <Link href="/profile/settings" className="flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium text-ink hover:bg-surface-muted">
            <Settings aria-hidden="true" className="size-4 text-ink-muted" />
            Pengaturan
          </Link>
        </nav>
        <form action="/api/auth/logout" method="post" className="border-t border-border pt-1">
          <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-sm font-semibold text-error hover:bg-error/8">
            <LogOut aria-hidden="true" className="size-4" />
            Keluar
          </button>
        </form>
      </div>
    </details>
  )
}
