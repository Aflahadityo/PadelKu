"use client"

import { Star, User } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    name: string
    avatarUrl: string | null
  }
}

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-ink-muted">
        <p className="text-body">Belum ada review untuk venue ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-surface rounded-card p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
              {review.user.avatarUrl ? (
                <img src={review.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-brand" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-body font-medium text-ink">{review.user.name}</p>
              <p className="text-caption text-ink-muted">{formatDate(review.createdAt)}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 text-[#F4B740] fill-[#F4B740]" />
              <span className="text-body font-medium text-ink">{review.rating}</span>
            </div>
          </div>
          {review.comment && (
            <p className="text-body text-ink-muted leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
