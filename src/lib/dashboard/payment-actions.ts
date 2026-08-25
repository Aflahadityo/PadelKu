"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAdminSupabase } from "@/lib/supabase/admin"
import { requireRole } from "./auth"
import type { ActionState } from "./types"

const schema = z.object({
  command: z.enum(["SETTLE", "FAIL", "EXPIRE", "REFUND", "OPEN_DISPUTE", "WIN_DISPUTE", "LOSE_DISPUTE"]),
  idempotencyKey: z.string().uuid(),
  paymentId: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  if (["FAIL", "REFUND", "OPEN_DISPUTE", "WIN_DISPUTE", "LOSE_DISPUTE"].includes(value.command) && (value.reason?.length ?? 0) < 10) {
    context.addIssue({ code: "custom", path: ["reason"], message: "Alasan minimal 10 karakter." })
  }
})

export async function transitionPaymentAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  void _state
  const { actor } = await requireRole("ADMIN")
  if (process.env.PAYMENT_MODE !== "internal_sandbox") return { message: "Sandbox pembayaran tidak aktif.", status: "error" }
  const parsed = schema.safeParse({ command: formData.get("command"), idempotencyKey: formData.get("idempotencyKey"), paymentId: formData.get("paymentId"), reason: formData.get("reason") || undefined })
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Perintah tidak valid.", status: "error" }
  const { error } = await createAdminSupabase().rpc("transition_sandbox_payment", {
    p_actor_id: actor.id,
    p_actor_role: "ADMIN",
    p_command: parsed.data.command,
    p_idempotency_key: parsed.data.idempotencyKey,
    p_payment_id: parsed.data.paymentId,
    p_reason: parsed.data.reason,
  })
  if (error) return { message: "Transisi ditolak karena status pembayaran atau booking tidak sesuai.", status: "error" }
  revalidatePath("/admin", "layout")
  revalidatePath("/venue-owner", "layout")
  revalidatePath("/bookings")
  return { message: "Status sandbox diperbarui dan event audit tersimpan.", status: "success" }
}
