import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"
import { createAdminSupabase } from "@/lib/supabase/admin"
import { createServerSupabase } from "@/lib/supabase/server"
import type { Database, Profile } from "@/types/database"
import { ApiError, throwDatabaseError } from "./errors"

export type ApiSupabase = SupabaseClient<Database>

export type ApiUser = {
  authId: string
  profile: Profile
  supabase: ApiSupabase
}

export function createApiAdminSupabase(): ApiSupabase {
  return createAdminSupabase() as ApiSupabase
}

export async function requireApiUser(): Promise<ApiUser> {
  const supabase = await createServerSupabase() as ApiSupabase
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const authId = z.string().uuid().safeParse(
    claimsError ? null : claimsData?.claims.sub,
  )

  if (!authId.success) {
    throw new ApiError(401, "UNAUTHORIZED", "Autentikasi diperlukan.")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authId.data)
    .maybeSingle()

  if (profileError) throwDatabaseError(profileError, "Profil")
  if (!profile) {
    throw new ApiError(403, "PROFILE_REQUIRED", "Profil pengguna tidak tersedia.")
  }

  return { authId: authId.data, profile, supabase }
}
