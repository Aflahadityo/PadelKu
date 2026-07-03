import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-border/50 animate-pulse rounded-control", className)}
      {...props}
    />
  )
}

export { Skeleton }
