"use client"

import { useState } from "react"
import {
  Check,
  Copy,
  Download,
  Eye,
  Info,
  Wallet,
  X,
  Zap,
} from "lucide-react"
import { DashboardForm } from "@/components/dashboard/dashboard-form"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { transitionPaymentAction } from "@/lib/dashboard/payment-actions"
import type { AdminTransactionItem } from "@/lib/dashboard/admin-data"
import { formatCurrency } from "@/lib/utils"

interface AdminTransactionsWorkbenchProps {
  items: AdminTransactionItem[]
  total: number
}

export function AdminTransactionsWorkbench({
  items,
  total,
}: AdminTransactionsWorkbenchProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [inspectItem, setInspectItem] = useState<AdminTransactionItem | null>(null)
  const [actionItem, setActionItem] = useState<{
    item: AdminTransactionItem
    type: "SETTLE" | "REFUND" | "DISPUTE" | "RESOLVE"
  } | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const exportCSV = () => {
    const headers = [
      "Kode Booking",
      "Tanggal",
      "Nama Pemain",
      "Email Pemain",
      "Venue",
      "Status Booking",
      "Status Bayar",
      "Metode",
      "Provider",
      "Nominal (IDR)",
    ]
    const rows = items.map((i) => [
      i.bookingCode,
      i.createdAt,
      `"${i.playerName}"`,
      i.playerEmail,
      `"${i.venueName}"`,
      i.bookingStatus,
      i.paymentStatus ?? "BELUM_DIBUAT",
      i.paymentMethod ?? "-",
      i.paymentProvider ?? "-",
      i.amountRupiah,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `transaksi_padelku_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Quick Action Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-muted/40 p-4 rounded-2xl border border-border/80 text-xs">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <Wallet className="size-4 text-brand" />
          <span>{total} Transaksi Tercatat</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold shadow-2xs hover:border-brand/40"
          >
            <Download className="size-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[65rem] text-left text-xs">
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
            {items.map((item) => {
              const isCopied = copiedId === item.bookingId

              return (
                <tr
                  key={item.bookingId}
                  className="align-top hover:bg-surface-muted/30 transition-colors"
                >
                  {/* Booking Code & Timestamp */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-ink text-sm">
                        {item.bookingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.bookingCode, item.bookingId)}
                        className="rounded p-1 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
                        title="Salin kode booking"
                      >
                        {isCopied ? (
                          <Check className="size-3.5 text-success stroke-[3]" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
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

                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      {/* Inspect button */}
                      <button
                        type="button"
                        onClick={() => setInspectItem(item)}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-[0.6875rem] font-bold text-ink hover:border-brand/40 hover:bg-surface-muted transition-all"
                      >
                        <Eye className="size-3 inline mr-1" />
                        Audit
                      </button>

                      {/* Sandbox Settle Button */}
                      {item.paymentId && item.paymentStatus === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => setActionItem({ item, type: "SETTLE" })}
                          className="rounded-lg bg-booking text-ink px-2.5 py-1 text-[0.6875rem] font-extrabold shadow-2xs hover:bg-booking-hover transition-colors"
                        >
                          ⚡ Settle
                        </button>
                      )}

                      {/* Sandbox Refund / Dispute Trigger */}
                      {item.paymentId && item.paymentStatus === "SETTLED" && !item.disputeStatus && (
                        <button
                          type="button"
                          onClick={() => setActionItem({ item, type: "REFUND" })}
                          className="rounded-lg border border-error/30 text-error px-2 py-1 text-[0.6875rem] font-bold hover:bg-error/10 transition-colors"
                        >
                          Refund/Dispute
                        </button>
                      )}

                      {/* Sandbox Dispute Resolver */}
                      {item.paymentId && item.paymentStatus === "SETTLED" && item.disputeStatus === "OPEN" && (
                        <button
                          type="button"
                          onClick={() => setActionItem({ item, type: "RESOLVE" })}
                          className="rounded-lg bg-urgent text-white px-2 py-1 text-[0.6875rem] font-bold hover:bg-urgent/90 transition-colors"
                        >
                          ⚖️ Resolusi
                        </button>
                      )}
                    </div>

                    {item.disputeStatus && item.disputeStatus !== "OPEN" && (
                      <p className="mt-1 font-mono text-[0.625rem] text-ink-muted">
                        Dispute: {item.disputeStatus}
                      </p>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Audit Modal */}
      {inspectItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setInspectItem(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-float space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-brand" />
                <h4 className="font-display text-base font-bold text-ink">
                  Audit Jejak Transaksi
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="grid size-8 place-items-center rounded-full border border-border hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Kode Booking</span>
                <span className="font-mono font-bold text-ink">{inspectItem.bookingCode}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Venue</span>
                <span className="font-semibold text-ink">{inspectItem.venueName}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Pemain</span>
                <span className="font-semibold text-ink">{inspectItem.playerName} ({inspectItem.playerEmail})</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Status Booking</span>
                <StatusBadge status={inspectItem.bookingStatus} />
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Status Pembayaran</span>
                {inspectItem.paymentStatus ? <StatusBadge status={inspectItem.paymentStatus} /> : <span>-</span>}
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Metode & Provider</span>
                <span className="font-mono text-ink">{inspectItem.paymentMethod ?? "-"} / {inspectItem.paymentProvider ?? "-"}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-ink-muted">Payment ID Server</span>
                <span className="font-mono text-ink truncate max-w-[200px]">{inspectItem.paymentId ?? "-"}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-ink">Total Nominal Lunas</span>
                <span className="font-mono font-black text-sm text-brand">{formatCurrency(inspectItem.amountRupiah)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInspectItem(null)}
              className="btn-secondary w-full text-xs font-bold py-2.5 rounded-xl"
            >
              Tutup Audit
            </button>
          </div>
        </div>
      )}

      {/* Sandbox Action Dialog / Drawer Modal */}
      {actionItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setActionItem(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-float space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-booking" />
                <h4 className="font-display text-base font-bold text-ink">
                  Aksi Sandbox Payment Gateway
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActionItem(null)}
                className="grid size-8 place-items-center rounded-full border border-border hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted/50 p-3 text-xs space-y-1">
              <p className="font-semibold text-ink">Kode: {actionItem.item.bookingCode}</p>
              <p className="font-mono font-bold text-brand">{formatCurrency(actionItem.item.amountRupiah)}</p>
            </div>

            {/* Settle Action */}
            {actionItem.type === "SETTLE" && (
              <div className="space-y-4">
                <p className="text-xs text-ink-muted">
                  Simulasikan notifikasi webhook callback lunas (settlement) dari payment gateway sandbox.
                </p>
                <DashboardForm
                  action={transitionPaymentAction}
                  submitLabel="⚡ Eksekusi Settle Sandbox"
                >
                  <input type="hidden" name="paymentId" value={actionItem.item.paymentId!} />
                  <input type="hidden" name="command" value="SETTLE" />
                  <input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />
                </DashboardForm>
              </div>
            )}

            {/* Refund & Dispute Action */}
            {actionItem.type === "REFUND" && (
              <div className="space-y-4">
                <p className="text-xs text-ink-muted">
                  Pilih untuk mengembalikan dana pemain (*Refund*) atau membuka klaim sengketa (*Dispute*).
                </p>

                <div className="space-y-4">
                  <div className="rounded-xl border border-error/30 p-3 bg-error/5 space-y-2">
                    <p className="font-bold text-error text-xs">Pengembalian Dana (Refund)</p>
                    <DashboardForm
                      action={transitionPaymentAction}
                      variant="destructive"
                      submitLabel="Kirim Refund Sandbox"
                    >
                      <input type="hidden" name="paymentId" value={actionItem.item.paymentId!} />
                      <input type="hidden" name="command" value="REFUND" />
                      <input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />
                      <textarea
                        name="reason"
                        required
                        minLength={10}
                        placeholder="Alasan refund dana pemain..."
                        className="min-h-16 w-full rounded-lg border border-border p-2 text-xs"
                      />
                    </DashboardForm>
                  </div>

                  <div className="rounded-xl border border-urgent/30 p-3 bg-urgent/5 space-y-2">
                    <p className="font-bold text-urgent text-xs">Buka Sengketa (Dispute)</p>
                    <DashboardForm
                      action={transitionPaymentAction}
                      submitLabel="Buka Sengketa Sandbox"
                    >
                      <input type="hidden" name="paymentId" value={actionItem.item.paymentId!} />
                      <input type="hidden" name="command" value="OPEN_DISPUTE" />
                      <input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />
                      <textarea
                        name="reason"
                        required
                        minLength={10}
                        placeholder="Alasan pembukaan sengketa..."
                        className="min-h-16 w-full rounded-lg border border-border p-2 text-xs"
                      />
                    </DashboardForm>
                  </div>
                </div>
              </div>
            )}

            {/* Dispute Resolution Action */}
            {actionItem.type === "RESOLVE" && (
              <div className="space-y-4">
                <p className="text-xs text-ink-muted">
                  Selesaikan sengketa pembayaran yang sedang berlangsung.
                </p>

                <div className="space-y-3">
                  <DashboardForm
                    action={transitionPaymentAction}
                    submitLabel="Menangkan Venue"
                  >
                    <input type="hidden" name="paymentId" value={actionItem.item.paymentId!} />
                    <input type="hidden" name="command" value="WIN_DISPUTE" />
                    <input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />
                    <textarea
                      name="reason"
                      required
                      minLength={10}
                      placeholder="Catatan kemenangan venue..."
                      className="min-h-16 w-full rounded-lg border border-border p-2 text-xs"
                    />
                  </DashboardForm>

                  <DashboardForm
                    action={transitionPaymentAction}
                    variant="destructive"
                    submitLabel="Refund Pemain (Menangkan Pemain)"
                  >
                    <input type="hidden" name="paymentId" value={actionItem.item.paymentId!} />
                    <input type="hidden" name="command" value="LOSE_DISPUTE" />
                    <input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />
                    <textarea
                      name="reason"
                      required
                      minLength={10}
                      placeholder="Alasan refund sengketa..."
                      className="min-h-16 w-full rounded-lg border border-border p-2 text-xs"
                    />
                  </DashboardForm>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
