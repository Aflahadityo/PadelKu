import type { Metadata } from "next"
import { HelpHub } from "@/components/help/help-hub"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
import { PlayerHeader } from "@/components/shell/player-header"
import { getOptionalShellPlayer } from "@/lib/data/player"

export const metadata: Metadata = {
  title: "Pusat Bantuan & FAQ | PadelKu",
  description: "Pusat bantuan resmi PadelKu. Temukan jawaban seputar cara booking, kebijakan refund 24 jam, panduan split bill, dan kemitraan venue.",
}

export default async function HelpPage() {
  const user = await getOptionalShellPlayer()

  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader user={user} />
      <main className="safe-area-x mx-auto max-w-5xl py-8">
        <HelpHub />
      </main>
      <PlayerFooter />
      <MobileTabBar userRole={user?.role} />
    </div>
  )
}
