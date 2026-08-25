import type { EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import {
  getProfileByAuthId,
  homeForRole,
  safeRedirectPath,
} from "@/lib/auth"
import { SupabaseConfigurationError } from "@/lib/env"
import { createServerSupabase } from "@/lib/supabase/server"

function authRedirect(request: NextRequest, destination: string) {
  const response = NextResponse.redirect(new URL(destination, request.url))
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0")
  response.headers.set("Expires", "0")
  response.headers.set("Pragma", "no-cache")
  return response
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const tokenHash = request.nextUrl.searchParams.get("token_hash")
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"), "/")

  try {
    const supabase = await createServerSupabase()
    const result = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : null

    if (!result || result.error) {
      return authRedirect(request, "/login?error=auth")
    }

    if (next === "/reset-password") {
      return authRedirect(request, next)
    }

    const { data, error } = await supabase.auth.getClaims()
    const authId = !error ? data?.claims.sub : null
    if (!authId) {
      return authRedirect(request, "/login?error=auth")
    }

    const profile = await getProfileByAuthId(supabase, authId)
    if (!profile) {
      await supabase.auth.signOut()
      return authRedirect(request, "/login?error=profile")
    }

    const requestedDestination = next === "/" ? homeForRole(profile.role) : next
    const roleRestricted =
      (requestedDestination.startsWith("/admin") && profile.role !== "ADMIN") ||
      (requestedDestination.startsWith("/venue-owner") && profile.role !== "VENUE_OWNER")
    return authRedirect(
      request,
      roleRestricted ? homeForRole(profile.role) : requestedDestination,
    )
  } catch (error) {
    const reason = error instanceof SupabaseConfigurationError ? "configuration" : "auth"
    return authRedirect(request, `/login?error=${reason}`)
  }
}
