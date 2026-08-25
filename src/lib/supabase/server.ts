import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabasePublicEnv } from "../env"
import type { Database } from "@/types/database.generated"

export async function createServerSupabase() {
  const cookieStore = await cookies()
  const { url, publishableKey } = getSupabasePublicEnv()

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet, headers) {
        // Response headers cannot be mutated here; the request proxy applies them.
        void headers
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Server Components cannot write cookies; src/proxy.ts refreshes them.
        }
      },
    },
  })
}
