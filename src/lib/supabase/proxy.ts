import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import {
  getSupabasePublicEnv,
  SupabaseConfigurationError,
} from "@/lib/env"
import type { Database, Enums } from "@/types/database.generated"

type ProfileRole = Enums<"user_role">

const protectedPaths = ["/bookings", "/profile", "/admin", "/venue-owner"]
const guestPaths = ["/login", "/register", "/forgot-password"]

function startsWithPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

function roleHome(role: ProfileRole) {
  if (role === "ADMIN") return "/admin"
  if (role === "VENUE_OWNER") return "/venue-owner"
  return "/"
}

function redirectWithSession(
  request: NextRequest,
  response: NextResponse,
  destination: string,
) {
  const redirect = NextResponse.redirect(new URL(destination, request.url))
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = response.headers.get(header)
    if (value) redirect.headers.set(header, value)
  }
  return redirect
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = protectedPaths.some((path) => startsWithPath(pathname, path))
  const isGuestOnly = guestPaths.some((path) => startsWithPath(pathname, path))

  let publicEnv
  try {
    publicEnv = getSupabasePublicEnv({ optional: true })
  } catch (error) {
    if (error instanceof SupabaseConfigurationError && isProtected) {
      return NextResponse.redirect(new URL("/login?error=configuration", request.url))
    }
    return NextResponse.next({ request })
  }

  if (!publicEnv) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login?error=configuration", request.url))
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient<Database>(publicEnv.url, publicEnv.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
        Object.entries(headers).forEach(([name, value]) =>
          supabaseResponse.headers.set(name, value),
        )
      },
    },
  })

  let claimsResult
  try {
    claimsResult = await supabase.auth.getClaims()
  } catch {
    if (isProtected) {
      return redirectWithSession(request, supabaseResponse, "/login?error=auth")
    }
    return supabaseResponse
  }

  const { data, error } = claimsResult
  const authId = !error ? data?.claims.sub : null

  if (!authId) {
    if (!isProtected) return supabaseResponse

    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`)
    return redirectWithSession(request, supabaseResponse, loginUrl.toString())
  }

  if (!isProtected && !isGuestOnly) return supabaseResponse

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authId)
    .maybeSingle()

  const role = profile?.role
  if (profileError || !role || !["PLAYER", "VENUE_OWNER", "ADMIN"].includes(role)) {
    if (isProtected) {
      return redirectWithSession(request, supabaseResponse, "/login?error=profile")
    }
    return supabaseResponse
  }

  if (isGuestOnly) {
    return redirectWithSession(request, supabaseResponse, roleHome(role))
  }

  if (startsWithPath(pathname, "/admin") && role !== "ADMIN") {
    return redirectWithSession(request, supabaseResponse, roleHome(role))
  }

  if (startsWithPath(pathname, "/venue-owner") && role !== "VENUE_OWNER") {
    return redirectWithSession(request, supabaseResponse, roleHome(role))
  }

  return supabaseResponse
}
