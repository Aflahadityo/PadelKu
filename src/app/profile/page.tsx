import { revalidatePath } from "next/cache"
import {
  LogOut,
  Mail,
  Star,
} from "lucide-react"
import { MobileTabBar } from "@/components/shell/mobile-tab-bar"
import { PlayerFooter } from "@/components/shell/player-footer"
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
  const [profile, reviews] = await Promise.all([
    getPlayerProfile(user.id),
    getPlayerReviews(user.id),
  ])

  return (
    <div className="min-h-dvh bg-canvas pb-24 md:pb-16 text-ink">
      <PlayerHeader user={{ email: profile.email, name: profile.fullName, role: "Player" }} />

      <main className="safe-area-x mx-auto max-w-4xl space-y-8 py-8">
        <PageHeader
          eyebrow="Akun Pemain PadelKu"
          title="Profil & Paspor Pemain"
          description="Kelola informasi kontak, pantau statistik bermain, dan lihat riwayat ulasan venue Anda."
        />

        {/* Player Passport HUD Card */}
        <section className="rounded-3xl border border-border/90 bg-surface p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-brand text-white font-display text-2xl font-black shadow-xs">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                    {profile.fullName}
                  </h2>
                  <span className="badge-turf text-[0.625rem] font-bold">
                    Pemain Terverifikasi
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Mail className="size-3.5" />
                  <span>{profile.email}</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand/30 bg-brand/5 px-4 py-2 text-right">
              <span className="text-[0.625rem] font-bold uppercase tracking-wider text-brand">
                Skill Level
              </span>
              <p className="font-mono text-sm font-black text-ink">NTRP 2.5 · Intermediate</p>
            </div>
          </div>

          {/* Player Quick Stats */}
          <div className="grid grid-cols-3 gap-3 border-t border-border/80 pt-5 text-center sm:text-left">
            <div className="space-y-0.5">
              <span className="text-[0.6875rem] font-medium text-ink-muted">Ulasan Diberikan</span>
              <p className="font-mono text-xl font-bold text-ink">{reviews.length}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[0.6875rem] font-medium text-ink-muted">Status Akun</span>
              <p className="font-mono text-sm font-bold text-success">Aktif / Pro Pass</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[0.6875rem] font-medium text-ink-muted">Fairplay Rating</span>
              <p className="font-mono text-xl font-bold text-brand">100%</p>
            </div>
          </div>
        </section>

        {/* Edit Profile Form */}
        <section className="rounded-3xl border border-border/90 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1 border-b border-border/80 pb-4">
            <h3 className="font-display text-lg font-bold text-ink">Informasi Akun</h3>
            <p className="text-xs text-ink-muted">
              Nomor telepon digunakan untuk pengiriman notifikasi slot dan koordinasi Open Match.
            </p>
          </div>

          <form action={updateProfile} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-bold text-ink">
                  Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile.fullName}
                  required
                  minLength={2}
                  maxLength={100}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold text-ink">
                  Nomor WhatsApp / Telepon
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile.phone ?? ""}
                  placeholder="+62 812-3456-7890"
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button type="submit" className="btn-cta text-xs font-bold px-6">
              Simpan Perubahan
            </Button>
          </form>
        </section>

        {/* My Reviews History */}
        <section className="rounded-3xl border border-border/90 bg-surface p-6 sm:p-8 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-ink">Ulasan Saya</h3>
            <p className="text-xs text-ink-muted">{reviews.length} ulasan venue tersimpan dari akun Anda.</p>
          </div>

          {reviews.length === 0 ? (
            <p className="py-4 text-xs text-ink-muted">Belum ada ulasan yang Anda tulis.</p>
          ) : (
            <div className="divide-y divide-border/80 border-t border-border/80">
              {reviews.map((r) => (
                <div key={r.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm font-bold text-ink">{r.venue?.name ?? "Venue Padel"}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`size-3 ${
                            idx < r.rating ? "fill-amber-400 text-amber-400" : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-ink-muted">&ldquo;{r.comment}&rdquo;</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Logout Section */}
        <div className="pt-2">
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="destructive" className="inline-flex items-center gap-2 text-xs font-bold">
              <LogOut className="size-4" />
              <span>Keluar dari Akun</span>
            </Button>
          </form>
        </div>
      </main>

      <PlayerFooter />
      <MobileTabBar />
    </div>
  )
}
