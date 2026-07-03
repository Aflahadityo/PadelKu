import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20 px-4 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-h1 font-display text-ink">Daftar</h1>
        <p className="text-body text-ink-muted mt-2">
          Buat akun PadelKu baru
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input id="name" placeholder="Nama kamu" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">No. WhatsApp (opsional)</Label>
          <Input id="phone" type="tel" placeholder="0812xxxxxxx" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <Input id="password" type="password" placeholder="Min. 8 karakter" />
        </div>
        <Button variant="primary" className="w-full" size="lg">
          Daftar
        </Button>
      </form>

      <p className="text-center text-body text-ink-muted mt-6">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-brand font-medium hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  )
}
