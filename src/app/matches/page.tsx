import type { Metadata } from "next"
import { MatchesHub } from "@/components/matches/matches-hub"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { getOptionalShellPlayer } from "@/lib/data/player"

export const metadata: Metadata = {
  title: "Cari Lawan Sparring & Open Match | PadelKu",
  description: "Cari lawan tanding padel di berbagai kota di Indonesia. Sesuaikan level NTRP dan split bill otomatis via QRIS/VA.",
}

export default async function MatchesPage() {
  const user = await getOptionalShellPlayer()

  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader user={user} />
      <main className="safe-area-x mx-auto max-w-6xl py-8">
        <MatchesHub />
      </main>
      <PlayerFooter />
      <MobileTabBar userRole={user?.role} />
    </div>
  )
}
