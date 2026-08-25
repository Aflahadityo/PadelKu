import * as React from "react"
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "grid grid-cols-[auto_1fr] gap-x-3 rounded-control border px-4 py-3 text-sm leading-6",
  {
    variants: {
      variant: {
        info: "border-info/25 bg-info/8 text-info",
        success: "border-success/25 bg-success/8 text-success",
        warning: "border-warning/25 bg-warning/8 text-warning",
        error: "border-error/25 bg-error/8 text-error",
      },
    },
    defaultVariants: { variant: "info" },
  },
)

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
}

export interface InlineAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
}

function InlineAlert({ children, className, title, variant = "info", ...props }: InlineAlertProps) {
  const Icon = icons[variant ?? "info"]

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="mt-0.5 size-5" aria-hidden="true" />
      <div>
        {title ? <p className="font-semibold text-current">{title}</p> : null}
        <div className="text-current/85">{children}</div>
      </div>
    </div>
  )
}

export { InlineAlert, alertVariants }
