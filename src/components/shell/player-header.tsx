"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MapPin,
  Sparkles,
  Menu,
  X,
  Calendar,
  Search,
  Grid,
  Crown,
  User,
  ChevronDown,
  Building2,
  ArrowRight,
} from "lucide-react"
import { BrandMark } from "@/components/shell/brand-mark"
import { DesktopNav, type PlayerNavItem } from "@/components/shell/desktop-nav"
import { NotificationDrawer } from "@/components/shell/notification-drawer"
import { type ShellUser, UserMenu } from "@/components/shell/user-menu"
import { Button } from "@/components/ui/button"
import { cn, isRouteActive } from "@/lib/utils"

export interface PlayerHeaderProps {
  className?: string
  navItems?: PlayerNavItem[]
  user?: ShellUser | null
}

const cities = [
  { name: "Semua Kota", label: "Indonesia", count: "18 Venues" },
  { name: "Jakarta Selatan", label: "Kemang & TB Simatupang", count: "6 Venues" },
  { name: "Jakarta Pusat", label: "Senayan & SCBD", count: "4 Venues" },
  { name: "BSD / Tangerang", label: "BSD City", count: "3 Venues" },
  { name: "Bali", label: "Canggu & Seminyak", count: "3 Venues" },
  { name: "Bandung", label: "Dago & Riau", count: "1 Venue" },
  { name: "Surabaya", label: "Pusat & Barat", count: "1 Venue" },
]

export function PlayerHeader({ className, navItems, user }: PlayerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState("Indonesia")
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Track scroll position for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "safe-area-top sticky top-0 z-50 transition-all duration-200",
        isScrolled
          ? "border-b border-border bg-canvas/95 backdrop-blur-xl shadow-xs"
          : "border-b border-border/70 bg-canvas/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="safe-area-x mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Location selector */}
        <div className="flex items-center gap-3 sm:gap-4">
          <BrandMark />

          {/* Location quick dropdown (Desktop) */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/90 bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs hover:border-brand/50 hover:bg-surface-muted transition-all"
              aria-expanded={cityDropdownOpen}
              aria-haspopup="true"
            >
              <MapPin className="size-3.5 text-brand" aria-hidden="true" />
              <span>{selectedCity}</span>
              <ChevronDown className={cn("size-3 text-ink-muted transition-transform", cityDropdownOpen && "rotate-180")} />
            </button>

            {/* City Dropdown Menu */}
            {cityDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCityDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-surface p-2 shadow-float animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-border/70">
                    <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                      Pilih Wilayah Venue
                    </span>
                  </div>
                  <div className="py-1 space-y-0.5">
                    {cities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => {
                          setSelectedCity(city.name === "Semua Kota" ? "Indonesia" : city.name)
                          setCityDropdownOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors",
                          (selectedCity === city.name || (selectedCity === "Indonesia" && city.name === "Semua Kota"))
                            ? "bg-brand/10 text-brand font-bold"
                            : "text-ink hover:bg-surface-muted",
                        )}
                      >
                        <div>
                          <span className="block font-semibold">{city.name}</span>
                          <span className="text-[0.625rem] text-ink-muted">{city.label}</span>
                        </div>
                        <span className="font-mono text-[0.625rem] text-ink-muted">{city.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <DesktopNav className="hidden md:flex" items={navItems} />

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Open Match Badge (Desktop) */}
          <Link
            href="/#community-matches"
            className="hidden items-center gap-1.5 rounded-full border border-urgent/30 bg-urgent/10 px-3 py-1.5 text-xs font-bold text-urgent transition-colors hover:bg-urgent/15 xl:inline-flex"
          >
            <Sparkles className="size-3.5 animate-pulse" />
            <span>Open Match</span>
          </Link>

          {/* Mitra Venue CTA (Tablet/Desktop) */}
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-bold px-3">
            <Link href="/venue-owner">
              <Building2 className="size-3.5 text-brand" />
              <span>Mitra Venue</span>
            </Link>
          </Button>

          {user && <NotificationDrawer />}

          {/* User Profile / Login Action */}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Button asChild className="btn-cta text-xs font-bold px-4 py-2 min-h-9 h-9 shadow-xs" size="sm">
              <Link href="/login">Masuk</Link>
            </Button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-ink hover:bg-surface-muted transition-colors md:hidden"
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface/98 backdrop-blur-2xl px-4 pt-3 pb-6 md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {/* City Selector in Mobile Drawer */}
            <div className="rounded-2xl border border-border/80 bg-surface-muted/70 p-3">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-ink">
                <MapPin className="size-3.5 text-brand" />
                <span>Pilih Wilayah:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Semua Kota", "Kemang", "Senayan", "BSD", "Bali", "Bandung"].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city === "Semua Kota" ? "Indonesia" : city)
                      setMobileMenuOpen(false)
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[0.6875rem] font-semibold transition-all",
                      (selectedCity === city || (selectedCity === "Indonesia" && city === "Semua Kota"))
                        ? "bg-ink text-white"
                        : "bg-surface border border-border text-ink-muted hover:text-ink",
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="grid gap-1">
              {[
                { href: "/", label: "Cari Lapangan Padel", icon: Search },
                { href: "/matches", label: "Open Match (Komunitas)", icon: Sparkles, isHot: true },
                { href: "/coaches", label: "Pelatih Padel Bersertifikasi", icon: User },
                { href: "/equipment", label: "Sewa Raket & Alat", icon: Grid },
                { href: "/community", label: "Leaderboard & Turnamen", icon: Crown },
                { href: "/membership", label: "Membership VIP", icon: Crown },
                { href: "/bookings", label: "Tiket & Booking Saya", icon: Calendar },
                { href: "/help", label: "Pusat Bantuan & FAQ", icon: Search },
              ].map(({ href, label, icon: Icon, isHot }) => {
                const active = isRouteActive(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors",
                      active
                        ? "bg-brand/10 text-brand"
                        : "text-ink hover:bg-surface-muted",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 text-brand" />
                      <span>{label}</span>
                    </div>
                    {isHot && (
                      <span className="badge-coral text-[0.625rem] font-bold">
                        🔥 HOT
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Venue Partner link */}
            <div className="pt-2 border-t border-border/70 flex items-center justify-between">
              <Link
                href="/venue-owner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-brand hover:underline"
              >
                <Building2 className="size-4" />
                <span>Daftarkan Venue Padel Anda</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
