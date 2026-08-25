import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    // The action verifies the submitted session itself; Proxy is not an authorization boundary.
    const { data, error } = await supabase.auth.getClaims()
    if (!error && data?.claims.sub) {
      await supabase.auth.signOut()
    }
  } catch {
    return NextResponse.redirect(new URL("/login?error=configuration", request.url), 303)
  }

  return NextResponse.redirect(new URL("/login", request.url), 303)
}
