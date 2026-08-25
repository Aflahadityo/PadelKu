import { revalidatePath } from "next/cache"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerHeader } from "@/components/shell/player-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { requireUser } from "@/lib/auth"
import { getPlayerProfile, getPlayerReviews, updatePlayerProfile } from "@/lib/data/player"

async function updateProfile(formData: FormData) {
  "use server"
  const user = await requireUser()
  const fullName = String(formData.get("fullName") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  if (fullName.length < 2 || fullName.length > 100) return
  if (phone && !/^\+?[0-9][0-9 -]{7,19}$/.test(phone)) return
  await updatePlayerProfile(user.id, { fullName, phone: phone || null })
  revalidatePath("/profile")
}

export default async function ProfilePage() {
  const user = await requireUser()
  const [profile, reviews] = await Promise.all([getPlayerProfile(user.id), getPlayerReviews(user.id)])
  return <div className="min-h-dvh bg-canvas pb-24 md:pb-16"><PlayerHeader user={{ email: profile.email, name: profile.fullName, role: "Player" }} /><main className="safe-area-x mx-auto max-w-3xl space-y-8 py-8"><PageHeader eyebrow="Akun player" title={profile.fullName} description={profile.email} />
    <form action={updateProfile} className="grid gap-5 border-y border-border py-6 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="fullName">Nama lengkap</Label><Input id="fullName" name="fullName" defaultValue={profile.fullName} required minLength={2} maxLength={100} /></div><div className="space-y-2"><Label htmlFor="phone">Nomor telepon</Label><Input id="phone" name="phone" defaultValue={profile.phone ?? ""} /></div><Button type="submit" className="sm:col-span-2 sm:justify-self-start">Simpan profil</Button></form>
    <section><h2 className="font-display text-2xl font-bold">Ulasan saya</h2><p className="mt-2 text-sm text-ink-muted">{reviews.length} ulasan venue tersimpan.</p></section>
    <form action="/api/auth/logout" method="post"><Button type="submit" variant="destructive">Keluar dari akun</Button></form>
  </main><MobileTabBar /></div>
}
