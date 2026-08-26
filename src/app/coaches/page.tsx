import type { Metadata } from "next"
import { CoachesHub } from "@/components/coaches/coaches-hub"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { getOptionalShellPlayer } from "@/lib/data/player"

export const metadata: Metadata = {
  title: "Pelatih Padel Bersertifikasi WPT / FIP | PadelKu",
  description: "Booking sesi coaching privat & klinik latihan bersama instruktur padel bersertifikasi internasional di Indonesia.",
}

export default async function CoachesPage() {
  const user = await getOptionalShellPlayer()

  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader user={user} />
      <main className="safe-area-x mx-auto max-w-6xl py-8">
        <CoachesHub />
      </main>
      <PlayerFooter />
      <MobileTabBar userRole={user?.role} />
    </div>
  )
}
