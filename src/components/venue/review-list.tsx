import { Star, UserRound } from "lucide-react"
import type { VenueReview } from "@/lib/data/marketplace"

export function ReviewList({ reviews }: { reviews: VenueReview[] }) {
  if (reviews.length === 0) {
    return <p className="border-y border-border py-10 text-sm text-ink-muted">Belum ada ulasan untuk venue ini.</p>
  }
  return (
    <div className="divide-y divide-border border-y border-border">
      {reviews.map((review) => (
        <article key={review.id} className="grid gap-3 py-5 sm:grid-cols-[12rem_1fr] sm:py-7">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="grid size-8 place-items-center rounded-control bg-surface-muted"><UserRound className="size-4" aria-hidden="true" /></span>
              {review.reviewerName ?? "Pemain terverifikasi"}
            </p>
            <time dateTime={review.createdAt} className="mt-2 block font-mono text-[0.7rem] text-ink-muted">
              {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(review.createdAt))}
            </time>
          </div>
          <div>
            <p className="flex gap-0.5" aria-label={`${review.rating} dari 5 bintang`}>
              {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < review.rating ? "fill-warning text-warning" : "text-border-strong"}`} aria-hidden="true" />)}
            </p>
            {review.comment ? <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">{review.comment}</p> : null}
          </div>
        </article>
      ))}
    </div>
  )
}
