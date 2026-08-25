import { Input, type InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export const selectClassName =
  "min-h-11 w-full rounded-control border border-border-strong/80 bg-surface px-3.5 py-2.5 text-body text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/15 disabled:bg-surface-muted"

export const textareaClassName =
  "min-h-28 w-full resize-y rounded-control border border-border-strong/80 bg-surface px-3.5 py-2.5 text-body text-ink placeholder:text-ink-muted/80 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/15 disabled:bg-surface-muted"

type FieldProps = InputProps & {
  hint?: string
  label: string
}

export function Field({ className, hint, id, label, name, required, ...props }: FieldProps) {
  const inputId = id ?? name
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {label}
        {required ? <span className="ml-1 text-error" aria-hidden="true">*</span> : null}
      </Label>
      <Input className={cn(className)} id={inputId} name={name} required={required} {...props} />
      {hint ? <p className="text-xs leading-5 text-ink-muted">{hint}</p> : null}
    </div>
  )
}
