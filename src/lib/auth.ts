import type { SupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createServerSupabase } from "./supabase/server"
import type { Database, Enums } from "@/types/database.generated"

export const profileRoles = ["PLAYER", "VENUE_OWNER", "ADMIN"] as const
export const publicRegistrationRoles = ["PLAYER", "VENUE_OWNER"] as const
export type ProfileRole = Enums<"user_role">

export type AuthProfile = {
  id: string
  email: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  role: ProfileRole
}

const email = z
  .string()
  .trim()
  .min(1, "Email wajib diisi.")
  .email("Masukkan alamat email yang valid.")
  .transform((value) => value.toLowerCase())

const password = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(72, "Kata sandi maksimal 72 karakter.")

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Kata sandi wajib diisi."),
  next: z.string().optional(),
})

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(80, "Nama maksimal 80 karakter."),
    email,
    phone: z
      .string()
      .trim()
      .max(24, "Nomor WhatsApp maksimal 24 karakter.")
      .refine(
        (value) => !value || /^\+?[0-9][0-9\s-]{7,22}$/.test(value),
        "Masukkan nomor WhatsApp yang valid.",
      ),
    password,
    confirmPassword: z.string(),
    role: z.enum(publicRegistrationRoles, {
      error: "Pilih jenis akun yang valid.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama.",
  })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama.",
  })

export function safeRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback

  try {
    const url = new URL(value, "https://padelku.invalid")
    if (url.origin !== "https://padelku.invalid") return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export function homeForRole(role: ProfileRole) {
  if (role === "ADMIN") return "/admin"
  if (role === "VENUE_OWNER") return "/venue-owner"
  return "/"
}

export async function getProfileByAuthId(
  supabase: SupabaseClient<Database>,
  authId: string,
): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url, role")
    .eq("id", authId)
    .maybeSingle()

  if (error) {
    throw new Error("Profil akun tidak dapat dibaca dari database.")
  }

  if (!data) return null

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    role: data.role,
  }
}

export async function getCurrentUser() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.auth.getClaims()
  const authId = !error ? data?.claims.sub : null
  if (!authId) return null
  return getProfileByAuthId(supabase, authId)
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function requireRole(role: ProfileRole) {
  const user = await requireUser()
  if (user.role !== role) redirect(homeForRole(user.role))
  return user
}
