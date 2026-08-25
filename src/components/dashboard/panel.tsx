import { cn } from "@/lib/utils"

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-card border border-border bg-surface p-4 shadow-card sm:p-6", className)}>{children}</section>
}

export function SectionTitle({ children, detail }: { children: React.ReactNode; detail?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
      <h2 className="font-display text-h2 font-bold tracking-[-0.025em] text-ink">{children}</h2>
      {detail ? <div className="text-xs text-ink-muted">{detail}</div> : null}
    </div>
  )
}
