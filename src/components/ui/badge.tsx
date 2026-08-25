import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-caption font-semibold leading-none tracking-[0.01em] [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-border-strong/70 bg-surface text-ink-muted",
        neutral: "border-border-strong/70 bg-surface-muted text-ink",
        success: "border-success/25 bg-success/10 text-success",
        warning: "border-warning/25 bg-warning/10 text-warning",
        pending: "border-warning/25 bg-warning/10 text-warning",
        info: "border-info/25 bg-info/10 text-info",
        error: "border-error/25 bg-error/10 text-error",
        destructive: "border-error/25 bg-error/10 text-error",
        available: "border-success/25 bg-success/10 text-success",
        booked: "border-border bg-surface-muted text-ink-muted",
        cancelled: "border-error/25 bg-error/10 text-error",
        brand: "border-brand/25 bg-brand/10 text-brand-strong",
        urgent: "border-urgent/25 bg-urgent/10 text-error",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
