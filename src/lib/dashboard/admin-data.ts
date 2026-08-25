import "server-only"

import { requireRole } from "./auth"
import type { BookingStatus, PaymentStatus, VenueStatus } from "@/types/database"

export interface AdminVenueReviewItem {
  activeCourtCount: number
  address: string
  city: string
  facilities: string[]
  id: string
  imageCount: number
  imageUrls: string[]
  name: string
  openingTime: string
  closingTime: string
  ownerEmail: string
  ownerName: string
  phone: string | null
  province: string
  submittedAt: string
}

export interface AdminActiveVenueItem {
  activeCourts: number
  city: string
  closingTime: string
  id: string
  name: string
  openingTime: string
  ownerName: string
  phone: string | null
  status: VenueStatus
}

export interface AdminOverview {
  approvedVenueCount: number
  approvedVenuesList: AdminActiveVenueItem[]
  bookingCount: number
  cityDistribution: Array<{ city: string; count: number }>
  pendingVenues: AdminVenueReviewItem[]
  settledRevenueRupiah: number
  suspendedVenueCount: number
  totalUserCount: number
  totalVenueCount: number
}

export interface AdminTransactionFilters {
  page?: number
  paymentStatus?: PaymentStatus
  query?: string
  status?: BookingStatus
}

export interface AdminTransactionItem {
  amountRupiah: number
  bookingCode: string
  bookingId: string
  bookingStatus: BookingStatus
  createdAt: string
  disputeStatus: "OPEN" | "WON" | "LOST" | null
  paidAt: string | null
  paymentMethod: string | null
  paymentId: string | null
  paymentProvider: string | null
  paymentStatus: PaymentStatus | null
  playerEmail: string
  playerName: string
  venueName: string
}

export interface AdminTransactions {
  items: AdminTransactionItem[]
  page: number
  pageCount: number
  total: number
}

export class AdminDataError extends Error {
  constructor(message = "Data admin tidak dapat dimuat.") {
    super(message)
    this.name = "AdminDataError"
  }
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const { supabase } = await requireRole("ADMIN")
  const [venuesResult, bookingsResult, usersResult, paymentsResult] = await Promise.all([
    supabase
      .from("venues")
      .select("id, owner_id, name, address, city, province, phone, image_urls, facilities, opening_time, closing_time, status, submitted_at"),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("amount_rupiah").eq("status", "SETTLED"),
  ])

  if (venuesResult.error || bookingsResult.error || usersResult.error || paymentsResult.error) {
    throw new AdminDataError()
  }

  const venues = venuesResult.data ?? []
  const pending = venues
    .filter((venue) => venue.status === "PENDING" && venue.submitted_at)
    .sort((left, right) => left.submitted_at!.localeCompare(right.submitted_at!))
  const allOwnerIds = [...new Set(venues.map((venue) => venue.owner_id))]
  const allVenueIds = venues.map((venue) => venue.id)
  const [ownersResult, courtsResult] = await Promise.all([
    allOwnerIds.length
      ? supabase.from("profiles").select("id, full_name, email").in("id", allOwnerIds)
      : Promise.resolve({ data: [], error: null }),
    allVenueIds.length
      ? supabase.from("courts").select("venue_id").in("venue_id", allVenueIds).eq("is_active", true)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (ownersResult.error || courtsResult.error) throw new AdminDataError("Antrean verifikasi tidak dapat dimuat.")
  const owners = new Map((ownersResult.data ?? []).map((owner) => [owner.id, owner]))
  const courtCounts = new Map<string, number>()
  for (const court of courtsResult.data ?? []) {
    courtCounts.set(court.venue_id, (courtCounts.get(court.venue_id) ?? 0) + 1)
  }

  const cityCounts = new Map<string, number>()
  for (const v of venues) {
    cityCounts.set(v.city, (cityCounts.get(v.city) ?? 0) + 1)
  }
  const cityDistribution = Array.from(cityCounts.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)

  const approvedVenuesList = venues
    .filter((venue) => venue.status === "APPROVED")
    .map((venue) => {
      const owner = owners.get(venue.owner_id)
      return {
        activeCourts: courtCounts.get(venue.id) ?? 0,
        city: venue.city,
        closingTime: venue.closing_time.slice(0, 5),
        id: venue.id,
        name: venue.name,
        openingTime: venue.opening_time.slice(0, 5),
        ownerName: owner?.full_name ?? "Pemilik",
        phone: venue.phone,
        status: venue.status,
      }
    })

  return {
    approvedVenueCount: venues.filter((venue) => venue.status === "APPROVED").length,
    approvedVenuesList,
    bookingCount: bookingsResult.count ?? 0,
    cityDistribution,
    pendingVenues: pending.map((venue) => {
      const owner = owners.get(venue.owner_id)
      return {
        activeCourtCount: courtCounts.get(venue.id) ?? 0,
        address: venue.address,
        city: venue.city,
        closingTime: venue.closing_time.slice(0, 5),
        facilities: venue.facilities,
        id: venue.id,
        imageCount: venue.image_urls.length,
        imageUrls: venue.image_urls,
        name: venue.name,
        openingTime: venue.opening_time.slice(0, 5),
        ownerEmail: owner?.email ?? "Email tidak tersedia",
        ownerName: owner?.full_name ?? "Pemilik tidak ditemukan",
        phone: venue.phone,
        province: venue.province,
        submittedAt: venue.submitted_at!,
      }
    }),
    settledRevenueRupiah: (paymentsResult.data ?? []).reduce((total, payment) => total + payment.amount_rupiah, 0),
    suspendedVenueCount: venues.filter((venue) => venue.status === "SUSPENDED").length,
    totalUserCount: usersResult.count ?? 0,
    totalVenueCount: venues.length,
  }
}

export async function getAdminTransactions(filters: AdminTransactionFilters): Promise<AdminTransactions> {
  const { supabase } = await requireRole("ADMIN")
  const pageSize = 25
  const page = Math.max(1, Math.floor(filters.page ?? 1))
  let paymentBookingIds: string[] | undefined
  if (filters.paymentStatus) {
    const paymentFilterResult = await supabase
      .from("payments")
      .select("booking_id")
      .eq("status", filters.paymentStatus)
    if (paymentFilterResult.error) throw new AdminDataError("Filter pembayaran tidak dapat diterapkan.")
    paymentBookingIds = [...new Set((paymentFilterResult.data ?? []).map((payment) => payment.booking_id))]
    if (paymentBookingIds.length === 0) return { items: [], page: 1, pageCount: 1, total: 0 }
  }

  let query = supabase
    .from("bookings")
    .select("id, booking_code, user_id, venue_id, status, total_price_rupiah, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (filters.status) query = query.eq("status", filters.status)
  if (filters.query?.trim()) query = query.ilike("booking_code", `%${filters.query.trim().replaceAll("%", "")}%`)
  if (paymentBookingIds) query = query.in("id", paymentBookingIds)

  const bookingsResult = await query
  if (bookingsResult.error) throw new AdminDataError("Transaksi tidak dapat dimuat.")
  const bookings = bookingsResult.data ?? []
  const bookingIds = bookings.map((booking) => booking.id)
  const userIds = [...new Set(bookings.map((booking) => booking.user_id))]
  const venueIds = [...new Set(bookings.map((booking) => booking.venue_id))]
  const [paymentsResult, playersResult, venuesResult] = await Promise.all([
    bookingIds.length
      ? supabase.from("payments").select("id, booking_id, status, method, provider, amount_rupiah, paid_at, created_at").in("booking_id", bookingIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    userIds.length
      ? supabase.from("profiles").select("id, full_name, email").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    venueIds.length
      ? supabase.from("venues").select("id, name").in("id", venueIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (paymentsResult.error || playersResult.error || venuesResult.error) throw new AdminDataError("Detail transaksi tidak dapat dimuat.")
  const payments = new Map<string, (typeof paymentsResult.data)[number]>()
  for (const payment of paymentsResult.data ?? []) {
    if (payments.has(payment.booking_id)) continue
    if (!filters.paymentStatus || payment.status === filters.paymentStatus) {
      payments.set(payment.booking_id, payment)
    }
  }
  const selectedPaymentIds = [...payments.values()].map((payment) => payment.id)
  const disputesResult = selectedPaymentIds.length
    ? await supabase
        .from("payment_disputes")
        .select("payment_id, status")
        .in("payment_id", selectedPaymentIds)
    : { data: [], error: null }
  if (disputesResult.error) throw new AdminDataError("Status sengketa tidak dapat dimuat.")
  const disputes = new Map((disputesResult.data ?? []).map((dispute) => [dispute.payment_id, dispute.status]))
  const players = new Map((playersResult.data ?? []).map((player) => [player.id, player]))
  const venues = new Map((venuesResult.data ?? []).map((venue) => [venue.id, venue.name]))

  const items = bookings.map<AdminTransactionItem>((booking) => {
    const payment = payments.get(booking.id)
    const player = players.get(booking.user_id)
    return {
      amountRupiah: payment?.amount_rupiah ?? booking.total_price_rupiah,
      bookingCode: booking.booking_code,
      bookingId: booking.id,
      bookingStatus: booking.status,
      createdAt: booking.created_at,
      disputeStatus: payment ? disputes.get(payment.id) as AdminTransactionItem["disputeStatus"] ?? null : null,
      paidAt: payment?.paid_at ?? null,
      paymentMethod: payment?.method ?? null,
      paymentId: payment?.id ?? null,
      paymentProvider: payment?.provider ?? null,
      paymentStatus: payment?.status ?? null,
      playerEmail: player?.email ?? "-",
      playerName: player?.full_name ?? "Pemain tidak ditemukan",
      venueName: venues.get(booking.venue_id) ?? "Venue tidak ditemukan",
    }
  })
  const total = bookingsResult.count ?? 0
  return { items, page, pageCount: Math.max(1, Math.ceil(total / pageSize)), total }
}

export const adminBookingStatuses: BookingStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "CANCELLED"]
export const adminPaymentStatuses: PaymentStatus[] = ["PENDING", "SETTLED", "FAILED", "EXPIRED", "REFUNDED"]
export const adminVenueStatuses: VenueStatus[] = ["DRAFT", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"]
