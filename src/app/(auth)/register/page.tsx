import Link from "next/link"
import { AuthForm } from "../auth-form"

export default function RegisterPage() {
  return (
    <div className="w-full py-4">
      <div className="mb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-brand">Mulai di sini</p>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">Buat akun PadelKu.</h1>
        <p className="mt-3 text-base leading-7 text-ink-muted">Pilih akun pemain atau mitra venue. Akun admin tidak dapat didaftarkan publik.</p>
      </div>
      <AuthForm kind="register" />
      <p className="mt-7 text-center text-sm text-ink-muted">
        Sudah punya akun? <Link href="/login" className="font-semibold text-brand hover:underline">Masuk</Link>
      </p>
    </div>
  )
}
