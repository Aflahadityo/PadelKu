import type { Metadata } from "next"
import { DashboardShell } from "@/components/shell/dashboard-shell"
import { requireRole } from "@/lib/dashboard/auth"

export const metadata: Metadata = {
  title: "Admin Console | PadelKu",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { actor } = await requireRole("ADMIN")
  return (
    <DashboardShell role="admin" user={{ email: actor.email, name: actor.fullName, role: "Administrator" }}>
      {children}
    </DashboardShell>
  )
}
