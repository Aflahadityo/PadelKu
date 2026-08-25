import type { Tables } from "@/types/database"
import { getTypedServerSupabase, MarketplaceDataError } from "./marketplace"

type BookingStatus = Tables<"bookings">["status"]
type PaymentStatus = Tables<"payments">["status"]

export interface PlayerProfile {
  avatarUrl: string | null
  createdAt: string
  email: string
  fullName: string
  id: string
  phone: string | null
  role: Tables<"profiles">["role"]
}

export interface ShellPlayer {
  email: string
  name: string
  role: string
}

export interface PlayerBookingItem {
  courtName: string
  courtNumber: number
  endsAt: string
  id: string
  priceRupiah: number
  startsAt: string
}

export interface PlayerBooking {
  bookingCode: string
  cancellationReason: string | null
  createdAt: string
  id: string
  items: PlayerBookingItem[]
  paymentExpiresAt: string | null
  paymentMethod: Tables<"payments">["method"] | null
  paymentStatus: PaymentStatus | null
  review: { comment: string | null; id: string; rating: number } | null
  status: BookingStatus
  totalPriceRupiah: number
  venueAddress: string
  venueCity: string
  venueId: string
  venueImageUrl: string | null
  venueName: string
  venueSlug: string
}

export async function getOptionalShellPlayer(): Promise<ShellPlayer | null> {
  const supabase = await getTypedServerSupabase()
  const claimsResult = await supabase.auth.getClaims()
  const userId = claimsResult.error ? null : claimsResult.data?.claims.sub
  if (!userId) return null
  const { data, error } = await supabase
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", userId)
    .maybeSingle()
  if (error || !data) return null
  return { email: data.email, name: data.full_name, role: data.role === "PLAYER" ? "Player" : data.role }
}

export async function getPlayerProfile(userId: string): Promise<PlayerProfile> {
  const supabase = await getTypedServerSupabase()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  if (error) throw new MarketplaceDataError("Profil tidak dapat dimuat.")
  return {
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    email: data.email,
    fullName: data.full_name,
    id: data.id,
    phone: data.phone,
    role: data.role,
  }
}

export async function updatePlayerProfile(userId: string, values: { fullName: string; phone: string | null }) {
  const supabase = await getTypedServerSupabase()
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: values.fullName, phone: values.phone })
    .eq("id", userId)
  if (error) throw new MarketplaceDataError("Perubahan profil tidak dapat disimpan.")
}

export async function getPlayerBookings(userId: string): Promise<PlayerBooking[]> {
  const supabase = await getTypedServerSupabase()
  const { data: bookings, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (bookingError) throw new MarketplaceDataError("Daftar booking tidak dapat dimuat.")
  if (!bookings || bookings.length === 0) return []

  const bookingIds = bookings.map((booking) => booking.id)
  const venueIds = [...new Set(bookings.map((booking) => booking.venue_id))]
  const [venuesResult, itemsResult, paymentsResult, reviewsResult] = await Promise.all([
    supabase.from("venues").select("id, name, slug, address, city, image_urls").in("id", venueIds),
    supabase.from("booking_items").select("*").in("booking_id", bookingIds).order("starts_at"),
    supabase.from("payments").select("*").in("booking_id", bookingIds).order("created_at", { ascending: false }),
    supabase.from("reviews").select("id, booking_id, rating, comment").in("booking_id", bookingIds),
  ])
  if (venuesResult.error || itemsResult.error || paymentsResult.error || reviewsResult.error) {
    throw new MarketplaceDataError("Daftar booking tidak dapat dimuat.")
  }

  const courtIds = [...new Set((itemsResult.data ?? []).map((item) => item.court_id))]
  const courtsResult = courtIds.length === 0
    ? { data: [] as Array<Pick<Tables<"courts">, "id" | "name" | "court_number">>, error: null }
    : await supabase.from("courts").select("id, name, court_number").in("id", courtIds)
  if (courtsResult.error) throw new MarketplaceDataError("Daftar booking tidak dapat dimuat.")

  const venues = new Map((venuesResult.data ?? []).map((venue) => [venue.id, venue]))
  const courts = new Map((courtsResult.data ?? []).map((court) => [court.id, court]))

  return bookings.flatMap((booking) => {
    const venue = venues.get(booking.venue_id)
    if (!venue) return []
    const payment = (paymentsResult.data ?? []).find((candidate) => candidate.booking_id === booking.id)
    const review = (reviewsResult.data ?? []).find((candidate) => candidate.booking_id === booking.id)
    return [{
      bookingCode: booking.booking_code,
      cancellationReason: booking.cancellation_reason,
      createdAt: booking.created_at,
      id: booking.id,
      items: (itemsResult.data ?? [])
        .filter((item) => item.booking_id === booking.id)
        .map((item) => {
          const court = courts.get(item.court_id)
          return {
            courtName: court?.name ?? "Lapangan",
            courtNumber: court?.court_number ?? 0,
            endsAt: item.ends_at,
            id: item.id,
            priceRupiah: item.price_rupiah,
            startsAt: item.starts_at,
          }
        }),
      paymentExpiresAt: booking.payment_expires_at,
      paymentMethod: payment?.method ?? null,
      paymentStatus: payment?.status ?? null,
      review: review ? { comment: review.comment, id: review.id, rating: review.rating } : null,
      status: booking.status,
      totalPriceRupiah: booking.total_price_rupiah,
      venueAddress: venue.address,
      venueCity: venue.city,
      venueId: venue.id,
      venueImageUrl: venue.image_urls.find((image) => {
        try { return new URL(image).hostname === "images.unsplash.com" } catch { return false }
      }) ?? null,
      venueName: venue.name,
      venueSlug: venue.slug,
    } satisfies PlayerBooking]
  })
}

export async function getPlayerBooking(userId: string, bookingId: string) {
  const bookings = await getPlayerBookings(userId)
  return bookings.find((booking) => booking.id === bookingId) ?? null
}

export async function getPlayerReviews(userId: string) {
  const supabase = await getTypedServerSupabase()
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, venue_id, booking_id, rating, comment, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new MarketplaceDataError("Ulasan tidak dapat dimuat.")
  if (!reviews || reviews.length === 0) return []
  const { data: venues, error: venueError } = await supabase
    .from("venues")
    .select("id, name, slug")
    .in("id", [...new Set(reviews.map((review) => review.venue_id))])
  if (venueError) throw new MarketplaceDataError("Ulasan tidak dapat dimuat.")
  const venueById = new Map((venues ?? []).map((venue) => [venue.id, venue]))
  return reviews.flatMap((review) => {
    const venue = venueById.get(review.venue_id)
    return venue ? [{ ...review, venue }] : []
  })
}
