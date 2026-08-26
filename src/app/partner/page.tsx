import type { Metadata } from "next"
import { PartnerHub } from "@/components/partner/partner-hub"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { getOptionalShellPlayer } from "@/lib/data/player"

export const metadata: Metadata = {
  title: "Gabung Jadi Mitra Venue Padel | PadelKu",
  description: "Daftarkan arena padel Anda di marketplace PadelKu. Dapatkan sistem booking real-time, anti-double booking, dan bagi hasil transparan 95% net payout.",
}

export default async function PartnerPage() {
  const user = await getOptionalShellPlayer()

  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader user={user} />
      <main className="safe-area-x mx-auto max-w-6xl py-8">
        <PartnerHub />
      </main>
      <PlayerFooter />
      <MobileTabBar userRole={user?.role} />
    </div>
  )
}
