"use client"

import { useEffect, useState } from "react"
import { Bell, CalendarCheck, CircleAlert, CreditCard, Info, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database.generated"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]

const typeStyles = {
  BOOKING: { icon: CalendarCheck, className: "bg-booking/20 text-ink" },
  PAYMENT: { icon: CreditCard, className: "bg-brand/10 text-brand" },
  VENUE: { icon: MapPin, className: "bg-warning/15 text-warning" },
  SYSTEM: { icon: Info, className: "bg-surface-muted text-ink-muted" },
} as const

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function NotificationDrawer() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unreadCount = notifications.filter((notification) => !notification.read_at).length

  async function loadNotifications() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      setError("Sesi berakhir. Silakan masuk kembali.")
      setLoading(false)
      return
    }

    const { data, error: queryError } = await supabase
      .from("notifications")
      .select("id,user_id,type,title,message,data,read_at,created_at")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(30)

    if (queryError) setError("Notifikasi belum dapat dimuat.")
    else setNotifications(data)
    setLoading(false)
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadNotifications(), 0)
    return () => window.clearTimeout(timeout)
  }, [])

  async function markAsRead(id: string) {
    const notification = notifications.find((item) => item.id === id)
    if (!notification || notification.read_at) return

    const readAt = new Date().toISOString()
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read_at: readAt } : item)),
    )

    const { error: updateError } = await createClient()
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", id)
      .eq("user_id", notification.user_id)

    if (updateError) {
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read_at: null } : item)),
      )
      setError("Status notifikasi gagal diperbarui.")
    }
  }

  async function markAllAsRead() {
    const unread = notifications.filter((notification) => !notification.read_at)
    if (!unread.length) return

    const readAt = new Date().toISOString()
    setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })))

    const { error: updateError } = await createClient()
      .from("notifications")
      .update({ read_at: readAt })
      .eq("user_id", unread[0].user_id)
      .is("read_at", null)

    if (updateError) {
      setError("Status notifikasi gagal diperbarui.")
      void loadNotifications()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ""}`}>
          <Bell aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-urgent px-1 font-mono text-[0.5625rem] font-bold leading-none text-white ring-2 ring-canvas">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="inset-y-0 left-auto right-0 flex h-dvh max-h-dvh w-full translate-x-0 translate-y-0 flex-col rounded-none border-y-0 border-r-0 p-0 sm:bottom-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[min(100vw,28rem)] sm:translate-x-0 sm:translate-y-0 sm:rounded-none sm:p-0">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              <DialogTitle>Notifikasi</DialogTitle>
              <DialogDescription>Update booking, pembayaran, venue, dan sistem.</DialogDescription>
            </div>
            {unreadCount > 0 && (
              <button className="mt-1 shrink-0 text-xs font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand" onClick={() => void markAllAsRead()}>
                Tandai semua dibaca
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
          {loading ? (
            <div className="space-y-3 p-5 sm:p-6" aria-label="Memuat notifikasi">
              {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-surface-muted" />)}
            </div>
          ) : error && !notifications.length ? (
            <div className="grid min-h-80 place-items-center px-8 text-center">
              <div>
                <CircleAlert className="mx-auto mb-3 size-8 text-error" aria-hidden="true" />
                <p className="text-sm font-bold text-ink">{error}</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => void loadNotifications()}>Coba lagi</Button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="grid min-h-80 place-items-center px-8 text-center">
              <div>
                <Bell className="mx-auto mb-3 size-8 text-ink-muted" aria-hidden="true" />
                <p className="font-bold text-ink">Belum ada notifikasi</p>
                <p className="mt-1 text-sm text-ink-muted">Update terbaru akan muncul di sini.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {error && <p className="bg-error/8 px-5 py-2 text-xs font-semibold text-error sm:px-6">{error}</p>}
              {notifications.map((notification) => {
                const style = typeStyles[notification.type as keyof typeof typeStyles] ?? typeStyles.SYSTEM
                const Icon = style.icon
                return (
                  <button
                    key={notification.id}
                    className={cn("flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand sm:px-6", !notification.read_at && "bg-brand/[0.035]")}
                    onClick={() => void markAsRead(notification.id)}
                    aria-label={`${notification.title}${notification.read_at ? "" : ", belum dibaca"}`}
                  >
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", style.className)}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span className="flex-1 text-sm font-bold text-ink">{notification.title}</span>
                        {!notification.read_at && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-ink-muted">{notification.message}</span>
                      <time className="mt-2 block font-mono text-[0.625rem] font-semibold uppercase tracking-wide text-ink-muted" dateTime={notification.created_at}>
                        {formatNotificationDate(notification.created_at)}
                      </time>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
