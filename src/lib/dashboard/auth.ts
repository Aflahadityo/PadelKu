import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server"
import type { Database } from "@/types/database"
import type { DashboardRole } from "./types"

export type DashboardActor = {
  email: string
  fullName: string
  id: string
  role: DashboardRole
}

export async function createDashboardSupabase(): Promise<SupabaseClient<Database>> {
  return (await createServerSupabase()) as SupabaseClient<Database>
}

export async function requireRole(role: DashboardRole) {
  const supabase = await createDashboardSupabase()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const authId = claimsError ? null : claimsData?.claims.sub

  if (!authId) redirect("/login")

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", authId)
    .maybeSingle()

  if (error) throw new Error("Profil dashboard tidak dapat dibaca.")
  if (!profile) redirect("/login")

  if (profile.role !== role) {
    redirect(profile.role === "ADMIN" ? "/admin" : profile.role === "VENUE_OWNER" ? "/venue-owner" : "/")
  }

  return {
    actor: {
      email: profile.email,
      fullName: profile.full_name,
      id: profile.id,
      role,
    } satisfies DashboardActor,
    supabase,
  }
}
