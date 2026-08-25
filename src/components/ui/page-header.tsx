import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  actions?: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  title: React.ReactNode
}

function PageHeader({ actions, className, description, eyebrow, title, ...props }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "grid gap-5 border-b border-border pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:pb-8",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-h1 font-bold tracking-[-0.045em] text-ink">{title}</h1>
        {description ? (
          <div className="mt-3 max-w-[65ch] text-body leading-6 text-ink-muted">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div> : null}
    </header>
  )
}

export { PageHeader }
