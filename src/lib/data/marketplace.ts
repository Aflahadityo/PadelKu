import type { SupabaseClient } from "@supabase/supabase-js"
import { createServerSupabase } from "@/lib/supabase/server"
import type { Database, Tables } from "@/types/database"

const fallbackVenueImages = [
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=85",
] as const

type Venue = Tables<"venues">
type Court = Tables<"courts">
type Review = Tables<"reviews">
type BookingSlot = Tables<"booking_slots">

export type MarketplaceSort = "recommended" | "rating" | "price_asc" | "price_desc" | "name"

export interface MarketplaceFilters {
  q?: string
  city?: string
  date?: string
  facility?: string
  sort?: MarketplaceSort
}

export interface VenueDiscoveryItem {
  availableSlotCount: number
  city: string
  facilities: string[]
  id: string
  imageUrl: string
  maxPriceRupiah: number
  minPriceRupiah: number
  name: string
  rating: number
  reviewCount: number
  slug: string
}

export interface MarketplaceDiscovery {
  cities: string[]
  facilities: string[]
  venues: VenueDiscoveryItem[]
}

export interface VenueReview {
  comment: string | null
  createdAt: string
  id: string
  rating: number
  reviewerName: string | null
}

export interface VenueDetail {
  address: string
  city: string
  closingTime: string
  courts: Court[]
  description: string | null
  email: string | null
  facilities: string[]
  id: string
  imageUrls: string[]
  latitude: number | null
  longitude: number | null
  name: string
  openingTime: string
  ownerName: string | null
  phone: string | null
  province: string
  rating: number
  reviewCount: number
  reviews: VenueReview[]
  slug: string
  startingPriceRupiah: number
  timezone: string
}

export interface AvailabilitySlot {
  courtId: string
  endsAt: string
  id: string
  priceRupiah: number
  startsAt: string
  status: BookingSlot["status"]
}

export interface VenueAvailability {
  courts: Array<{
    courtNumber: number
    id: string
    indoor: boolean
    name: string
    pricePerHourRupiah: number
    surfaceType: string
  }>
  date: string
  slots: AvailabilitySlot[]
  timezone: string
  venueId: string
}

export class MarketplaceDataError extends Error {
  constructor(message = "Data marketplace tidak dapat dimuat.") {
    super(message)
    this.name = "MarketplaceDataError"
  }
}

export async function getTypedServerSupabase(): Promise<SupabaseClient<Database>> {
  return (await createServerSupabase()) as SupabaseClient<Database>
}

function stableImageIndex(value: string, offset = 0) {
  let hash = 0
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return (hash + offset) % fallbackVenueImages.length
}

function isAllowedUnsplashImage(value: string) {
  try {
    return new URL(value).hostname === "images.unsplash.com"
  } catch {
    return false
  }
}

export function getVenueImages(venue: Pick<Venue, "id" | "image_urls">, count = 1) {
  const configured = venue.image_urls.filter(isAllowedUnsplashImage)
  const images = [...configured]
  for (let offset = 0; images.length < count && offset < fallbackVenueImages.length; offset += 1) {
    const fallback = fallbackVenueImages[stableImageIndex(venue.id, offset)]
    if (!images.includes(fallback)) images.push(fallback)
  }
  return images.slice(0, Math.max(count, configured.length))
}

const utcPlusEightProvinces = new Set([
  "bali",
  "nusa tenggara barat",
  "nusa tenggara timur",
  "kalimantan selatan",
  "kalimantan timur",
  "kalimantan utara",
  "sulawesi barat",
  "sulawesi selatan",
  "sulawesi tengah",
  "sulawesi tenggara",
  "sulawesi utara",
  "gorontalo",
])

const utcPlusNineProvinces = new Set([
  "maluku",
  "maluku utara",
  "papua",
  "papua barat",
  "papua barat daya",
  "papua pegunungan",
  "papua selatan",
  "papua tengah",
])

export function resolveVenueTimezone(province: string) {
  const normalized = province.trim().toLowerCase()
  if (utcPlusNineProvinces.has(normalized)) return "Asia/Jayapura"
  if (utcPlusEightProvinces.has(normalized)) return "Asia/Makassar"
  return "Asia/Jakarta"
}

function timezoneOffsetHours(timezone: string) {
  if (timezone === "Asia/Jayapura") return 9
  if (timezone === "Asia/Makassar") return 8
  return 7
}

export function isValidLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
}

export function getUtcDateRange(localDate: string, timezone: string) {
  const [year, month, day] = localDate.split("-").map(Number)
  const offsetMilliseconds = timezoneOffsetHours(timezone) * 60 * 60 * 1000
  const start = new Date(Date.UTC(year, month - 1, day) - offsetMilliseconds)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

function currentLocalDate(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).format(new Date())
}

function averageRating(reviews: Array<Pick<Review, "rating">>) {
  if (reviews.length === 0) return 0
  return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
}

export async function getMarketplaceDiscovery(filters: MarketplaceFilters): Promise<MarketplaceDiscovery> {
  const supabase = await getTypedServerSupabase()
  let venueQuery = supabase
    .from("venues")
    .select("id, name, slug, city, province, address, facilities, image_urls, status")
    .eq("status", "APPROVED")

  if (filters.city) venueQuery = venueQuery.eq("city", filters.city)
  if (filters.facility) venueQuery = venueQuery.contains("facilities", [filters.facility])

  const { data: approvedVenues, error: venueError } = await venueQuery
  if (venueError) throw new MarketplaceDataError()

  const allApprovedResult = await supabase
    .from("venues")
    .select("city, facilities")
    .eq("status", "APPROVED")
  if (allApprovedResult.error) throw new MarketplaceDataError()

  const query = filters.q?.trim().toLocaleLowerCase("id-ID")
  const venues = (approvedVenues ?? []).filter((venue) => {
    if (!query) return true
    return [venue.name, venue.city, venue.address].some((value) => value.toLocaleLowerCase("id-ID").includes(query))
  })

  const venueIds = venues.map((venue) => venue.id)
  if (venueIds.length === 0) {
    return {
      cities: [...new Set((allApprovedResult.data ?? []).map((venue) => venue.city))].sort(),
      facilities: [...new Set((allApprovedResult.data ?? []).flatMap((venue) => venue.facilities))].sort(),
      venues: [],
    }
  }

  const [courtsResult, reviewsResult] = await Promise.all([
    supabase
      .from("courts")
      .select("id, venue_id, price_per_hour_rupiah, is_active")
      .in("venue_id", venueIds)
      .eq("is_active", true),
    supabase.from("reviews").select("id, venue_id, rating").in("venue_id", venueIds),
  ])
  if (courtsResult.error || reviewsResult.error) throw new MarketplaceDataError()

  const courts = courtsResult.data ?? []
  const courtIds = courts.map((court) => court.id)
  let availableSlots: Array<Pick<BookingSlot, "court_id">> = []

  if ((!filters.date || isValidLocalDate(filters.date)) && courtIds.length > 0) {
    const courtsByVenue = new Map<string, string[]>()
    for (const court of courts) {
      const ids = courtsByVenue.get(court.venue_id) ?? []
      ids.push(court.id)
      courtsByVenue.set(court.venue_id, ids)
    }
    const courtsByTimezone = new Map<string, string[]>()
    for (const venue of venues) {
      const timezone = resolveVenueTimezone(venue.province)
      const ids = courtsByTimezone.get(timezone) ?? []
      ids.push(...(courtsByVenue.get(venue.id) ?? []))
      courtsByTimezone.set(timezone, ids)
    }

    const slotResults = await Promise.all(
      [...courtsByTimezone.entries()].map(([timezone, timezoneCourtIds]) => {
        const date = filters.date ?? currentLocalDate(timezone)
        const { start, end } = getUtcDateRange(date, timezone)
        return supabase
          .from("booking_slots")
          .select("court_id")
          .in("court_id", timezoneCourtIds)
          .eq("status", "AVAILABLE")
          .gte("starts_at", start)
          .lt("starts_at", end)
      }),
    )
    if (slotResults.some((result) => result.error)) throw new MarketplaceDataError()
    availableSlots = slotResults.flatMap((result) => result.data ?? [])
  }

  const slotCountByCourt = new Map<string, number>()
  for (const slot of availableSlots) slotCountByCourt.set(slot.court_id, (slotCountByCourt.get(slot.court_id) ?? 0) + 1)

  const items = venues.map<VenueDiscoveryItem>((venue) => {
    const venueCourts = courts.filter((court) => court.venue_id === venue.id)
    const prices = venueCourts.map((court) => court.price_per_hour_rupiah)
    const venueReviews = (reviewsResult.data ?? []).filter((review) => review.venue_id === venue.id)
    return {
      availableSlotCount: venueCourts.reduce((total, court) => total + (slotCountByCourt.get(court.id) ?? 0), 0),
      city: venue.city,
      facilities: venue.facilities,
      id: venue.id,
      imageUrl: getVenueImages(venue)[0],
      maxPriceRupiah: prices.length > 0 ? Math.max(...prices) : 0,
      minPriceRupiah: prices.length > 0 ? Math.min(...prices) : 0,
      name: venue.name,
      rating: averageRating(venueReviews),
      reviewCount: venueReviews.length,
      slug: venue.slug,
    }
  })

  const visibleItems = filters.date ? items.filter((venue) => venue.availableSlotCount > 0) : items
  const sort = filters.sort ?? "recommended"
  visibleItems.sort((left, right) => {
    if (sort === "price_asc") return left.minPriceRupiah - right.minPriceRupiah
    if (sort === "price_desc") return right.maxPriceRupiah - left.maxPriceRupiah
    if (sort === "name") return left.name.localeCompare(right.name, "id")
    if (sort === "rating") return right.rating - left.rating || right.reviewCount - left.reviewCount
    return right.rating - left.rating || right.reviewCount - left.reviewCount || left.name.localeCompare(right.name, "id")
  })

  return {
    cities: [...new Set((allApprovedResult.data ?? []).map((venue) => venue.city))].sort(),
    facilities: [...new Set((allApprovedResult.data ?? []).flatMap((venue) => venue.facilities))].sort(),
    venues: visibleItems,
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function getVenueDetail(identifier: string): Promise<VenueDetail | null> {
  const supabase = await getTypedServerSupabase()
  let venueQuery = supabase.from("venues").select("*").eq("status", "APPROVED")
  venueQuery = isUuid(identifier) ? venueQuery.eq("id", identifier) : venueQuery.eq("slug", identifier)
  const { data: venue, error: venueError } = await venueQuery.maybeSingle()
  if (venueError) throw new MarketplaceDataError("Detail venue tidak dapat dimuat.")
  if (!venue) return null

  const [courtsResult, reviewsResult] = await Promise.all([
    supabase.from("courts").select("*").eq("venue_id", venue.id).eq("is_active", true).order("court_number"),
    supabase.from("reviews").select("*").eq("venue_id", venue.id).order("created_at", { ascending: false }).limit(20),
  ])
  if (courtsResult.error || reviewsResult.error) throw new MarketplaceDataError("Detail venue tidak dapat dimuat.")

  const reviews = reviewsResult.data ?? []
  const profileIds = [...new Set([venue.owner_id, ...reviews.map((review) => review.user_id)])]
  const profilesResult = await supabase.from("profiles").select("id, full_name").in("id", profileIds)
  const profiles = profilesResult.error ? [] : (profilesResult.data ?? [])
  const profileNames = new Map(profiles.map((profile) => [profile.id, profile.full_name]))
  const prices = (courtsResult.data ?? []).map((court) => court.price_per_hour_rupiah)

  return {
    address: venue.address,
    city: venue.city,
    closingTime: venue.closing_time,
    courts: courtsResult.data ?? [],
    description: venue.description,
    email: venue.email,
    facilities: venue.facilities,
    id: venue.id,
    imageUrls: getVenueImages(venue, 4),
    latitude: venue.latitude,
    longitude: venue.longitude,
    name: venue.name,
    openingTime: venue.opening_time,
    ownerName: profileNames.get(venue.owner_id) ?? null,
    phone: venue.phone,
    province: venue.province,
    rating: averageRating(reviews),
    reviewCount: reviews.length,
    reviews: reviews.map((review) => ({
      comment: review.comment,
      createdAt: review.created_at,
      id: review.id,
      rating: review.rating,
      reviewerName: profileNames.get(review.user_id) ?? null,
    })),
    slug: venue.slug,
    startingPriceRupiah: prices.length > 0 ? Math.min(...prices) : 0,
    timezone: resolveVenueTimezone(venue.province),
  }
}

export async function getVenueAvailability(venueId: string, date: string): Promise<VenueAvailability | null> {
  const supabase = await getTypedServerSupabase()
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, province")
    .eq("id", venueId)
    .eq("status", "APPROVED")
    .maybeSingle()
  if (venueError) throw new MarketplaceDataError("Ketersediaan tidak dapat dimuat.")
  if (!venue) return null

  const { data: courts, error: courtError } = await supabase
    .from("courts")
    .select("id, name, court_number, indoor, surface_type, price_per_hour_rupiah")
    .eq("venue_id", venue.id)
    .eq("is_active", true)
    .order("court_number")
  if (courtError) throw new MarketplaceDataError("Ketersediaan tidak dapat dimuat.")

  const timezone = resolveVenueTimezone(venue.province)
  const range = getUtcDateRange(date, timezone)
  const courtIds = (courts ?? []).map((court) => court.id)
  type SlotRow = Pick<BookingSlot, "id" | "court_id" | "starts_at" | "ends_at" | "price_rupiah" | "status">
  const slotsResult = courtIds.length === 0
    ? { data: [] as SlotRow[], error: null }
    : await supabase.rpc("get_venue_availability", {
        p_ends_at: range.end,
        p_starts_at: range.start,
        p_venue_id: venue.id,
      })
  if (slotsResult.error) throw new MarketplaceDataError("Ketersediaan tidak dapat dimuat.")

  return {
    courts: (courts ?? []).map((court) => ({
      courtNumber: court.court_number,
      id: court.id,
      indoor: court.indoor,
      name: court.name,
      pricePerHourRupiah: court.price_per_hour_rupiah,
      surfaceType: court.surface_type,
    })),
    date,
    slots: (slotsResult.data ?? []).map((slot) => ({
      courtId: slot.court_id,
      endsAt: slot.ends_at,
      id: slot.id,
      priceRupiah: slot.price_rupiah,
      startsAt: slot.starts_at,
      status: slot.status,
    })),
    timezone,
    venueId,
  }
}
