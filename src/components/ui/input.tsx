import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex min-h-11 w-full rounded-control border border-border-strong/80 bg-surface px-3.5 py-2.5 text-body text-ink shadow-[inset_0_1px_0_rgb(23_33_27/0.025)] transition-[border-color,box-shadow,background-color] placeholder:text-ink-muted/80 hover:border-ink-muted focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-65 aria-invalid:border-error aria-invalid:ring-3 aria-invalid:ring-error/12",
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = "Input"

export { Input }
