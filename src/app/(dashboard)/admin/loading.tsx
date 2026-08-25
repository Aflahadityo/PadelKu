import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <main className="space-y-8" aria-busy="true" aria-label="Memuat admin console">
      <div className="space-y-3 border-b border-border pb-8"><Skeleton className="h-3 w-32" /><Skeleton className="h-12 w-72 max-w-full" /><Skeleton className="h-5 w-[32rem] max-w-full" /></div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>
      <Skeleton className="h-[32rem]" />
    </main>
  )
}
