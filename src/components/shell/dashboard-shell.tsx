import { DashboardSidebar, type DashboardRole } from "@/components/shell/dashboard-sidebar"
import { DashboardTopbar } from "@/components/shell/dashboard-topbar"
import { type ShellUser } from "@/components/shell/user-menu"
import { cn } from "@/lib/utils"

export interface DashboardShellProps {
  children: React.ReactNode
  className?: string
  role: DashboardRole
  user: ShellUser
}

export function DashboardShell({ children, className, role, user }: DashboardShellProps) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]">
      <DashboardSidebar role={role} />
      <div className="min-w-0">
        <DashboardTopbar role={role} user={user} />
        <div className={cn("safe-area-x mx-auto w-full max-w-screen-2xl py-6 sm:py-8 lg:px-10 lg:py-10", className)}>
          {children}
        </div>
      </div>
    </div>
  )
}
