import type { Metadata } from "next"
import { EquipmentHub } from "@/components/equipment/equipment-hub"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { getOptionalShellPlayer } from "@/lib/data/player"

export const metadata: Metadata = {
  title: "Sewa Raket & Perlengkapan Padel | PadelKu",
  description: "Sewa raket padel pro tour (Bullpadel, Babolat, Head, Nox) dan beli bola padel resmi langsung siap diambil di arena.",
}

export default async function EquipmentPage() {
  const user = await getOptionalShellPlayer()

  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader user={user} />
      <main className="safe-area-x mx-auto max-w-6xl py-8">
        <EquipmentHub />
      </main>
      <PlayerFooter />
      <MobileTabBar userRole={user?.role} />
    </div>
  )
}
