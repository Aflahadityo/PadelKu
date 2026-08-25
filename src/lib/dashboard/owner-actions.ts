"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { TablesUpdate } from "@/types/database"
import { requireRole } from "./auth"
import { courtSchema, fieldsFromZod, slotMutationSchema, venueSchema } from "./schemas"
import { generateCourtSlots } from "./slots"
import type { ActionState } from "./types"

function databaseMessage(operation: string) {
  return `${operation} gagal. Periksa konflik data atau kebijakan akses database.`
}

function venueValues(formData: FormData) {
  return venueSchema.safeParse({
    address: formData.get("address"),
    city: formData.get("city"),
    closingTime: formData.get("closingTime"),
    description: formData.get("description"),
    email: formData.get("email"),
    facilities: formData.get("facilities"),
    imageUrls: formData.get("imageUrls"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    name: formData.get("name"),
    openingTime: formData.get("openingTime"),
    phone: formData.get("phone"),
    province: formData.get("province"),
    slug: formData.get("slug"),
  })
}

function courtValues(formData: FormData) {
  return courtSchema.safeParse({
    courtNumber: formData.get("courtNumber"),
    indoor: formData.get("indoor"),
    isActive: formData.get("isActive"),
    name: formData.get("name"),
    pricePerHour: formData.get("pricePerHour"),
    surfaceType: formData.get("surfaceType"),
    venueId: formData.get("venueId"),
  })
}

export async function createVenueAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const parsed = venueValues(formData)
  if (!parsed.success) {
    return { fieldErrors: fieldsFromZod(parsed.error), message: "Periksa kembali data venue.", status: "error" }
  }

  const values = parsed.data
  const { data, error } = await supabase
    .from("venues")
    .insert({
      address: values.address,
      city: values.city,
      closing_time: values.closingTime,
      description: values.description,
      email: values.email,
      facilities: values.facilities,
      image_urls: values.imageUrls,
      latitude: values.latitude,
      longitude: values.longitude,
      name: values.name,
      opening_time: values.openingTime,
      owner_id: actor.id,
      phone: values.phone,
      province: values.province,
      slug: values.slug,
      status: "DRAFT",
    })
    .select("id")
    .single()

  if (error) return { message: databaseMessage("Membuat venue"), status: "error" }
  revalidatePath("/venue-owner", "layout")
  redirect(`/venue-owner/venues/${data.id}?notice=created`)
}

export async function updateVenueAction(
  venueId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void _state
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const parsed = venueValues(formData)
  if (!parsed.success) {
    return { fieldErrors: fieldsFromZod(parsed.error), message: "Periksa kembali data venue.", status: "error" }
  }

  const { data: venue, error: readError } = await supabase
    .from("venues")
    .select("id, status")
    .eq("id", venueId)
    .eq("owner_id", actor.id)
    .maybeSingle()
  if (readError || !venue) return { message: "Venue tidak ditemukan atau bukan milik Anda.", status: "error" }
  if (!(["DRAFT", "REJECTED"] as const).includes(venue.status as "DRAFT" | "REJECTED")) {
    return { message: "Venue hanya dapat diedit saat berstatus draf atau ditolak.", status: "error" }
  }

  const values = parsed.data
  const update: TablesUpdate<"venues"> = {
    address: values.address,
    city: values.city,
    closing_time: values.closingTime,
    description: values.description,
    email: values.email,
    facilities: values.facilities,
    image_urls: values.imageUrls,
    latitude: values.latitude,
    longitude: values.longitude,
    name: values.name,
    opening_time: values.openingTime,
    phone: values.phone,
    province: values.province,
    slug: values.slug,
  }

  if (venue.status === "REJECTED") {
    update.rejection_reason = null
    update.reviewed_at = null
    update.reviewed_by = null
    update.status = "DRAFT"
    update.submitted_at = null
  }

  const { error } = await supabase.from("venues").update(update).eq("id", venue.id).eq("owner_id", actor.id)
  if (error) return { message: databaseMessage("Menyimpan venue"), status: "error" }

  revalidatePath(`/venue-owner/venues/${venue.id}`)
  revalidatePath("/venue-owner")
  return { message: "Perubahan venue tersimpan.", status: "success" }
}

export async function submitVenueAction(
  venueId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state
  void _formData
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, status, opening_time, closing_time, province")
    .eq("id", venueId)
    .eq("owner_id", actor.id)
    .maybeSingle()

  if (venueError || !venue) return { message: "Venue tidak ditemukan atau bukan milik Anda.", status: "error" }
  if (venue.status !== "DRAFT") return { message: "Hanya venue berstatus draf yang dapat diajukan.", status: "error" }

  const { data: courts, error: courtsError } = await supabase
    .from("courts")
    .select("id, price_per_hour_rupiah")
    .eq("venue_id", venue.id)
    .eq("is_active", true)

  if (courtsError) return { message: "Lapangan venue tidak dapat diverifikasi.", status: "error" }
  if (courts.length === 0) return { message: "Tambahkan setidaknya satu lapangan aktif sebelum mengajukan venue.", status: "error" }

  const slotResults = []
  for (const court of courts) {
    slotResults.push(await generateCourtSlots(supabase, court, venue))
  }

  const { error } = await supabase
    .from("venues")
    .update({ status: "PENDING", submitted_at: new Date().toISOString() })
    .eq("id", venue.id)
    .eq("owner_id", actor.id)
    .eq("status", "DRAFT")

  if (error) return { message: databaseMessage("Mengajukan venue"), status: "error" }

  revalidatePath(`/venue-owner/venues/${venue.id}`)
  revalidatePath("/venue-owner")
  revalidatePath("/admin", "layout")

  const failedGeneration = slotResults.some((result) => result.generated === 0 && !result.message.includes("sudah tersedia"))
  return failedGeneration
    ? {
        message: "Venue diajukan. Sebagian slot belum dibuat karena kebijakan database; periksa halaman jadwal.",
        status: "warning",
      }
    : { message: "Venue diajukan untuk pemeriksaan admin.", status: "success" }
}

export async function createCourtAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const parsed = courtValues(formData)
  if (!parsed.success) {
    return { fieldErrors: fieldsFromZod(parsed.error), message: "Periksa kembali data lapangan.", status: "error" }
  }

  const values = parsed.data
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, opening_time, closing_time, province")
    .eq("id", values.venueId)
    .eq("owner_id", actor.id)
    .maybeSingle()
  if (venueError || !venue) return { message: "Venue tidak ditemukan atau bukan milik Anda.", status: "error" }

  const { data: court, error } = await supabase
    .from("courts")
    .insert({
      court_number: values.courtNumber,
      indoor: values.indoor,
      is_active: values.isActive,
      name: values.name,
      price_per_hour_rupiah: values.pricePerHour,
      surface_type: values.surfaceType,
      venue_id: venue.id,
    })
    .select("id, price_per_hour_rupiah")
    .single()

  if (error) return { message: databaseMessage("Membuat lapangan"), status: "error" }
  const slots = values.isActive ? await generateCourtSlots(supabase, court, venue) : null
  revalidatePath("/venue-owner", "layout")
  const notice = slots && slots.generated === 0 ? "court-created-slots-pending" : "court-created"
  redirect(`/venue-owner/courts?notice=${notice}`)
}

export async function updateCourtAction(
  courtId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const parsed = courtValues(formData)
  if (!parsed.success) {
    return { fieldErrors: fieldsFromZod(parsed.error), message: "Periksa kembali data lapangan.", status: "error" }
  }

  const { data: court, error: courtError } = await supabase
    .from("courts")
    .select("id, venue_id")
    .eq("id", courtId)
    .maybeSingle()
  if (courtError || !court) return { message: "Lapangan tidak ditemukan.", status: "error" }

  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, opening_time, closing_time, province")
    .eq("id", court.venue_id)
    .eq("owner_id", actor.id)
    .maybeSingle()
  if (venueError || !venue || parsed.data.venueId !== venue.id) {
    return { message: "Lapangan tidak berada di venue milik Anda.", status: "error" }
  }

  const values = parsed.data
  const { error } = await supabase
    .from("courts")
    .update({
      court_number: values.courtNumber,
      indoor: values.indoor,
      is_active: values.isActive,
      name: values.name,
      price_per_hour_rupiah: values.pricePerHour,
      surface_type: values.surfaceType,
    })
    .eq("id", court.id)
    .eq("venue_id", venue.id)

  if (error) return { message: databaseMessage("Menyimpan lapangan"), status: "error" }
  const slots = values.isActive
    ? await generateCourtSlots(supabase, { id: court.id, price_per_hour_rupiah: values.pricePerHour }, venue)
    : null

  revalidatePath("/venue-owner", "layout")
  return slots && slots.generated === 0 && !slots.message.includes("sudah tersedia")
    ? { message: "Lapangan tersimpan, tetapi slot baru ditolak kebijakan database.", status: "warning" }
    : { message: "Perubahan lapangan tersimpan.", status: "success" }
}

export async function mutateSlotAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const parsed = slotMutationSchema.safeParse({
    blockedReason: formData.get("blockedReason") || undefined,
    slotId: formData.get("slotId"),
    targetStatus: formData.get("targetStatus"),
  })
  if (!parsed.success) {
    return { fieldErrors: fieldsFromZod(parsed.error), message: "Permintaan perubahan slot tidak valid.", status: "error" }
  }

  const { data: slot, error: slotError } = await supabase
    .from("booking_slots")
    .select("id, court_id, starts_at, status")
    .eq("id", parsed.data.slotId)
    .maybeSingle()
  if (slotError || !slot) return { message: "Slot tidak ditemukan.", status: "error" }
  if (new Date(slot.starts_at) <= new Date()) return { message: "Slot yang sudah dimulai tidak dapat diubah.", status: "error" }
  if (!(["AVAILABLE", "BLOCKED"] as const).includes(slot.status as "AVAILABLE" | "BLOCKED")) {
    return { message: "Hanya slot tersedia atau diblokir yang dapat diubah.", status: "error" }
  }
  if (slot.status === parsed.data.targetStatus) return { message: "Status slot sudah sesuai.", status: "success" }

  const { data: court, error: courtError } = await supabase
    .from("courts")
    .select("venue_id")
    .eq("id", slot.court_id)
    .maybeSingle()
  if (courtError || !court) return { message: "Lapangan slot tidak ditemukan.", status: "error" }

  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id")
    .eq("id", court.venue_id)
    .eq("owner_id", actor.id)
    .maybeSingle()
  if (venueError || !venue) return { message: "Anda tidak berwenang mengubah slot ini.", status: "error" }

  const update: TablesUpdate<"booking_slots"> =
    parsed.data.targetStatus === "BLOCKED"
      ? { blocked_reason: parsed.data.blockedReason, status: "BLOCKED" }
      : { blocked_reason: null, status: "AVAILABLE" }
  if (parsed.data.targetStatus === "BLOCKED" && !parsed.data.blockedReason) {
    return { message: "Alasan blokir wajib diisi.", status: "error" }
  }

  const { error } = await supabase
    .from("booking_slots")
    .update(update)
    .eq("id", slot.id)
    .eq("status", slot.status)
    .gt("starts_at", new Date().toISOString())

  if (error) {
    return {
      message: "Perubahan slot ditolak kebijakan RLS database. Tidak ada status booking yang diubah.",
      status: "error",
    }
  }
  revalidatePath("/venue-owner/schedule")
  return { message: parsed.data.targetStatus === "BLOCKED" ? "Slot berhasil diblokir." : "Slot kembali tersedia.", status: "success" }
}
