import { afterEach, describe, expect, it, vi } from "vitest"
import { getSupabasePublicEnv } from "./env"

describe("getSupabasePublicEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("reads the current publishable key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test")

    expect(getSupabasePublicEnv()).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test",
    })
  })

  it("supports the legacy anon key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", undefined)
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-anon-key")

    expect(getSupabasePublicEnv().publishableKey).toBe("legacy-anon-key")
  })
})
