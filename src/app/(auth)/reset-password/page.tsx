import { AuthForm } from "../auth-form"

export default function ResetPasswordPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-brand">Amankan akun</p>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">Kata sandi baru.</h1>
        <p className="mt-3 max-w-sm text-base leading-7 text-ink-muted">Gunakan minimal 8 karakter yang tidak dipakai di layanan lain.</p>
      </div>
      <AuthForm kind="reset" />
    </div>
  )
}
