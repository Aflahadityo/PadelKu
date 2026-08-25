import "server-only"

import { dateRangeForJakarta, localDateKey } from "./format"
import { requireRole } from "./auth"
import type {
  BookingSlotStatus,
  BookingStatus,
  PaymentStatus,
  VenueStatus,
} from "@/types/database"

export interface OwnerCourtItem {
  id: string
  isActive: boolean
  name: string
  pricePerHour: number
}

export interface OwnerVenueSummary {
  activeCourts: number
  address: string
  city: string
  closingTime: string
  courts: OwnerCourtItem[]
  facilities: string[]
  id: string
  imageUrls: string[]
  name: string
  openingTime: string
  rejectionReason: string | null
  slug: string
  status: VenueStatus
}

export interface OwnerVenueDetail {
  address: string
  city: string
  closingTime: string
  description: string | null
  email: string | null
  facilities: string[]
  id: string
  imageUrls: string[]
  latitude: number | null
  longitude: number | null
  name: string
  openingTime: string
  phone: string | null
  province: string
  rejectionReason: string | null
  slug: string
  status: VenueStatus
  submittedAt: string | null
}

export interface OwnerCourtSummary {
  courtNumber: number
  id: string
  indoor: boolean
  isActive: boolean
  name: string
  pricePerHourRupiah: number
  surfaceType: string
  venueId: string
  venueName: string
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

export interface OwnerScheduleSlot {
  blockedReason: string | null
  courtName: string
  endsAt: string
  id: string
  priceRupiah: number
  startsAt: string
  status: BookingSlotStatus
  venueName: string
}

export interface OwnerBookingItem extends OwnerBookingSummary {
  courtNames: string[]
  endsAt: string | null
  startsAt: string | null
}

export interface OwnerBookingsPage {
  items: OwnerBookingItem[]
  page: number
  pageCount: number
  total: number
}

export class OwnerDataError extends Error {
  constructor(message = "Data portal venue tidak dapat dimuat.") {
    super(message)
    this.name = "OwnerDataError"
  }
}

export const ownerBookingsPageSize = 20

export function normalizeScheduleDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return localDateKey()
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? localDateKey()
    : value
}

export async function getOwnerOverview() {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const venuesResult = await supabase
    .from("venues")
    .select("id, name, slug, city, address, image_urls, opening_time, closing_time, facilities, status, rejection_reason")
    .eq("owner_id", actor.id)
    .order("created_at")
  if (venuesResult.error) throw new OwnerDataError("Venue pemilik tidak dapat dimuat.")
  const venues = venuesResult.data ?? []
  const venueIds = venues.map((venue) => venue.id)
  if (!venueIds.length) {
    return {
      bookings: [],
      grossSettledRupiah: 0,
      platformFeeRupiah: 0,
      refundedRupiah: 0,
      venueNetRupiah: 0,
      venues: [],
    }
  }

  const [courtsResult, bookingsResult, aggregatesResult] = await Promise.all([
    supabase
      .from("courts")
      .select("id, venue_id, name, is_active, price_per_hour_rupiah")
      .in("venue_id", venueIds),
    supabase
      .from("bookings")
      .select("id, booking_code, venue_id, status, total_price_rupiah, created_at")
      .in("venue_id", venueIds)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.rpc("get_owner_financial_aggregates", { p_from: undefined, p_to: undefined }),
  ])

  if (courtsResult.error || bookingsResult.error || aggregatesResult.error) {
    throw new OwnerDataError("Ringkasan venue tidak dapat dimuat.")
  }

  const bookings = bookingsResult.data ?? []
  const paymentsResult = bookings.length
    ? await supabase
        .from("payments")
        .select("booking_id, status, created_at")
        .in("booking_id", bookings.map((booking) => booking.id))
        .order("created_at", { ascending: false })
    : { data: [], error: null }
  if (paymentsResult.error) throw new OwnerDataError("Ringkasan pembayaran tidak dapat dimuat.")

  const payments = new Map<string, (typeof paymentsResult.data)[number]>()
  for (const payment of paymentsResult.data ?? []) {
    if (!payments.has(payment.booking_id)) payments.set(payment.booking_id, payment)
  }

  const names = new Map(venues.map((venue) => [venue.id, venue.name]))
  const aggregates = aggregatesResult.data?.[0]
  const courtsData = courtsResult.data ?? []

  return {
    bookings: bookings.map<OwnerBookingSummary>((booking) => ({
      bookingCode: booking.booking_code,
      createdAt: booking.created_at,
      id: booking.id,
      paymentStatus: payments.get(booking.id)?.status ?? null,
      status: booking.status,
      totalPriceRupiah: booking.total_price_rupiah,
      venueName: names.get(booking.venue_id) ?? "Venue",
    })),
    grossSettledRupiah: aggregates?.gross_settled_rupiah ?? 0,
    platformFeeRupiah: aggregates?.platform_fee_rupiah ?? 0,
    refundedRupiah: aggregates?.refunded_rupiah ?? 0,
    venueNetRupiah: aggregates?.venue_net_rupiah ?? 0,
    venues: venues.map<OwnerVenueSummary>((venue) => {
      const venueCourts = courtsData.filter((c) => c.venue_id === venue.id)
      return {
        activeCourts: venueCourts.filter((c) => c.is_active).length,
        address: venue.address,
        city: venue.city,
        closingTime: venue.closing_time.slice(0, 5),
        courts: venueCourts.map((c) => ({
          id: c.id,
          isActive: c.is_active,
          name: c.name,
          pricePerHour: c.price_per_hour_rupiah,
        })),
        facilities: venue.facilities,
        id: venue.id,
        imageUrls: venue.image_urls,
        name: venue.name,
        openingTime: venue.opening_time.slice(0, 5),
        rejectionReason: venue.rejection_reason,
        slug: venue.slug,
        status: venue.status,
      }
    }),
  }
}

export async function getOwnerVenues(): Promise<OwnerVenueSummary[]> {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const venuesResult = await supabase
    .from("venues")
    .select("id, name, slug, city, address, image_urls, opening_time, closing_time, facilities, status, rejection_reason")
    .eq("owner_id", actor.id)
    .order("created_at", { ascending: false })
  if (venuesResult.error) throw new OwnerDataError("Daftar venue tidak dapat dimuat.")

  const venues = venuesResult.data ?? []
  const venueIds = venues.map((venue) => venue.id)
  const courtsResult = venueIds.length
    ? await supabase
        .from("courts")
        .select("id, venue_id, name, is_active, price_per_hour_rupiah")
        .in("venue_id", venueIds)
    : { data: [], error: null }
  if (courtsResult.error) throw new OwnerDataError("Jumlah lapangan tidak dapat dimuat.")

  const courtsData = courtsResult.data ?? []

  return venues.map((venue) => {
    const venueCourts = courtsData.filter((c) => c.venue_id === venue.id)
    return {
      activeCourts: venueCourts.filter((c) => c.is_active).length,
      address: venue.address,
      city: venue.city,
      closingTime: venue.closing_time.slice(0, 5),
      courts: venueCourts.map((c) => ({
        id: c.id,
        isActive: c.is_active,
        name: c.name,
        pricePerHour: c.price_per_hour_rupiah,
      })),
      facilities: venue.facilities,
      id: venue.id,
      imageUrls: venue.image_urls,
      name: venue.name,
      openingTime: venue.opening_time.slice(0, 5),
      rejectionReason: venue.rejection_reason,
      slug: venue.slug,
      status: venue.status,
    }
  })
}

export async function getOwnerVenue(venueId: string): Promise<OwnerVenueDetail | null> {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const { data: venue, error } = await supabase
    .from("venues")
    .select("id, name, slug, description, address, city, province, latitude, longitude, phone, email, opening_time, closing_time, facilities, image_urls, status, rejection_reason, submitted_at")
    .eq("id", venueId)
    .eq("owner_id", actor.id)
    .maybeSingle()
  if (error) throw new OwnerDataError("Detail venue tidak dapat dimuat.")
  if (!venue) return null

  return {
    address: venue.address,
    city: venue.city,
    closingTime: venue.closing_time.slice(0, 5),
    description: venue.description,
    email: venue.email,
    facilities: venue.facilities,
    id: venue.id,
    imageUrls: venue.image_urls,
    latitude: venue.latitude,
    longitude: venue.longitude,
    name: venue.name,
    openingTime: venue.opening_time.slice(0, 5),
    phone: venue.phone,
    province: venue.province,
    rejectionReason: venue.rejection_reason,
    slug: venue.slug,
    status: venue.status,
    submittedAt: venue.submitted_at,
  }
}

export async function getOwnerCourts(): Promise<{ courts: OwnerCourtSummary[]; venues: OwnerVenueSummary[] }> {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const venuesResult = await supabase
    .from("venues")
    .select("id, name, slug, city, address, image_urls, opening_time, closing_time, facilities, status, rejection_reason")
    .eq("owner_id", actor.id)
    .order("name")
  if (venuesResult.error) throw new OwnerDataError("Venue untuk lapangan tidak dapat dimuat.")
  const venueRows = venuesResult.data ?? []
  const venueIds = venueRows.map((venue) => venue.id)
  const courtsResult = venueIds.length
    ? await supabase
        .from("courts")
        .select("id, venue_id, name, court_number, surface_type, indoor, price_per_hour_rupiah, is_active")
        .in("venue_id", venueIds)
        .order("court_number")
    : { data: [], error: null }
  if (courtsResult.error) throw new OwnerDataError("Daftar lapangan tidak dapat dimuat.")

  const courtsData = courtsResult.data ?? []
  const names = new Map(venueRows.map((venue) => [venue.id, venue.name]))

  return {
    courts: courtsData.map((court) => ({
      courtNumber: court.court_number,
      id: court.id,
      indoor: court.indoor,
      isActive: court.is_active,
      name: court.name,
      pricePerHourRupiah: court.price_per_hour_rupiah,
      surfaceType: court.surface_type,
      venueId: court.venue_id,
      venueName: names.get(court.venue_id) ?? "Venue",
    })),
    venues: venueRows.map((venue) => {
      const venueCourts = courtsData.filter((c) => c.venue_id === venue.id)
      return {
        activeCourts: venueCourts.filter((c) => c.is_active).length,
        address: venue.address,
        city: venue.city,
        closingTime: venue.closing_time.slice(0, 5),
        courts: venueCourts.map((c) => ({
          id: c.id,
          isActive: c.is_active,
          name: c.name,
          pricePerHour: c.price_per_hour_rupiah,
        })),
        facilities: venue.facilities,
        id: venue.id,
        imageUrls: venue.image_urls,
        name: venue.name,
        openingTime: venue.opening_time.slice(0, 5),
        rejectionReason: venue.rejection_reason,
        slug: venue.slug,
        status: venue.status,
      }
    }),
  }
}

export async function getOwnerSchedule(requestedDate?: string): Promise<{ date: string; slots: OwnerScheduleSlot[] }> {
  const date = normalizeScheduleDate(requestedDate)
  const { start, end } = dateRangeForJakarta(date)
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const venuesResult = await supabase.from("venues").select("id, name").eq("owner_id", actor.id)
  if (venuesResult.error) throw new OwnerDataError("Venue untuk jadwal tidak dapat dimuat.")
  const venues = venuesResult.data ?? []
  const venueIds = venues.map((venue) => venue.id)
  if (!venueIds.length) return { date, slots: [] }

  const courtsResult = await supabase.from("courts").select("id, venue_id, name").in("venue_id", venueIds)
  if (courtsResult.error) throw new OwnerDataError("Lapangan untuk jadwal tidak dapat dimuat.")
  const courts = courtsResult.data ?? []
  const courtIds = courts.map((court) => court.id)
  if (!courtIds.length) return { date, slots: [] }

  const slotsResult = await supabase
    .from("booking_slots")
    .select("id, court_id, starts_at, ends_at, price_rupiah, status, blocked_reason")
    .in("court_id", courtIds)
    .gte("starts_at", start)
    .lt("starts_at", end)
    .order("starts_at")
  if (slotsResult.error) throw new OwnerDataError("Jadwal lapangan tidak dapat dimuat.")

  const venueNames = new Map(venues.map((venue) => [venue.id, venue.name]))
  const courtMap = new Map(courts.map((court) => [court.id, court]))
  return {
    date,
    slots: (slotsResult.data ?? []).map((slot) => {
      const court = courtMap.get(slot.court_id)
      return {
        blockedReason: slot.blocked_reason,
        courtName: court?.name ?? "Lapangan",
        endsAt: slot.ends_at,
        id: slot.id,
        priceRupiah: slot.price_rupiah,
        startsAt: slot.starts_at,
        status: slot.status,
        venueName: court ? venueNames.get(court.venue_id) ?? "Venue" : "Venue",
      }
    }),
  }
}

export async function getOwnerBookings(requestedPage = 1): Promise<OwnerBookingsPage> {
  const { actor, supabase } = await requireRole("VENUE_OWNER")
  const venuesResult = await supabase.from("venues").select("id, name").eq("owner_id", actor.id)
  if (venuesResult.error) throw new OwnerDataError("Venue untuk booking tidak dapat dimuat.")
  const venues = venuesResult.data ?? []
  const venueIds = venues.map((venue) => venue.id)
  if (!venueIds.length) return { items: [], page: 1, pageCount: 1, total: 0 }

  const countResult = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .in("venue_id", venueIds)
  if (countResult.error) throw new OwnerDataError("Jumlah booking tidak dapat dimuat.")
  const total = countResult.count ?? 0
  const pageCount = Math.max(1, Math.ceil(total / ownerBookingsPageSize))
  const page = Math.min(Math.max(1, Math.floor(requestedPage)), pageCount)
  const bookingsResult = await supabase
    .from("bookings")
    .select("id, booking_code, venue_id, status, total_price_rupiah, created_at")
    .in("venue_id", venueIds)
    .order("created_at", { ascending: false })
    .range((page - 1) * ownerBookingsPageSize, page * ownerBookingsPageSize - 1)
  if (bookingsResult.error) throw new OwnerDataError("Daftar booking tidak dapat dimuat.")
  const bookings = bookingsResult.data ?? []
  const bookingIds = bookings.map((booking) => booking.id)
  if (!bookingIds.length) return { items: [], page, pageCount, total }

  const [paymentsResult, itemsResult] = await Promise.all([
    supabase
      .from("payments")
      .select("booking_id, status, created_at")
      .in("booking_id", bookingIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("booking_items")
      .select("booking_id, court_id, starts_at, ends_at")
      .in("booking_id", bookingIds)
      .order("starts_at"),
  ])
  if (paymentsResult.error || itemsResult.error) throw new OwnerDataError("Detail booking tidak dapat dimuat.")

  const itemCourtIds = [...new Set((itemsResult.data ?? []).map((item) => item.court_id))]
  const courtsResult = itemCourtIds.length
    ? await supabase.from("courts").select("id, name").in("id", itemCourtIds).in("venue_id", venueIds)
    : { data: [], error: null }
  if (courtsResult.error) throw new OwnerDataError("Nama lapangan booking tidak dapat dimuat.")

  const payments = new Map<string, PaymentStatus>()
  for (const payment of paymentsResult.data ?? []) {
    if (!payments.has(payment.booking_id)) payments.set(payment.booking_id, payment.status)
  }
  const bookingItems = new Map<string, (typeof itemsResult.data)>()
  for (const item of itemsResult.data ?? []) {
    bookingItems.set(item.booking_id, [...(bookingItems.get(item.booking_id) ?? []), item])
  }
  const courtNames = new Map((courtsResult.data ?? []).map((court) => [court.id, court.name]))
  const venueNames = new Map(venues.map((venue) => [venue.id, venue.name]))

  return {
    items: bookings.map((booking) => {
      const items = bookingItems.get(booking.id) ?? []
      return {
        bookingCode: booking.booking_code,
        courtNames: [...new Set(items.map((item) => courtNames.get(item.court_id) ?? "Lapangan"))],
        createdAt: booking.created_at,
        endsAt: items.at(-1)?.ends_at ?? null,
        id: booking.id,
        paymentStatus: payments.get(booking.id) ?? null,
        startsAt: items[0]?.starts_at ?? null,
        status: booking.status,
        totalPriceRupiah: booking.total_price_rupiah,
        venueName: venueNames.get(booking.venue_id) ?? "Venue",
      }
    }),
    page,
    pageCount,
    total,
  }
}
