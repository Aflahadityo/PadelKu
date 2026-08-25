import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthForm } from "../auth-form"

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <Link href="/login" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke masuk
      </Link>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">Pulihkan akses.</h1>
        <p className="mt-3 max-w-sm text-base leading-7 text-ink-muted">Masukkan email akun. Kami akan mengirim tautan untuk membuat kata sandi baru.</p>
      </div>
      <AuthForm kind="forgot" />
    </div>
  )
}
