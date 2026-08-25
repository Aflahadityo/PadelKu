import { randomUUID } from "node:crypto"
import Link from "next/link"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  WalletCards,
  X,
} from "lucide-react"
import { Panel } from "@/components/dashboard/panel"
import { DashboardForm } from "@/components/dashboard/dashboard-form"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import {
  adminBookingStatuses,
  adminPaymentStatuses,
  getAdminTransactions,
} from "@/lib/dashboard/admin-data"
import { formatCurrency } from "@/lib/utils"
import type { BookingStatus, PaymentStatus } from "@/types/database"
import { transitionPaymentAction } from "@/lib/dashboard/payment-actions"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const bookingLabels: Record<BookingStatus, string> = {
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
  CONFIRMED: "Terkonfirmasi",
  PENDING_PAYMENT: "Menunggu Bayar",
}

const paymentLabels: Record<PaymentStatus, string> = {
  EXPIRED: "Kedaluwarsa",
  FAILED: "Gagal",
  PENDING: "Menunggu",
  REFUNDED: "Dikembalikan (Refund)",
  SETTLED: "Lunas (Settled)",
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function pageHref(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params)
  next.set("page", String(page))
  return `/admin/transactions?${next}`
}

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const raw = await searchParams
  const query = single(raw.q)?.slice(0, 80) ?? ""
  const statusValue = single(raw.status)
  const paymentValue = single(raw.payment)
  const status = adminBookingStatuses.includes(statusValue as BookingStatus)
    ? (statusValue as BookingStatus)
    : undefined
  const paymentStatus = adminPaymentStatuses.includes(paymentValue as PaymentStatus)
    ? (paymentValue as PaymentStatus)
    : undefined
  const page = Math.max(1, Number.parseInt(single(raw.page) ?? "1", 10) || 1)
  const transactions = await getAdminTransactions({ page, paymentStatus, query, status })

  const activeParams = new URLSearchParams()
  if (query) activeParams.set("q", query)
  if (status) activeParams.set("status", status)
  if (paymentStatus) activeParams.set("payment", paymentStatus)

  const hasFilters = Boolean(query || status || paymentStatus)

  return (
    <main className="space-y-8">
      {/* Page Header */}
      <PageHeader
        eyebrow="Finansial & Pembayaran"
        title="Monitor Transaksi & Rekonsiliasi"
        description="Lacak status alur pembayaran, periksa dispute transaksi, dan jalankan simulasi sandbox gateway."
        actions={
          <Button asChild variant="secondary" className="text-xs font-bold shadow-2xs">
            <Link href="/admin">
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>Kembali ke Ringkasan</span>
            </Link>
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <form
        action="/admin/transactions"
        method="get"
        className="rounded-2xl border border-border/90 bg-surface p-4 sm:p-5 shadow-xs space-y-3"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1.5fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_auto]">
          {/* Keyword Search */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={query}
              placeholder="Cari kode booking, nama pemain, atau email..."
              className="h-11 w-full rounded-xl border border-border-strong bg-surface pl-10 pr-3 text-xs sm:text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            />
          </div>

          {/* Booking Status Filter */}
          <div>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            >
              <option value="">Semua Status Booking</option>
              {adminBookingStatuses.map((value) => (
                <option key={value} value={value}>
                  {bookingLabels[value]}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              name="payment"
              defaultValue={paymentStatus ?? ""}
              className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            >
              <option value="">Semua Status Pembayaran</option>
              {adminPaymentStatuses.map((value) => (
                <option key={value} value={value}>
                  {paymentLabels[value]}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="btn-cta text-xs font-bold px-6 h-11 shadow-xs">
            <SlidersHorizontal className="size-4" />
            <span>Terapkan</span>
          </Button>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between border-t border-border/80 pt-2 text-xs">
            <span className="text-ink-muted">Filter pencarian aktif</span>
            <Link
              href="/admin/transactions"
              className="inline-flex items-center gap-1 font-bold text-error hover:underline"
            >
              <X className="size-3.5" />
              <span>Reset Filter</span>
            </Link>
          </div>
        )}
      </form>

      {/* Transactions Table Panel */}
      <Panel className="overflow-hidden p-0 sm:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-surface-muted/30 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
              Daftar Transaksi Terbaru
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {transactions.total} total transaksi ditemukan di database
            </p>
          </div>

          <span className="font-mono text-xs font-semibold text-ink-muted bg-surface px-3 py-1 rounded-full border border-border">
            Halaman {transactions.page} dari {Math.max(1, transactions.pageCount)}
          </span>
        </div>

        {transactions.items.length === 0 ? (
          <EmptyState
            className="border-0 py-12"
            icon={<WalletCards className="size-8" aria-hidden="true" />}
            title="Tidak Ada Transaksi Ditemukan"
            description="Coba ubah kata kunci pencarian atau sesuaikan filter status booking dan pembayaran."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[64rem] text-left text-xs">
              <thead className="bg-surface-muted text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-5 py-3.5">Kode Booking</th>
                  <th className="px-5 py-3.5">Pemain</th>
                  <th className="px-5 py-3.5">Venue</th>
                  <th className="px-5 py-3.5">Status Booking</th>
                  <th className="px-5 py-3.5">Status Bayar</th>
                  <th className="px-5 py-3.5 text-right">Nilai & Sandbox Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {transactions.items.map((item) => (
                  <tr
                    key={item.bookingId}
                    className="align-top hover:bg-surface-muted/30 transition-colors"
                  >
                    {/* Booking Code & Timestamp */}
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-ink text-sm">
                        {item.bookingCode}
                      </p>
                      <time
                        className="mt-1 block font-mono text-[0.6875rem] text-ink-muted"
                        dateTime={item.createdAt}
                      >
                        {new Intl.DateTimeFormat("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(item.createdAt))}
                      </time>
                    </td>

                    {/* Player info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-lg bg-brand/10 text-brand font-bold text-xs">
                          {item.playerName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">{item.playerName}</p>
                          <p className="text-[0.6875rem] text-ink-muted">{item.playerEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Venue Name */}
                    <td className="px-5 py-4 font-semibold text-ink">
                      {item.venueName}
                    </td>

                    {/* Booking Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={item.bookingStatus} />
                    </td>

                    {/* Payment Status & Provider */}
                    <td className="px-5 py-4">
                      {item.paymentStatus ? (
                        <StatusBadge status={item.paymentStatus} />
                      ) : (
                        <span className="text-xs text-ink-muted">Belum dibuat</span>
                      )}
                      <p className="mt-1.5 font-mono text-[0.6875rem] text-ink-muted">
                        {item.paymentMethod?.replaceAll("_", " ") ?? "-"} · {item.paymentProvider ?? "-"}
                      </p>
                    </td>

                    {/* Amount & Sandbox Controls */}
                    <td className="px-5 py-4 text-right">
                      <p className="font-mono text-sm font-black tabular-nums text-ink">
                        {formatCurrency(item.amountRupiah)}
                      </p>

                      {/* Sandbox Settlement Trigger */}
                      {item.paymentId && item.paymentStatus === "PENDING" && (
                        <DashboardForm
                          action={transitionPaymentAction}
                          className="mt-2"
                          submitLabel="⚡ Settle Sandbox"
                        >
                          <input type="hidden" name="paymentId" value={item.paymentId} />
                          <input type="hidden" name="command" value="SETTLE" />
                          <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                        </DashboardForm>
                      )}

                      {/* Sandbox Refund & Dispute Dropdown */}
                      {item.paymentId && item.paymentStatus === "SETTLED" && !item.disputeStatus && (
                        <details className="mt-2 text-left">
                          <summary className="cursor-pointer font-bold text-error text-[0.6875rem] hover:underline">
                            + Refund / Dispute
                          </summary>
                          <div className="mt-2 space-y-2 rounded-xl border border-border bg-surface p-3 shadow-xs">
                            <DashboardForm
                              action={transitionPaymentAction}
                              variant="destructive"
                              submitLabel="Refund Sandbox"
                            >
                              <input type="hidden" name="paymentId" value={item.paymentId} />
                              <input type="hidden" name="command" value="REFUND" />
                              <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                              <textarea
                                name="reason"
                                required
                                minLength={10}
                                placeholder="Alasan refund dana..."
                                className="min-h-16 w-full rounded-lg border border-border p-2 text-xs"
                              />
                            </DashboardForm>

                            <DashboardForm
                              action={transitionPaymentAction}
                              submitLabel="Buka Dispute"
                            >
                              <input type="hidden" name="paymentId" value={item.paymentId} />
                              <input type="hidden" name="command" value="OPEN_DISPUTE" />
                              <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                              <textarea
                                name="reason"
                                required
                                minLength={10}
                                placeholder="Alasan dispute..."
                                className="min-h-16 w-full rounded-lg border border-border p-2 text-xs"
                              />
                            </DashboardForm>
                          </div>
                        </details>
                      )}

                      {/* Sandbox Dispute Resolution */}
                      {item.paymentId &&
                        item.paymentStatus === "SETTLED" &&
                        item.disputeStatus === "OPEN" && (
                          <details className="mt-2 text-left">
                            <summary className="cursor-pointer font-bold text-ink text-[0.6875rem] hover:underline">
                              ⚖️ Resolusi Dispute
                            </summary>
                            <div className="mt-2 space-y-2 rounded-xl border border-border bg-surface p-3 shadow-xs">
                              <DashboardForm
                                action={transitionPaymentAction}
                                submitLabel="Menangkan Venue"
                              >
                                <input type="hidden" name="paymentId" value={item.paymentId} />
                                <input type="hidden" name="command" value="WIN_DISPUTE" />
                                <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                                <textarea
                                  name="reason"
                                  required
                                  minLength={10}
                                  placeholder="Catatan resolusi..."
                                  className="min-h-16 w-full rounded-lg border border-border p-2 text-xs"
                                />
                              </DashboardForm>

                              <DashboardForm
                                action={transitionPaymentAction}
                                variant="destructive"
                                submitLabel="Refund Pemain"
                              >
                                <input type="hidden" name="paymentId" value={item.paymentId} />
                                <input type="hidden" name="command" value="LOSE_DISPUTE" />
                                <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                                <textarea
                                  name="reason"
                                  required
                                  minLength={10}
                                  placeholder="Alasan refund..."
                                  className="min-h-16 w-full rounded-lg border border-border p-2 text-xs"
                                />
                              </DashboardForm>
                            </div>
                          </details>
                        )}

                      {item.disputeStatus && item.disputeStatus !== "OPEN" && (
                        <p className="mt-1.5 font-mono text-[0.6875rem] text-ink-muted">
                          Dispute: {item.disputeStatus}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Navigation */}
        <nav
          aria-label="Paginasi transaksi"
          className="flex items-center justify-between border-t border-border/80 p-4 sm:px-6 bg-surface"
        >
          {transactions.page > 1 ? (
            <Button asChild variant="secondary" size="sm" className="text-xs font-bold">
              <Link href={pageHref(activeParams, transactions.page - 1)}>
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span>Sebelumnya</span>
              </Link>
            </Button>
          ) : (
            <span />
          )}

          {transactions.page < transactions.pageCount ? (
            <Button asChild variant="secondary" size="sm" className="text-xs font-bold">
              <Link href={pageHref(activeParams, transactions.page + 1)}>
                <span>Berikutnya</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      </Panel>
    </main>
  )
}
