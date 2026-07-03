import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[12px] px-3 py-1 text-caption font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border border-border text-ink-muted",
        success: "border border-[color:var(--color-success)] text-[color:var(--color-success)] bg-[color:var(--color-success)]/10",
        urgent: "border border-[color:var(--color-urgent)] text-[color:var(--color-urgent)] bg-[color:var(--color-urgent)]/10",
        brand: "border border-brand text-brand bg-brand/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
