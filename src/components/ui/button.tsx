import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "rounded-full bg-cta text-ink font-semibold focus-visible:outline-ink",
        secondary: "rounded-[12px] border border-border text-ink hover:bg-border/30 focus-visible:outline-brand",
        ghost: "text-brand underline-offset-2 hover:underline focus-visible:outline-brand",
        destructive: "rounded-[12px] border border-error text-error hover:bg-error/10 focus-visible:outline-error",
      },
      size: {
        default: "h-11 px-6 py-3 text-body",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-8 py-3 text-body font-semibold",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
