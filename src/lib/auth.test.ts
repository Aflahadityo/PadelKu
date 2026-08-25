import { describe, expect, it } from "vitest"
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  safeRedirectPath,
} from "./auth"

describe("safeRedirectPath", () => {
  it.each([
    ["https://evil.example/steal", "/"],
    ["//evil.example/steal", "/"],
    ["javascript:alert(1)", "/"],
    ["", "/"],
    [null, "/"],
  ])("rejects unsafe destination %s", (value, expected) => {
    expect(safeRedirectPath(value)).toBe(expected)
  })

  it("keeps an internal path, query, and fragment", () => {
    expect(safeRedirectPath("/bookings?tab=upcoming#next")).toBe(
      "/bookings?tab=upcoming#next",
    )
  })
})

describe("auth validators", () => {
  it("normalizes login email", () => {
    const result = loginSchema.parse({
      email: "  PLAYER@PADELKU.ID ",
      password: "password123",
    })
    expect(result.email).toBe("player@padelku.id")
  })

  it("allows only public roles during registration", () => {
    const base = {
      fullName: "Pemain Padel",
      email: "player@padelku.id",
      phone: "0812 3456 7890",
      password: "password123",
      confirmPassword: "password123",
    }
    expect(registerSchema.safeParse({ ...base, role: "PLAYER" }).success).toBe(true)
    expect(registerSchema.safeParse({ ...base, role: "VENUE_OWNER" }).success).toBe(true)
    expect(registerSchema.safeParse({ ...base, role: "ADMIN" }).success).toBe(false)
  })

  it("requires matching reset passwords", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "password123",
        confirmPassword: "different123",
      }).success,
    ).toBe(false)
  })

  it("validates forgot-password email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "not-an-email" }).success).toBe(false)
  })
})
