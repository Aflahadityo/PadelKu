"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Share2, Star, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast-provider"
import { cn } from "@/lib/utils"

interface BookingDetailActionsProps {
  bookingCode: string
  bookingId: string
  hasReview: boolean
  status: string
  venueName: string
}

interface ApiErrorBody {
  error?: {
    message?: string
  }
}

async function request(url: string, body: object) {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  })
  const result = (await response.json().catch(() => ({}))) as ApiErrorBody
  if (!response.ok) throw new Error(result.error?.message ?? "Permintaan gagal diproses.")
}

async function copyLink(url: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = url
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand("copy")
  textarea.remove()
  if (!copied) throw new Error("Tautan tidak dapat disalin.")
}

export function BookingDetailActions({
  bookingCode,
  bookingId,
  hasReview,
  status,
  venueName,
}: BookingDetailActionsProps) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState<"cancel" | "review" | null>(null)
  const canCancel = status === "PENDING_PAYMENT" || status === "CONFIRMED"
  const canReview = status === "COMPLETED" && !hasReview

  async function shareBooking() {
    const url = window.location.href
    const data = {
      title: `Booking ${bookingCode}`,
      text: `Detail jadwal bermain di ${venueName} (${bookingCode}).`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(data)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }

    try {
      await copyLink(url)
      toast.success("Tautan booking disalin.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tautan tidak dapat dibagikan.")
    }
  }

  async function cancelBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting("cancel")
    try {
      const trimmedReason = reason.trim()
      await request(`/api/bookings/${bookingId}/cancel`, trimmedReason ? { reason: trimmedReason } : {})
      setCancelOpen(false)
      toast.success("Booking berhasil dibatalkan.")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking gagal dibatalkan.")
    } finally {
      setSubmitting(null)
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rating === 0) {
      toast.error("Pilih rating terlebih dahulu.")
      return
    }

    setSubmitting("review")
    try {
      const trimmedComment = comment.trim()
      await request(`/api/bookings/${bookingId}/review`, {
        comment: trimmedComment || null,
        rating,
      })
      setReviewOpen(false)
      toast.success("Ulasan berhasil dikirim.")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ulasan gagal dikirim.")
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" variant="secondary" className="w-full" onClick={shareBooking}>
        <Share2 />
        Bagikan Booking
      </Button>

      {canCancel && (
        <>
          <Button type="button" variant="destructive" className="w-full" onClick={() => setCancelOpen(true)}>
            <XCircle />
            Batalkan Booking
          </Button>
          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogContent>
              <form onSubmit={cancelBooking}>
                <DialogHeader>
                  <DialogTitle>Batalkan booking?</DialogTitle>
                  <DialogDescription>
                    Status dan kelayakan pembatalan akan diverifikasi kembali oleh sistem sebelum booking dibatalkan.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-5 space-y-2">
                  <label htmlFor="cancellation-reason" className="text-sm font-semibold text-ink">
                    Alasan pembatalan <span className="font-normal text-ink-muted">(opsional)</span>
                  </label>
                  <textarea
                    id="cancellation-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    minLength={3}
                    maxLength={500}
                    rows={4}
                    placeholder="Ceritakan alasan pembatalan"
                    className="w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={submitting === "cancel"}>
                      Kembali
                    </Button>
                  </DialogClose>
                  <Button type="submit" variant="destructive" disabled={submitting === "cancel"}>
                    {submitting === "cancel" ? "Memproses..." : "Ya, Batalkan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {canReview && (
        <>
          <Button type="button" className="w-full" onClick={() => setReviewOpen(true)}>
            <Star />
            Tulis Ulasan
          </Button>
          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogContent>
              <form onSubmit={submitReview}>
                <DialogHeader>
                  <DialogTitle>Bagaimana pengalaman bermain Anda?</DialogTitle>
                  <DialogDescription>
                    Berikan rating dan ulasan untuk membantu pemain lain mengenal {venueName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-5 space-y-5">
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold text-ink">Rating</legend>
                    <div className="flex gap-1" aria-label={`${rating || 0} dari 5 bintang`}>
                      {Array.from({ length: 5 }, (_, index) => {
                        const value = index + 1
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            aria-label={`${value} bintang`}
                            aria-pressed={rating === value}
                            className="grid size-11 place-items-center rounded-control transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand"
                          >
                            <Star
                              className={cn(
                                "size-6",
                                value <= rating ? "fill-amber-400 text-amber-400" : "text-border-strong",
                              )}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                  <div className="space-y-2">
                    <label htmlFor="review-comment" className="text-sm font-semibold text-ink">
                      Ulasan <span className="font-normal text-ink-muted">(opsional)</span>
                    </label>
                    <textarea
                      id="review-comment"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      minLength={3}
                      maxLength={2000}
                      rows={5}
                      placeholder="Ceritakan pengalaman Anda"
                      className="w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={submitting === "review"}>
                      Nanti
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={submitting === "review"}>
                    {submitting === "review" ? "Mengirim..." : "Kirim Ulasan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
