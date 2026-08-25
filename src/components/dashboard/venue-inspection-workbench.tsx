"use client"

import { useState } from "react"
import Image from "next/image"
import {
  CalendarClock,
  Check,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Eye,
  ImageIcon,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react"
import { DashboardForm } from "@/components/dashboard/dashboard-form"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { approveVenueAction, rejectVenueAction } from "@/lib/dashboard/admin-actions"
import type { AdminVenueReviewItem } from "@/lib/dashboard/admin-data"
import { cn } from "@/lib/utils"

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

const rejectionPresets = [
  "Foto lapangan buram atau belum memperlihatkan kondisi rumput & jaring secara jelas.",
  "Alamat venue tidak lengkap atau titik lokasi GPS tidak sesuai.",
  "Belum ada lapangan aktif yang didaftarkan di dalam venue ini.",
  "Nomor telepon kontak pengelola tidak dapat dihubungi saat diverifikasi.",
  "Jam operasional tidak valid atau bertabrakan dengan jadwal perawatan rutin.",
]

export function VenueInspectionWorkbench({
  pendingVenues,
}: {
  pendingVenues: AdminVenueReviewItem[]
}) {
  const [filterMode, setFilterMode] = useState<"all" | "ready" | "needs-action">("all")
  const [previewImages, setPreviewImages] = useState<{ title: string; urls: string[] } | null>(null)
  const [activePresetMap, setActivePresetMap] = useState<Record<string, string>>({})

  const filteredVenues = pendingVenues.filter((v) => {
    const isReady = v.activeCourtCount > 0 && v.imageCount > 0 && Boolean(v.phone)
    if (filterMode === "ready") return isReady
    if (filterMode === "needs-action") return !isReady
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filter Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface p-1 shadow-2xs">
          {[
            { id: "all", label: `Semua Antrean (${pendingVenues.length})` },
            {
              id: "ready",
              label: `Siap Disetujui (${
                pendingVenues.filter((v) => v.activeCourtCount > 0 && v.imageCount > 0 && Boolean(v.phone)).length
              })`,
            },
            {
              id: "needs-action",
              label: `Perlu Dilengkapi (${
                pendingVenues.filter((v) => !(v.activeCourtCount > 0 && v.imageCount > 0 && Boolean(v.phone))).length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id as typeof filterMode)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                filterMode === tab.id
                  ? "bg-ink text-white shadow-xs"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="font-mono text-xs font-semibold text-ink-muted">
          Menampilkan {filteredVenues.length} dari {pendingVenues.length} pengajuan
        </span>
      </div>

      {/* Empty State */}
      {filteredVenues.length === 0 ? (
        <EmptyState
          className="border-0 py-12"
          icon={<ShieldCheck className="size-8 text-brand" aria-hidden="true" />}
          title="Tidak Ada Antrean pada Kategori Ini"
          description="Semua pengajuan venue pada filter yang dipilih sudah diproses."
        />
      ) : (
        <div className="divide-y divide-border/80">
          {filteredVenues.map((venue, index) => {
            const hasCourts = venue.activeCourtCount > 0
            const hasImages = venue.imageCount > 0
            const hasPhone = Boolean(venue.phone)
            const isFullyReady = hasCourts && hasImages && hasPhone

            const cleanPhone = venue.phone?.replace(/[^0-9]/g, "") ?? ""
            const waUrl = cleanPhone
              ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
                  `Halo ${venue.ownerName}, kami dari Tim Kurasi PadelKu ingin mengonfirmasi pengajuan venue ${venue.name}...`,
                )}`
              : null

            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${venue.address}, ${venue.city}`,
            )}`

            return (
              <article
                key={venue.id}
                className="grid gap-6 py-6 xl:grid-cols-[minmax(0,1fr)_24rem] items-start"
              >
                {/* Left: Venue Specs & Details */}
                <div className="min-w-0 space-y-4">
                  {/* Metadata Header */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-xs font-bold text-white">
                      ANTREAN #{String(index + 1).padStart(2, "0")}
                    </span>
                    <StatusBadge status="PENDING" />
                    <time className="font-mono text-xs text-ink-muted" dateTime={venue.submittedAt}>
                      Diajukan: {dateFormatter.format(new Date(venue.submittedAt))}
                    </time>
                  </div>

                  {/* Title & Owner Info */}
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
                      {venue.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <span className="flex items-center gap-1 font-semibold text-ink">
                        <User className="size-3.5 text-brand" />
                        {venue.ownerName}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{venue.ownerEmail}</span>
                    </div>
                  </div>

                  {/* Details Card */}
                  <dl className="grid gap-3 rounded-2xl border border-border/80 bg-surface-muted/50 p-4 sm:grid-cols-3 text-xs">
                    <div>
                      <dt className="flex items-center gap-1.5 font-bold text-ink-muted">
                        <MapPin className="size-3.5 text-brand" />
                        <span>Lokasi Venue</span>
                      </dt>
                      <dd className="mt-1 font-medium text-ink leading-relaxed">
                        {venue.address}, {venue.city}, {venue.province}
                      </dd>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[0.6875rem] font-bold text-brand hover:underline"
                      >
                        <span>Cek Google Maps</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>

                    <div>
                      <dt className="flex items-center gap-1.5 font-bold text-ink-muted">
                        <CalendarClock className="size-3.5 text-brand" />
                        <span>Jam Operasional</span>
                      </dt>
                      <dd className="mt-1 font-mono font-semibold text-ink">
                        {venue.openingTime} – {venue.closingTime} WIB
                      </dd>
                      <span className="mt-1 block text-[0.6875rem] text-ink-muted">
                        Buka setiap hari
                      </span>
                    </div>

                    <div>
                      <dt className="flex items-center gap-1.5 font-bold text-ink-muted">
                        <Phone className="size-3.5 text-brand" />
                        <span>Kontak WhatsApp</span>
                      </dt>
                      <dd className="mt-1 font-mono font-semibold text-ink">
                        {venue.phone ?? "Belum diisi"}
                      </dd>
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-[0.6875rem] font-bold text-success hover:underline"
                        >
                          <MessageSquare className="size-3" />
                          <span>Hubungi via WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </dl>

                  {/* Readiness Checklist Badges & Photo Preview Trigger */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                        hasCourts
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-error/30 bg-error/10 text-error"
                      }`}
                    >
                      {hasCourts ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                      {venue.activeCourtCount} Lapangan Aktif
                    </span>

                    {/* Photo Gallery Viewer Trigger */}
                    {venue.imageUrls && venue.imageUrls.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImages({ title: venue.name, urls: venue.imageUrls })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand hover:bg-brand/20 transition-colors"
                      >
                        <ImageIcon className="size-3.5" />
                        <span>{venue.imageCount} Foto Diunggah (Pratinjau)</span>
                        <Eye className="size-3" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-error/30 bg-error/10 px-2.5 py-1 text-xs font-semibold text-error">
                        <XCircle className="size-3.5" />
                        0 Foto Diunggah
                      </span>
                    )}

                    {venue.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-ink-muted"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>

                  {!isFullyReady && (
                    <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-ink leading-relaxed">
                      <CircleAlert className="size-4 shrink-0 text-warning mt-0.5" />
                      <span>
                        Pengajuan ini belum memenuhi seluruh checklist kelayakan. Verifikasi tetap mewajibkan minimal 1 lapangan aktif di server sebelum disetujui.
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Decision Workbench Action Station */}
                <aside className="rounded-3xl border border-border/90 bg-surface p-5 shadow-card space-y-4">
                  <div className="space-y-1">
                    <p className="font-display text-sm font-bold text-ink">Keputusan Kurator</p>
                    <p className="text-[0.6875rem] text-ink-muted">
                      Aksi akan langsung mengubah status venue di marketplace dan mengirim notifikasi email/WA ke pemilik.
                    </p>
                  </div>

                  {/* Approve Form */}
                  <DashboardForm
                    action={approveVenueAction.bind(null, venue.id)}
                    disabled={venue.activeCourtCount === 0}
                    pendingLabel="Menyetujui & Menerbitkan..."
                    submitLabel="✓ Setujui & Publikasikan Venue"
                  >
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                      <Check className="size-3.5 stroke-[3]" />
                      <span>Tayangkan ke pencarian publik</span>
                    </p>
                  </DashboardForm>

                  {/* Reject Form with Quick Preset Chips */}
                  <details className="group border-t border-border/80 pt-4">
                    <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-bold text-error marker:content-none hover:underline">
                      <span className="flex items-center gap-1.5">
                        <X className="size-3.5" />
                        <span>Tolak / Minta Revisi Pengajuan</span>
                      </span>
                      <span className="text-[0.625rem] font-normal text-ink-muted">Buka formulir</span>
                    </summary>

                    <div className="mt-3 space-y-3">
                      {/* Preset Chips */}
                      <div>
                        <span className="text-[0.625rem] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                          Template Alasan Cepat:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {rejectionPresets.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() =>
                                setActivePresetMap({
                                  ...activePresetMap,
                                  [venue.id]: preset,
                                })
                              }
                              className="rounded-md border border-border bg-surface-muted/80 px-2 py-1 text-[0.6875rem] text-ink-muted hover:border-error/40 hover:bg-error/5 hover:text-error transition-all text-left"
                            >
                              + {preset.slice(0, 32)}...
                            </button>
                          ))}
                        </div>
                      </div>

                      <DashboardForm
                        action={rejectVenueAction.bind(null, venue.id)}
                        className="space-y-3"
                        pendingLabel="Mengirim Penolakan..."
                        submitLabel="Kirim Penolakan ke Pemilik"
                        variant="destructive"
                      >
                        <div>
                          <label
                            className="block text-xs font-bold text-ink mb-1"
                            htmlFor={`reason-${venue.id}`}
                          >
                            Catatan Resmi Penolakan
                          </label>
                          <textarea
                            id={`reason-${venue.id}`}
                            name="reason"
                            required
                            minLength={10}
                            maxLength={500}
                            value={activePresetMap[venue.id]}
                            onChange={(e) =>
                              setActivePresetMap({
                                ...activePresetMap,
                                [venue.id]: e.target.value,
                              })
                            }
                            placeholder="Tuliskan catatan detail yang harus diperbaiki oleh pemilik venue..."
                            className="min-h-24 w-full resize-y rounded-xl border border-border-strong bg-surface p-3 text-xs text-ink placeholder:text-ink-muted focus:border-error focus:outline-none focus:ring-2 focus:ring-error/20"
                          />
                        </div>
                      </DashboardForm>
                    </div>
                  </details>
                </aside>
              </article>
            )
          })}
        </div>
      )}

      {/* Photo Gallery Viewer Modal */}
      {previewImages && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setPreviewImages(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-float space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="font-display text-lg font-bold text-ink">
                  Foto Arena: {previewImages.title}
                </h4>
                <p className="text-xs text-ink-muted">
                  {previewImages.urls.length} foto resolusi tinggi diunggah oleh pengelola venue
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImages(null)}
                className="grid size-9 place-items-center rounded-full border border-border hover:bg-surface-muted transition-colors"
                aria-label="Tutup pratinjau foto"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {previewImages.urls.map((url, i) => (
                <div key={i} className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-muted border border-border">
                  <Image
                    src={url}
                    alt={`Foto ${i + 1} di ${previewImages.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
