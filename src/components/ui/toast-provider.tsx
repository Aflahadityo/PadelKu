"use client"

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"

type ToastKind = "success" | "error" | "info"

export function Toaster() {
  return (
    <SonnerToaster
      closeButton
      richColors
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "!rounded-control !border-border !bg-surface-raised !font-body !text-ink !shadow-float",
          description: "!text-ink-muted",
          actionButton: "!bg-brand !text-white",
          cancelButton: "!bg-surface-muted !text-ink",
        },
      }}
    />
  )
}

export const toast = sonnerToast

export function useToast() {
  return {
    toasts: [],
    toast(message: string, type: ToastKind = "info") {
      return sonnerToast[type](message)
    },
  }
}
