import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20 px-4 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-h1 font-display text-ink">Masuk</h1>
        <p className="text-body text-ink-muted mt-2">
          Masuk ke akun PadelKu kamu
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <Button variant="primary" className="w-full" size="lg">
          Masuk
        </Button>
      </form>

      <p className="text-center text-body text-ink-muted mt-6">
        Belum punya akun?{" "}
        <Link href="/register" className="text-brand font-medium hover:underline">
          Daftar
        </Link>
      </p>

      {/* Demo credentials hint */}
      <div className="mt-8 bg-border/30 rounded-control p-4 text-caption text-ink-muted space-y-1">
        <p className="font-medium text-ink">Akun Demo:</p>
        <p>Player: player@padelku.id / password123</p>
        <p>Venue Owner: owner@padelku.id / password123</p>
        <p>Admin: admin@padelku.id / password123</p>
      </div>
    </div>
  )
}
