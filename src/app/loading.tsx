import { BrandMark } from "@/components/shell/brand-mark"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-screen-2xl px-4 py-5 sm:px-6 lg:px-10">
      <header className="flex h-14 items-center justify-between border-b border-border pb-4">
        <BrandMark />
        <Skeleton className="h-11 w-28" />
      </header>
      <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,1.2fr)] lg:py-16">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Menyiapkan lapangan
          </p>
          <Skeleton className="mt-5 h-14 w-[min(100%,32rem)]" />
          <Skeleton className="mt-3 h-6 w-[min(80%,24rem)]" />
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border">
          <Skeleton className="h-48 rounded-none bg-surface sm:h-60" />
          <Skeleton className="h-48 rounded-none bg-surface sm:h-60" />
          <Skeleton className="col-span-2 h-28 rounded-none bg-surface sm:h-36" />
        </div>
      </div>
      <span className="sr-only" role="status">Memuat PadelKu</span>
    </div>
  )
}
