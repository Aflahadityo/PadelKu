"use server"

import "server-only"

import { headers } from "next/headers"
import { redirect, unstable_rethrow } from "next/navigation"
import { z } from "zod"
import {
  forgotPasswordSchema,
  getProfileByAuthId,
  homeForRole,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  safeRedirectPath,
} from "@/lib/auth"
import { SupabaseConfigurationError } from "@/lib/env"
import { createServerSupabase } from "@/lib/supabase/server"

export type AuthActionState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: Record<string, string[] | undefined>
}

export const initialAuthState: AuthActionState = { status: "idle" }

function invalidState(error: z.ZodError): AuthActionState {
  return {
    status: "error",
    message: "Periksa kembali data yang ditandai.",
    fieldErrors: z.flattenError(error).fieldErrors,
  }
}

function expectedError(error: unknown): AuthActionState {
  if (error instanceof SupabaseConfigurationError) {
    return { status: "error", message: error.message }
  }
  return {
    status: "error",
    message: "Layanan autentikasi sedang tidak tersedia. Coba lagi sesaat lagi.",
  }
}

async function requestOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) {
    const parsed = z.url().safeParse(configured)
    if (!parsed.success) {
      throw new SupabaseConfigurationError(
        "NEXT_PUBLIC_SITE_URL harus berupa URL publik aplikasi yang valid.",
      )
    }
    return new URL(parsed.data).origin
  }

  if (process.env.NODE_ENV === "production") {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SITE_URL wajib diisi di production untuk melindungi tautan email auth.",
    )
  }

  const requestHeaders = await headers()
  const origin = requestHeaders.get("origin")
  if (origin) {
    const parsed = z.url().safeParse(origin)
    if (parsed.success) return new URL(parsed.data).origin
  }

  throw new SupabaseConfigurationError(
    "NEXT_PUBLIC_SITE_URL wajib diisi ketika origin request tidak tersedia.",
  )
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  })
  if (!parsed.success) return invalidState(parsed.error)

  try {
    const supabase = await createServerSupabase()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (signInError) {
      return {
        status: "error",
        message: "Email atau kata sandi tidak sesuai.",
      }
    }

    const { data, error: claimsError } = await supabase.auth.getClaims()
    const authId = !claimsError ? data?.claims.sub : null
    if (!authId) {
      await supabase.auth.signOut()
      return { status: "error", message: "Sesi tidak dapat diverifikasi." }
    }

    const profile = await getProfileByAuthId(supabase, authId)
    if (!profile) {
      await supabase.auth.signOut()
      return {
        status: "error",
        message: "Profil akun belum tersedia. Hubungi dukungan PadelKu.",
      }
    }

    const requestedPath = safeRedirectPath(parsed.data.next, homeForRole(profile.role))
    const restrictedPath =
      requestedPath.startsWith("/admin") || requestedPath.startsWith("/venue-owner")
    redirect(restrictedPath ? homeForRole(profile.role) : requestedPath)
  } catch (error) {
    unstable_rethrow(error)
    return expectedError(error)
  }
}

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  })
  if (!parsed.success) return invalidState(parsed.error)

  try {
    const supabase = await createServerSupabase()
    const origin = await requestOrigin()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback`,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone || null,
          requested_role: parsed.data.role,
        },
      },
    })

    if (signUpError) {
      return {
        status: "error",
        message: "Akun belum dapat dibuat. Periksa data atau coba lagi nanti.",
      }
    }

    // Supabase intentionally obscures duplicate-email signups; do not mutate an existing profile.
    if (!data.user?.identities?.length) {
      return {
        status: "success",
        message: "Jika alamat dapat didaftarkan, email konfirmasi akan segera dikirim.",
      }
    }

    if (data.session) redirect(homeForRole(parsed.data.role))

    return {
      status: "success",
      message: "Akun berhasil dibuat. Buka email untuk mengonfirmasi akun sebelum masuk.",
    }
  } catch (error) {
    unstable_rethrow(error)
    return expectedError(error)
  }
}

export async function forgotPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) return invalidState(parsed.error)

  try {
    const supabase = await createServerSupabase()
    const origin = await requestOrigin()
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
    })

    if (error) {
      return {
        status: "error",
        message: "Email pemulihan belum dapat dikirim. Tunggu sebentar lalu coba lagi.",
      }
    }

    return {
      status: "success",
      message: "Jika akun ditemukan, tautan pemulihan akan dikirim ke email tersebut.",
    }
  } catch (error) {
    return expectedError(error)
  }
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) return invalidState(parsed.error)

  try {
    const supabase = await createServerSupabase()
    const { data, error: claimsError } = await supabase.auth.getClaims()
    if (claimsError || !data?.claims.sub) {
      return {
        status: "error",
        message: "Tautan pemulihan tidak valid atau sudah kedaluwarsa.",
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })
    if (error) {
      return {
        status: "error",
        message: "Kata sandi belum dapat diperbarui. Minta tautan pemulihan baru.",
      }
    }

    await supabase.auth.signOut()
    redirect("/login?message=password-updated")
  } catch (error) {
    unstable_rethrow(error)
    return expectedError(error)
  }
}
