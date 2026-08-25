"use client"

import { useActionState } from "react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InlineAlert } from "@/components/ui/inline-alert"
import { cn } from "@/lib/utils"
import { initialActionState, type ActionState } from "@/lib/dashboard/types"

type DashboardAction = (state: ActionState, formData: FormData) => Promise<ActionState>

type DashboardFormProps = {
  action: DashboardAction
  children: React.ReactNode
  className?: string
  disabled?: boolean
  pendingLabel?: string
  submitLabel: string
  variant?: "action" | "destructive" | "secondary"
}

export function DashboardForm({
  action,
  children,
  className,
  disabled,
  pendingLabel = "Menyimpan",
  submitLabel,
  variant = "action",
}: DashboardFormProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState)

  return (
    <form action={formAction} className={cn("space-y-6", className)}>
      {children}
      {state.status !== "idle" ? (
        <InlineAlert
          variant={state.status === "error" ? "error" : state.status === "warning" ? "warning" : "success"}
          aria-live="polite"
        >
          {state.message}
          {state.fieldErrors ? (
            <ul className="mt-1 list-disc pl-5">
              {Object.entries(state.fieldErrors).flatMap(([field, messages]) =>
                messages.map((message) => <li key={`${field}-${message}`}>{message}</li>),
              )}
            </ul>
          ) : null}
        </InlineAlert>
      ) : null}
      <Button type="submit" variant={variant} disabled={disabled || pending} aria-disabled={disabled || pending}>
        {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  )
}
