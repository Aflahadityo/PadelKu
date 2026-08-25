"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RotateCcw } from "lucide-react"
import { BrandMark } from "@/components/shell/brand-mark"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="relative grid min-h-dvh overflow-hidden px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.65fr)] lg:p-10">
      <div className="flex flex-col">
        <BrandMark />
        <div className="my-auto max-w-2xl py-20">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-error">
            Gangguan sistem
          </p>
          <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.86] tracking-[-0.06em] text-ink">
            Permainan tertunda.
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-ink-muted">
            Kami tidak dapat memuat halaman ini. Coba ulangi permintaan atau kembali mencari venue.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={retry}>
              <RotateCcw aria-hidden="true" />
              Coba lagi
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Kembali ke beranda</Link>
            </Button>
          </div>
          {error.digest ? (
            <p className="mt-8 font-mono text-xs text-ink-muted">Referensi: {error.digest}</p>
          ) : null}
        </div>
      </div>
      <div className="relative hidden border-l border-border lg:block" aria-hidden="true">
        <span className="absolute left-1/2 top-0 h-full w-px bg-border" />
        <span className="absolute left-0 top-1/2 h-px w-full bg-border" />
        <span className="absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-coral/60" />
      </div>
    </section>
  )
}
