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
import { AdminTransactionsWorkbench } from "@/components/dashboard/admin-transactions-workbench"
import { Panel } from "@/components/dashboard/panel"
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

  // Calculate quick metrics from current page
  const totalAmount = transactions.items.reduce((acc, i) => acc + i.amountRupiah, 0)
  const settledCount = transactions.items.filter((i) => i.paymentStatus === "SETTLED").length
  const pendingCount = transactions.items.filter((i) => i.paymentStatus === "PENDING").length
  const disputeCount = transactions.items.filter((i) => Boolean(i.disputeStatus)).length

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
              <span>Kembali ke Pusat Kendali</span>
            </Link>
          </Button>
        }
      />

      {/* Transaction Top Summary Metrics HUD */}
      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-ink-muted">Total Nilai Halaman Ini</span>
          <p className="font-mono text-xl sm:text-2xl font-black text-ink">
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-[0.6875rem] text-ink-muted">{transactions.items.length} transaksi di halaman ini</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-ink-muted">Transaksi Lunas</span>
          <p className="font-mono text-xl sm:text-2xl font-black text-success">
            {settledCount} Lunas
          </p>
          <p className="text-[0.6875rem] text-ink-muted">Pembayaran berhasil terverifikasi</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-ink-muted">Menunggu Bayar</span>
          <p className="font-mono text-xl sm:text-2xl font-black text-warning">
            {pendingCount} Pending
          </p>
          <p className="text-[0.6875rem] text-ink-muted">Dalam masa batas waktu pembayaran</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-ink-muted">Dispute & Sengketa</span>
          <p className="font-mono text-xl sm:text-2xl font-black text-urgent">
            {disputeCount} Kasus
          </p>
          <p className="text-[0.6875rem] text-ink-muted">Sengketa yang memerlukan resolusi</p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <form
        action="/admin/transactions"
        method="get"
        className="rounded-3xl border border-border/90 bg-surface p-5 shadow-xs space-y-3"
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
      <Panel className="overflow-hidden p-0 sm:p-0 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-surface-muted/30 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
              Rekonsiliasi Transaksi Gateway
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {transactions.total} total data transaksi ditemukan di database
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
          <AdminTransactionsWorkbench
            items={transactions.items}
            total={transactions.total}
          />
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
