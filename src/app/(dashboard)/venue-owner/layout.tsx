import type { Metadata } from "next"
import { DashboardShell } from "@/components/shell/dashboard-shell"
import { requireRole } from "@/lib/dashboard/auth"

export const metadata: Metadata = { title: "Venue Workspace | PadelKu", robots: { index: false, follow: false } }

export default async function OwnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { actor } = await requireRole("VENUE_OWNER")
  return <DashboardShell role="owner" user={{ email: actor.email, name: actor.fullName, role: "Venue Owner" }}>{children}</DashboardShell>
}
