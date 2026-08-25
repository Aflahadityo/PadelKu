import * as React from "react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  action?: React.ReactNode
  description: React.ReactNode
  icon?: React.ReactNode
  title: React.ReactNode
}

function EmptyState({ action, className, description, icon, title, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-border px-4 py-14 text-center sm:px-8 sm:py-20",
        className,
      )}
      {...props}
    >
      <span className="absolute left-1/2 top-0 h-full w-px bg-border/60" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        {icon ? (
          <div className="mb-5 grid size-12 place-items-center rounded-control border border-border-strong/70 bg-surface text-brand [&_svg]:size-5">
            {icon}
          </div>
        ) : null}
        <h2 className="font-display text-2xl font-bold tracking-[-0.025em] text-ink">{title}</h2>
        <div className="mt-2 text-sm leading-6 text-ink-muted">{description}</div>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  )
}

export { EmptyState }
