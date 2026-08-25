export type {
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './database.generated'
export { Constants } from './database.generated'

import type { Enums, Tables } from './database.generated'

export type Profile = Tables<'profiles'>
export type Venue = Tables<'venues'>
export type Court = Tables<'courts'>
export type BookingSlot = Tables<'booking_slots'>
export type Booking = Tables<'bookings'>
export type BookingItem = Tables<'booking_items'>
export type Payment = Tables<'payments'>
export type PaymentEvent = Tables<'payment_events'>
export type PaymentDispute = Tables<'payment_disputes'>
export type Review = Tables<'reviews'>
export type Notification = Tables<'notifications'>
export type AuditLog = Tables<'audit_logs'>

export type UserRole = Enums<'user_role'>
export type VenueStatus = Enums<'venue_status'>
export type BookingSlotStatus = Enums<'booking_slot_status'>
export type BookingStatus = Enums<'booking_status'>
export type PaymentMethod = Enums<'payment_method'>
export type PaymentStatus = Enums<'payment_status'>
