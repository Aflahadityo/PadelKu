import { User, Settings, LogOut, ChevronRight, Calendar, Star, HelpCircle } from "lucide-react"
import Link from "next/link"

const menuItems = [
  { icon: Calendar, label: "Booking Saya", href: "/bookings" },
  { icon: Star, label: "Ulasan Saya", href: "/profile/reviews" },
  { icon: Settings, label: "Pengaturan", href: "/profile/settings" },
  { icon: HelpCircle, label: "Bantuan", href: "/profile/help" },
]

export default function ProfilePage() {
  return (
    <div className="space-y-6 pt-4 pb-8">
      {/* User info */}
      <div className="flex items-center gap-4 bg-surface rounded-card shadow-card p-5">
        <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center">
          <User className="w-8 h-8 text-brand" />
        </div>
        <div>
          <h1 className="text-h2 font-display text-ink">Rizky Pratama</h1>
          <p className="text-body text-ink-muted">rizky@padelku.id</p>
          <p className="text-caption text-brand font-medium">Player</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-surface rounded-card shadow-card divide-y divide-border">
        {menuItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-4 active:bg-border/20 transition-colors"
          >
            <Icon className="w-5 h-5 text-ink-muted" />
            <span className="text-body text-ink flex-1">{label}</span>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button className="flex items-center gap-3 p-4 w-full text-error">
        <LogOut className="w-5 h-5" />
        <span className="text-body font-medium">Keluar</span>
      </button>
    </div>
  )
}
