"use server"

import { revalidatePath } from "next/cache"
import { createAdminSupabase } from "@/lib/supabase/admin"
import { requireRole } from "./auth"
import { fieldsFromZod, venueReviewSchema } from "./schemas"
import type { ActionState } from "./types"

async function pendingVenue(venueId: string) {
  const context = await requireRole("ADMIN")
  const { data, error } = await context.supabase
    .from("venues")
    .select("id, status")
    .eq("id", venueId)
    .maybeSingle()
  return { ...context, error, venue: data }
}

function refreshVenue(venueId: string) {
  revalidatePath(`/admin/venues/${venueId}`)
  revalidatePath("/admin", "layout")
  revalidatePath("/venue-owner", "layout")
}

export async function approveVenueAction(
  venueId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state
  void _formData
  const { actor, error, supabase, venue } = await pendingVenue(venueId)
  if (error || !venue) return { message: "Venue tidak ditemukan.", status: "error" }
  if (venue.status !== "PENDING") return { message: "Hanya venue menunggu yang dapat disetujui.", status: "error" }

  const { count, error: courtError } = await supabase
    .from("courts")
    .select("id", { count: "exact", head: true })
    .eq("venue_id", venue.id)
    .eq("is_active", true)
  if (courtError) return { message: "Checklist lapangan tidak dapat diverifikasi.", status: "error" }
  if (!count) return { message: "Venue belum memiliki lapangan aktif.", status: "error" }

  const reviewedAt = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from("venues")
    .update({ rejection_reason: null, reviewed_at: reviewedAt, reviewed_by: actor.id, status: "APPROVED" })
    .eq("id", venue.id)
    .eq("status", "PENDING")
    .select("id")
    .maybeSingle()
  if (updateError || !updated) return { message: "Persetujuan gagal karena status berubah atau akses ditolak.", status: "error" }

  refreshVenue(venue.id)
  return { message: "Venue disetujui dan kini dapat tampil di marketplace.", status: "success" }
}

export async function rejectVenueAction(
  venueId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = venueReviewSchema.safeParse({ reason: formData.get("reason"), venueId })
  if (!parsed.success) {
    return { fieldErrors: fieldsFromZod(parsed.error), message: "Alasan penolakan belum valid.", status: "error" }
  }

  const { actor, error, supabase, venue } = await pendingVenue(parsed.data.venueId)
  if (error || !venue) return { message: "Venue tidak ditemukan.", status: "error" }
  if (venue.status !== "PENDING") return { message: "Hanya venue menunggu yang dapat ditolak.", status: "error" }

  const { data: updated, error: updateError } = await supabase
    .from("venues")
    .update({
      rejection_reason: parsed.data.reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: actor.id,
      status: "REJECTED",
    })
    .eq("id", venue.id)
    .eq("status", "PENDING")
    .select("id")
    .maybeSingle()
  if (updateError || !updated) return { message: "Penolakan gagal karena status berubah atau akses ditolak.", status: "error" }

  refreshVenue(venue.id)
  return { message: "Venue ditolak. Alasan tersimpan pada data venue dan audit perubahan.", status: "success" }
}

export async function suspendVenueAction(
  venueId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = venueReviewSchema.safeParse({ reason: formData.get("reason"), venueId })
  if (!parsed.success) {
    return { fieldErrors: fieldsFromZod(parsed.error), message: "Alasan penangguhan belum valid.", status: "error" }
  }

  const { actor, error, supabase, venue } = await pendingVenue(parsed.data.venueId)
  if (error || !venue) return { message: "Venue tidak ditemukan.", status: "error" }
  if (venue.status !== "APPROVED") return { message: "Hanya venue aktif yang dapat ditangguhkan.", status: "error" }

  const reviewedAt = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from("venues")
    .update({ rejection_reason: null, reviewed_at: reviewedAt, reviewed_by: actor.id, status: "SUSPENDED" })
    .eq("id", venue.id)
    .eq("status", "APPROVED")
    .select("id")
    .maybeSingle()
  if (updateError || !updated) return { message: "Penangguhan gagal karena status berubah atau akses ditolak.", status: "error" }

  let reasonRecorded = false
  try {
    const admin = createAdminSupabase()
    const { error: auditError } = await admin.from("audit_logs").insert({
      action: "UPDATE",
      actor_id: actor.id,
      actor_role: "ADMIN",
      metadata: { operation: "SUSPEND", reason: parsed.data.reason },
      record_id: venue.id,
      table_name: "venues",
    })
    reasonRecorded = !auditError
  } catch {
    reasonRecorded = false
  }

  refreshVenue(venue.id)
  return reasonRecorded
    ? { message: "Venue ditangguhkan. Alasan tercatat pada audit operasional.", status: "success" }
    : {
        message: "Venue ditangguhkan, tetapi alasan tidak dapat ditulis ke audit karena kredensial operasional tidak tersedia.",
        status: "warning",
      }
}
