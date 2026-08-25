import Link from "next/link"
import { cn } from "@/lib/utils"

export interface BrandMarkProps {
  className?: string
  compact?: boolean
  href?: string | false
  inverse?: boolean
}

export function BrandMark({ className, compact = false, href = "/", inverse = false }: BrandMarkProps) {
  const content = (
    <>
      {/* Dynamic Emblem with Padel Racket & Optic Yellow Ball */}
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[0.85rem] border shadow-xs transition-transform duration-200 group-hover:scale-105",
          inverse
            ? "border-white/25 bg-gradient-to-br from-white/15 to-white/5 text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            : "border-brand/20 bg-gradient-to-br from-[#17221C] to-[#0A120E] text-white shadow-[0_4px_14px_rgba(20,30,24,0.18)]",
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 44 44" className="size-8" fill="none">
          <defs>
            <linearGradient id="brandTurfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#0E9E96" />
            </linearGradient>
            <linearGradient id="brandBallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EAFF70" />
              <stop offset="100%" stopColor="#D6FF3D" />
            </linearGradient>
          </defs>

          {/* Racket Monogram 'P' Outer Frame */}
          <path
            d="M10 9 C10 7.3 11.3 6 13 6 L23 6 C29.6 6 34.5 10.9 34.5 17.5 C34.5 24.1 29.6 29 23 29 L17 29 L17 37 C17 38.3 16 39.5 14.7 39.5 L12.3 39.5 C11 39.5 10 38.3 10 37 Z"
            fill="currentColor"
          />

          {/* Inner Sweetspot / Turf Core */}
          <path
            d="M17 12 L22.5 12 C25.8 12 28.5 14.5 28.5 17.5 C28.5 20.5 25.8 23 22.5 23 L17 23 Z"
            fill="url(#brandTurfGrad)"
          />

          {/* 3 Racket Perforations */}
          <circle cx="20.5" cy="17.5" r="1.6" fill="#141E18" />
          <circle cx="24.5" cy="15.5" r="1.3" fill="#141E18" />
          <circle cx="24.5" cy="19.5" r="1.3" fill="#141E18" />

          {/* Optic Yellow Padel Ball */}
          <circle cx="34" cy="33" r="5.5" fill="url(#brandBallGrad)" />
          <path
            d="M31.5 30.5 C33 32 33 34 31.5 35.5"
            stroke="#141E18"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />
          <path
            d="M36.5 30.5 C35 32 35 34 36.5 35.5"
            stroke="#141E18"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />
        </svg>
      </span>

      {!compact ? (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.035em]">
              PADEL<span className="text-brand">KU</span>
            </span>
            <span className="size-1.5 rounded-full bg-booking animate-pulse" />
          </div>
          <span className="text-[0.625rem] font-bold tracking-[0.14em] uppercase text-ink-muted">
            COURT ARENA
          </span>
        </div>
      ) : (
        <span className="sr-only">PadelKu</span>
      )}
    </>
  )

  const classes = cn(
    "group inline-flex min-h-11 w-fit items-center gap-3 rounded-control font-semibold transition-opacity hover:opacity-95",
    inverse ? "text-white" : "text-ink",
    className,
  )

  if (href === false) {
    return <div className={classes}>{content}</div>
  }

  return (
    <Link href={href} className={classes} aria-label={compact ? "PadelKu, beranda" : undefined}>
      {content}
    </Link>
  )
}
