import "server-only"

import { requireRole } from "./auth"
import type { BookingStatus, PaymentStatus, VenueStatus } from "@/types/database"

export interface OwnerVenueSummary {
  activeCourts: number
  city: string
  id: string
  name: string
  rejectionReason: string | null
  slug: string
  status: VenueStatus
}

export interface OwnerBookingSummary {
  bookingCode: string
  createdAt: string
  id: string
  paymentStatus: PaymentStatus | null
  status: BookingStatus
  totalPriceRupiah: number
  venueName: string
}

export async function getOwnerOverview() {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const venuesResult = await supabase.from("venues").select("id, name, slug, city, status, rejection_reason").eq("owner_id", actor.id).order("created_at")
  if (venuesResult.error) throw new Error("Venue pemilik tidak dapat dimuat.")
  const venues = venuesResult.data ?? []
  const venueIds = venues.map((venue) => venue.id)
  if (!venueIds.length) return { bookings: [], grossSettledRupiah: 0, platformFeeRupiah: 0, refundedRupiah: 0, venueNetRupiah: 0, venues: [] }
  const [courtsResult, bookingsResult, aggregatesResult] = await Promise.all([
    supabase.from("courts").select("id, venue_id, is_active").in("venue_id", venueIds),
    supabase.from("bookings").select("id, booking_code, venue_id, status, total_price_rupiah, created_at").in("venue_id", venueIds).order("created_at", { ascending: false }).limit(20),
    supabase.rpc("get_owner_financial_aggregates", { p_from: undefined, p_to: undefined }),
  ])
  if (courtsResult.error || bookingsResult.error || aggregatesResult.error) throw new Error("Ringkasan venue tidak dapat dimuat.")
  const bookings = bookingsResult.data ?? []
  const paymentsResult = bookings.length
    ? await supabase.from("payments").select("booking_id, status, created_at").in("booking_id", bookings.map((booking) => booking.id)).order("created_at", { ascending: false })
    : { data: [], error: null }
  if (paymentsResult.error) throw new Error("Ringkasan pembayaran tidak dapat dimuat.")
  const payments = new Map<string, (typeof paymentsResult.data)[number]>()
  for (const payment of paymentsResult.data ?? []) {
    if (!payments.has(payment.booking_id)) payments.set(payment.booking_id, payment)
  }
  const names = new Map(venues.map((venue) => [venue.id, venue.name]))
  const aggregates = aggregatesResult.data?.[0]
  return {
    bookings: bookings.map<OwnerBookingSummary>((booking) => ({ bookingCode: booking.booking_code, createdAt: booking.created_at, id: booking.id, paymentStatus: payments.get(booking.id)?.status ?? null, status: booking.status, totalPriceRupiah: booking.total_price_rupiah, venueName: names.get(booking.venue_id) ?? "Venue" })),
    grossSettledRupiah: aggregates?.gross_settled_rupiah ?? 0,
    platformFeeRupiah: aggregates?.platform_fee_rupiah ?? 0,
    refundedRupiah: aggregates?.refunded_rupiah ?? 0,
    venueNetRupiah: aggregates?.venue_net_rupiah ?? 0,
    venues: venues.map<OwnerVenueSummary>((venue) => ({ activeCourts: (courtsResult.data ?? []).filter((court) => court.venue_id === venue.id && court.is_active).length, city: venue.city, id: venue.id, name: venue.name, rejectionReason: venue.rejection_reason, slug: venue.slug, status: venue.status })),
  }
}
