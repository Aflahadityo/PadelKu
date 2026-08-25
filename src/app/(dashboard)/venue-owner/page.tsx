import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { OwnerDashboardWorkbench } from "@/components/dashboard/owner-dashboard-workbench"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { getOwnerOverview } from "@/lib/dashboard/owner-data"

export default async function VenueOwnerDashboard() {
  const data = await getOwnerOverview()

  return (
    <main className="space-y-8">
      {/* Page Header */}
      <PageHeader
        eyebrow="Portal Pengelola Venue"
        title="Workspace Operasional Arena"
        description="Kelola jadwal lapangan, pantau reservasi masuk secara real-time, dan atur pencairan dana bagi hasil."
        actions={
          <div className="flex items-center gap-2.5">
            <Button asChild variant="secondary" className="text-xs font-bold shadow-2xs">
              <Link href="/" target="_blank">
                <span>Lihat Marketplace</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* Unified Interactive Workbench */}
      <OwnerDashboardWorkbench
        venues={data.venues}
        bookings={data.bookings}
        grossSettledRupiah={data.grossSettledRupiah}
        platformFeeRupiah={data.platformFeeRupiah}
        venueNetRupiah={data.venueNetRupiah}
      />
    </main>
  )
}
