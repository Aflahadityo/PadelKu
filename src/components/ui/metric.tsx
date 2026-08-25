import * as React from "react"
import { cn } from "@/lib/utils"

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  detail?: React.ReactNode
  label: React.ReactNode
  value: React.ReactNode
}

function Metric({ className, detail, label, value, ...props }: MetricProps) {
  return (
    <div className={cn("border-l-2 border-brand pl-4", className)} {...props}>
      <p className="text-xs font-semibold tracking-[0.08em] text-ink-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums sm:text-3xl">
        {value}
      </p>
      {detail ? <div className="mt-2 text-xs leading-5 text-ink-muted">{detail}</div> : null}
    </div>
  )
}

export { Metric }
