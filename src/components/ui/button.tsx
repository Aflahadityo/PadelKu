import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control border text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-snappy active:translate-y-px active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        booking:
          "border-booking bg-booking text-ink shadow-[inset_0_-2px_0_rgb(23_33_27/0.14)] hover:bg-booking-hover focus-visible:outline-ink",
        action:
          "border-brand bg-brand text-white shadow-[inset_0_-1px_0_rgb(0_0_0/0.18)] hover:border-brand-strong hover:bg-brand-strong focus-visible:outline-brand",
        secondary:
          "border-border-strong bg-surface text-ink hover:border-ink-muted hover:bg-surface-muted focus-visible:outline-brand",
        ghost:
          "border-transparent bg-transparent text-ink hover:bg-surface-muted focus-visible:outline-brand",
        destructive:
          "border-error/35 bg-transparent text-error hover:bg-error/8 focus-visible:outline-error",
        primary:
          "border-brand bg-brand text-white shadow-[inset_0_-1px_0_rgb(0_0_0/0.18)] hover:border-brand-strong hover:bg-brand-strong focus-visible:outline-brand",
      },
      size: {
        default: "px-5 py-2.5",
        sm: "min-h-11 px-3.5 py-2 text-xs",
        lg: "min-h-12 px-7 py-3 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "action",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ className, size, variant }))}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
