import Link from "next/link"
import { ArrowUpRight, Search } from "lucide-react"
import { BrandMark } from "@/components/shell/brand-mark"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden px-4 py-6 sm:px-8 lg:p-10">
      <BrandMark />
      <div className="my-auto grid items-end gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Di luar garis
          </p>
          <p className="mt-4 font-display text-display font-bold tracking-[-0.075em] text-ink" aria-hidden="true">
            404
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2rem,5vw,4.25rem)] font-bold leading-[0.95] tracking-[-0.05em] text-ink">
            Halaman ini tidak ada di lapangan.
          </h1>
        </div>
        <div className="border-t border-ink pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-sm leading-6 text-ink-muted">
            Tautan mungkin sudah berubah. Kembali ke daftar venue untuk melanjutkan pencarian jadwal.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <Link href="/">
                <Search aria-hidden="true" />
                Cari venue
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/bookings">
                Lihat booking saya
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
