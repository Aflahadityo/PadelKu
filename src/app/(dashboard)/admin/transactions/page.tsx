import { randomUUID } from "node:crypto"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, WalletCards } from "lucide-react"
import { Panel } from "@/components/dashboard/panel"
import { DashboardForm } from "@/components/dashboard/dashboard-form"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { adminBookingStatuses, adminPaymentStatuses, getAdminTransactions } from "@/lib/dashboard/admin-data"
import { formatCurrency } from "@/lib/utils"
import type { BookingStatus, PaymentStatus } from "@/types/database"
import { transitionPaymentAction } from "@/lib/dashboard/payment-actions"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const bookingLabels: Record<BookingStatus, string> = {
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
  CONFIRMED: "Terkonfirmasi",
  PENDING_PAYMENT: "Menunggu bayar",
}

const paymentLabels: Record<PaymentStatus, string> = {
  EXPIRED: "Kedaluwarsa",
  FAILED: "Gagal",
  PENDING: "Menunggu",
  REFUNDED: "Dikembalikan",
  SETTLED: "Lunas",
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function pageHref(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params)
  next.set("page", String(page))
  return `/admin/transactions?${next}`
}

export default async function AdminTransactionsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const query = single(raw.q)?.slice(0, 80) ?? ""
  const statusValue = single(raw.status)
  const paymentValue = single(raw.payment)
  const status = adminBookingStatuses.includes(statusValue as BookingStatus) ? statusValue as BookingStatus : undefined
  const paymentStatus = adminPaymentStatuses.includes(paymentValue as PaymentStatus) ? paymentValue as PaymentStatus : undefined
  const page = Math.max(1, Number.parseInt(single(raw.page) ?? "1", 10) || 1)
  const transactions = await getAdminTransactions({ page, paymentStatus, query, status })
  const activeParams = new URLSearchParams()
  if (query) activeParams.set("q", query)
  if (status) activeParams.set("status", status)
  if (paymentStatus) activeParams.set("payment", paymentStatus)

  return (
    <main className="space-y-8">
      <PageHeader
        eyebrow="Keuangan operasional"
        title="Monitor transaksi"
        description="Lacak status booking dan pembayaran. Data ini bersifat read-only; perubahan pembayaran harus datang dari alur provider yang tervalidasi."
        actions={<Button asChild variant="ghost"><Link href="/admin"><ChevronLeft aria-hidden="true" /> Kembali</Link></Button>}
      />

      <form action="/admin/transactions" method="get" className="grid gap-3 border-y border-border py-5 lg:grid-cols-[minmax(16rem,1fr)_13rem_13rem_auto]">
        <label className="relative block">
          <span className="sr-only">Cari kode booking</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input name="q" defaultValue={query} placeholder="Cari kode booking" className="h-11 w-full rounded-control border border-border-strong bg-surface pl-10 pr-3 text-sm text-ink" />
        </label>
        <label>
          <span className="sr-only">Status booking</span>
          <select name="status" defaultValue={status ?? ""} className="h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-ink">
            <option value="">Semua booking</option>
            {adminBookingStatuses.map((value) => <option key={value} value={value}>{bookingLabels[value]}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Status pembayaran</span>
          <select name="payment" defaultValue={paymentStatus ?? ""} className="h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-ink">
            <option value="">Semua pembayaran</option>
            {adminPaymentStatuses.map((value) => <option key={value} value={value}>{paymentLabels[value]}</option>)}
          </select>
        </label>
        <Button type="submit">Terapkan</Button>
      </form>

      <Panel className="overflow-hidden p-0 sm:p-0">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-5 sm:p-6">
          <div><h2 className="font-display text-xl font-bold text-ink">Aktivitas terbaru</h2><p className="mt-1 text-xs text-ink-muted">{transactions.total} booking ditemukan</p></div>
          <p className="font-mono text-xs text-ink-muted">Halaman {transactions.page} / {transactions.pageCount}</p>
        </div>
        {transactions.items.length === 0 ? (
          <EmptyState className="border-0" icon={<WalletCards aria-hidden="true" />} title="Transaksi tidak ditemukan" description="Ubah filter atau periksa kode booking yang dicari." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] text-left text-sm">
              <thead className="bg-surface-muted text-xs font-semibold text-ink-muted">
                <tr><th className="px-5 py-3">Booking</th><th className="px-5 py-3">Pemain</th><th className="px-5 py-3">Venue</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Pembayaran</th><th className="px-5 py-3 text-right">Nilai / aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.items.map((item) => (
                  <tr key={item.bookingId} className="align-top hover:bg-surface-muted/45">
                    <td className="px-5 py-4"><p className="font-mono font-semibold text-ink">{item.bookingCode}</p><time className="mt-1 block text-xs text-ink-muted" dateTime={item.createdAt}>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time></td>
                    <td className="px-5 py-4"><p className="font-semibold text-ink">{item.playerName}</p><p className="mt-1 text-xs text-ink-muted">{item.playerEmail}</p></td>
                    <td className="px-5 py-4 font-medium text-ink">{item.venueName}</td>
                    <td className="px-5 py-4"><StatusBadge status={item.bookingStatus} /></td>
                    <td className="px-5 py-4">{item.paymentStatus ? <StatusBadge status={item.paymentStatus} /> : <span className="text-xs text-ink-muted">Belum dibuat</span>}<p className="mt-2 text-xs text-ink-muted">{item.paymentMethod?.replaceAll("_", " ") ?? "-"} · {item.paymentProvider ?? "-"}</p></td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-mono font-semibold tabular-nums text-ink">{formatCurrency(item.amountRupiah)}</p>
                      {item.paymentId && item.paymentStatus === "PENDING" ? (
                        <DashboardForm action={transitionPaymentAction} className="mt-2 space-y-2" submitLabel="Settle sandbox">
                          <input type="hidden" name="paymentId" value={item.paymentId} />
                          <input type="hidden" name="command" value="SETTLE" />
                          <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                        </DashboardForm>
                      ) : null}
                      {item.paymentId && item.paymentStatus === "SETTLED" && !item.disputeStatus ? (
                        <details className="mt-2 text-left">
                          <summary className="cursor-pointer text-xs font-semibold text-error">Refund / dispute</summary>
                          <DashboardForm action={transitionPaymentAction} className="mt-2 space-y-2" variant="destructive" submitLabel="Refund sandbox">
                            <input type="hidden" name="paymentId" value={item.paymentId} />
                            <input type="hidden" name="command" value="REFUND" />
                            <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                            <textarea name="reason" required minLength={10} placeholder="Alasan refund" className="min-h-20 w-full rounded-control border border-border p-2 text-sm" />
                          </DashboardForm>
                          <DashboardForm action={transitionPaymentAction} className="mt-3 space-y-2" submitLabel="Buka dispute">
                            <input type="hidden" name="paymentId" value={item.paymentId} />
                            <input type="hidden" name="command" value="OPEN_DISPUTE" />
                            <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                            <textarea name="reason" required minLength={10} placeholder="Alasan dispute" className="min-h-20 w-full rounded-control border border-border p-2 text-sm" />
                          </DashboardForm>
                        </details>
                      ) : null}
                      {item.paymentId && item.paymentStatus === "SETTLED" && item.disputeStatus === "OPEN" ? (
                        <details className="mt-2 text-left">
                          <summary className="cursor-pointer text-xs font-semibold text-ink">Selesaikan dispute</summary>
                          <DashboardForm action={transitionPaymentAction} className="mt-2 space-y-2" submitLabel="Menangkan venue">
                            <input type="hidden" name="paymentId" value={item.paymentId} />
                            <input type="hidden" name="command" value="WIN_DISPUTE" />
                            <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                            <textarea name="reason" required minLength={10} placeholder="Resolusi dispute" className="min-h-20 w-full rounded-control border border-border p-2 text-sm" />
                          </DashboardForm>
                          <DashboardForm action={transitionPaymentAction} className="mt-3 space-y-2" variant="destructive" submitLabel="Refund pemain">
                            <input type="hidden" name="paymentId" value={item.paymentId} />
                            <input type="hidden" name="command" value="LOSE_DISPUTE" />
                            <input type="hidden" name="idempotencyKey" value={randomUUID()} />
                            <textarea name="reason" required minLength={10} placeholder="Resolusi dan alasan refund" className="min-h-20 w-full rounded-control border border-border p-2 text-sm" />
                          </DashboardForm>
                        </details>
                      ) : null}
                      {item.disputeStatus && item.disputeStatus !== "OPEN" ? <p className="mt-2 text-xs text-ink-muted">Dispute: {item.disputeStatus}</p> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <nav aria-label="Paginasi transaksi" className="flex items-center justify-between border-t border-border p-4 sm:px-6">
          {transactions.page > 1 ? <Button asChild variant="secondary" size="sm"><Link href={pageHref(activeParams, transactions.page - 1)}><ChevronLeft aria-hidden="true" /> Sebelumnya</Link></Button> : <span />}
          {transactions.page < transactions.pageCount ? <Button asChild variant="secondary" size="sm"><Link href={pageHref(activeParams, transactions.page + 1)}>Berikutnya <ChevronRight aria-hidden="true" /></Link></Button> : <span />}
        </nav>
      </Panel>
    </main>
  )
}
