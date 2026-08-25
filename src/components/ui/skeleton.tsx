import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-skeleton rounded-control bg-surface-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
