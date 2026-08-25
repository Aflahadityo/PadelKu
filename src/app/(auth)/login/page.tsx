import Link from "next/link"
import { safeRedirectPath } from "@/lib/auth"
import { AuthForm } from "../auth-form"

const messages: Record<string, string> = {
  "password-updated": "Kata sandi berhasil diperbarui. Silakan masuk kembali.",
}

const errors: Record<string, string> = {
  auth: "Tautan autentikasi tidak valid atau sudah kedaluwarsa.",
  profile: "Profil akun belum tersedia. Hubungi dukungan PadelKu.",
  configuration: "Supabase belum dikonfigurasi untuk environment ini.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; message?: string; error?: string }>
}) {
  const params = await searchParams
  const initialMessage = params.error
    ? errors[params.error] ?? "Autentikasi gagal. Silakan coba lagi."
    : params.message
      ? messages[params.message]
      : undefined

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-brand">Selamat datang kembali</p>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">Masuk dan main.</h1>
        <p className="mt-3 max-w-sm text-base leading-7 text-ink-muted">Booking lapangan, cek jadwal, dan kelola pertandingan dari satu tempat.</p>
      </div>
      <AuthForm
        kind="login"
        next={params.next ? safeRedirectPath(params.next, "/") : undefined}
        initialMessage={initialMessage}
        initialStatus={params.error ? "error" : "success"}
        showDemo={process.env.NODE_ENV === "development"}
      />
      <p className="mt-7 text-center text-sm text-ink-muted">
        Belum punya akun? <Link href="/register" className="font-semibold text-brand hover:underline">Daftar sekarang</Link>
      </p>
    </div>
  )
}
