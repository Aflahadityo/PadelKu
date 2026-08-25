"use client"

import * as React from "react"
import { LoaderCircle } from "lucide-react"
import { useFormStatus } from "react-dom"
import { Button, type ButtonProps } from "@/components/ui/button"

export interface SubmitButtonProps extends ButtonProps {
  pendingLabel?: React.ReactNode
}

function SubmitButton({ children, disabled, pendingLabel = "Memproses", ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" aria-disabled={pending || disabled} disabled={pending || disabled} {...props}>
      {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel : children}
    </Button>
  )
}

export { SubmitButton }
