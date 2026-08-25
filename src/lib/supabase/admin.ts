import "server-only"

import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { getSupabasePublicEnv, SupabaseConfigurationError } from "@/lib/env"
import type { Database } from "@/types/database.generated"

const secretSchema = z
  .string({
    error:
      "SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk operasi admin.",
  })
  .min(
    1,
    "SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk operasi admin.",
  )

export function createAdminSupabase() {
  const { url } = getSupabasePublicEnv()
  const secret = secretSchema.safeParse(
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

  if (!secret.success) {
    throw new SupabaseConfigurationError(secret.error.issues[0].message)
  }

  return createClient<Database>(url, secret.data, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
