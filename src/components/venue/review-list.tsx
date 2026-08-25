import { ShieldCheck, Star, UserRound } from "lucide-react"
import type { VenueReview } from "@/lib/data/marketplace"

export function ReviewList({ reviews }: { reviews: VenueReview[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted/30 p-8 text-center">
        <p className="text-sm font-semibold text-ink">Belum Ada Ulasan</p>
        <p className="mt-1 text-xs text-ink-muted">
          Jadilah pemain pertama yang memberikan ulasan setelah selesai bermain di venue ini.
        </p>
      </div>
    )
  }

  const averageRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

  return (
    <div className="space-y-6">
      {/* Rating Overview Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="font-mono text-4xl font-black text-ink">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3.5 ${
                    i < Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-border-strong"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="border-l border-border pl-4">
            <p className="font-display text-sm font-bold text-ink">Kepuasan Pemain</p>
            <p className="text-xs text-ink-muted">Berdasarkan {reviews.length} ulasan pemain terverifikasi</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-brand">
          <ShieldCheck className="size-4" />
          <span>100% Ulasan dari Reservasi Asli</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-border/80 border-y border-border/80">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="grid gap-3 py-5 sm:grid-cols-[14rem_1fr] sm:py-6"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand font-bold text-xs">
                  {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : <UserRound className="size-4" />}
                </span>
                <div>
                  <p className="text-xs font-bold text-ink">
                    {review.reviewerName ?? "Pemain Terverifikasi"}
                  </p>
                  <time
                    dateTime={review.createdAt}
                    className="font-mono text-[0.6875rem] text-ink-muted"
                  >
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(review.createdAt))}
                  </time>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1" aria-label={`${review.rating} dari 5 bintang`}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={`size-3.5 ${
                      index < review.rating ? "fill-amber-400 text-amber-400" : "text-border-strong"
                    }`}
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-1.5 font-mono text-xs font-bold text-ink">
                  {review.rating}.0
                </span>
              </div>
              {review.comment && (
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
