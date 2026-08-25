# PadelKu Local Database

Run `npx supabase start`, then `npm run db:reset` to apply migrations and seed. Run `npm run db:test` for the pgTAP lifecycle and RLS suite.

Local-only demo credentials:

| Role | Email | Password |
| --- | --- | --- |
| Player | `player@padelku.id` | `PadelKuDev123!` |
| Venue owner | `owner@padelku.id` | `PadelKuDev123!` |
| Admin | `admin@padelku.id` | `PadelKuDev123!` |

These credentials are development fixtures and must not be used in a hosted environment. The admin role comes from trusted `raw_app_meta_data`; signup metadata can request only `PLAYER` or `VENUE_OWNER`.

Booking lifecycle RPCs are server-only. Call them from a trusted backend with the Supabase service role key; never expose that key to a browser or mobile client.

The active payment mode is `internal_sandbox`: VA, QRIS, and e-wallet instructions are simulated and never process real money. Payment creation and transitions are idempotent, only one pending attempt can exist per booking, and all transitions append immutable request/response snapshots to `payment_events`.

Call `POST /api/internal/maintenance` periodically with `Authorization: Bearer $MAINTENANCE_SECRET`. It atomically expires abandoned bookings and completes funded bookings whose slots have ended. A one-minute scheduler is recommended; the endpoint accepts an optional `?limit=1..500`.
