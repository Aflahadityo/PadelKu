import Link from "next/link"
import { ArrowUpRight, ShieldCheck } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative left-1/2 -mb-20 min-h-[100dvh] w-screen -translate-x-1/2 overflow-hidden bg-canvas lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-ink p-10 text-canvas lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute -right-24 top-1/2 h-[620px] w-[440px] -translate-y-1/2 rotate-12 rounded-[220px] border border-canvas/50" />
          <div className="absolute -right-4 top-1/2 h-px w-[620px] -translate-y-1/2 rotate-12 bg-canvas/50" />
          <div className="absolute right-40 top-1/2 h-[620px] w-px -translate-y-1/2 rotate-12 bg-canvas/40" />
        </div>

        <Link href="/" className="relative z-[1] inline-flex w-fit items-center gap-3 font-display text-2xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta">
          <span className="grid size-10 place-items-center rounded-full bg-cta text-sm font-bold text-ink">PK</span>
          PadelKu
        </Link>

        <div className="relative z-[1] max-w-xl pb-6">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-cta">Main lebih dekat</p>
          <h2 className="max-w-lg font-display text-5xl font-semibold leading-[0.98] tracking-[-0.04em] xl:text-6xl">
            Satu akun untuk setiap pertandingan.
          </h2>
          <div className="mt-10 flex items-center gap-5 border-t border-canvas/20 pt-6 text-sm text-canvas/75">
            <ShieldCheck className="size-5 text-cta" aria-hidden="true" />
            <span>Sesi terenkripsi. Password dikelola aman oleh Supabase.</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-[100dvh] flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-20">
        <header className="flex h-14 items-center justify-between lg:justify-end">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-semibold text-ink lg:hidden">
            <span className="grid size-9 place-items-center rounded-full bg-ink text-xs text-cta">PK</span>
            PadelKu
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-brand">
            Lihat venue <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </header>
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-8 sm:py-12">
          {children}
        </div>
        <footer className="mx-auto w-full max-w-md border-t border-border py-5 text-xs leading-5 text-ink-muted">
          Dengan melanjutkan, kamu menyetujui{" "}
          <Link href="/terms" className="font-semibold text-ink hover:text-brand hover:underline">
            ketentuan penggunaan
          </Link>{" "}
          dan{" "}
          <Link href="/privacy" className="font-semibold text-ink hover:text-brand hover:underline">
            kebijakan privasi
          </Link>{" "}
          PadelKu.
        </footer>
      </section>
    </div>
  )
}
