import type { Metadata } from "next"
import { CommunityHub } from "@/components/community/community-hub"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { getOptionalShellPlayer } from "@/lib/data/player"

export const metadata: Metadata = {
  title: "Leaderboard & Turnamen Padel Indonesia | PadelKu",
  description: "Lihat peringkat pemain padel nasional, kumpulkan poin NTRP, dan ikuti turnamen resmi padel di Indonesia.",
}

export default async function CommunityPage() {
  const user = await getOptionalShellPlayer()

  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader user={user} />
      <main className="safe-area-x mx-auto max-w-6xl py-8">
        <CommunityHub />
      </main>
      <PlayerFooter />
      <MobileTabBar userRole={user?.role} />
    </div>
  )
}
