import { z } from "zod"

const publicSupabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .url("NEXT_PUBLIC_SUPABASE_URL harus berupa URL Supabase yang valid."),
  supabasePublicKey: z
    .string()
    .min(
      1,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi.",
    ),
})

export type PublicSupabaseEnv = {
  url: string
  publishableKey: string
}

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(`Konfigurasi Supabase tidak valid: ${message}`)
    this.name = "SupabaseConfigurationError"
  }
}

export function getSupabasePublicEnv(options?: {
  optional?: false
}): PublicSupabaseEnv
export function getSupabasePublicEnv(options: {
  optional: true
}): PublicSupabaseEnv | null
export function getSupabasePublicEnv(options?: {
  optional?: boolean
}): PublicSupabaseEnv | null {
  const values = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublicKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  if (options?.optional && !values.NEXT_PUBLIC_SUPABASE_URL && !values.supabasePublicKey) {
    return null
  }

  const result = publicSupabaseEnvSchema.safeParse(values)
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(" ")
    throw new SupabaseConfigurationError(message)
  }

  return {
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: result.data.supabasePublicKey,
  }
}
