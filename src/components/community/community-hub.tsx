"use client"

import { useState } from "react"
import {
  Calendar,
  Medal,
  Trophy,
} from "lucide-react"

interface LeaderboardPlayer {
  rank: number
  name: string
  city: string
  ntrp: string
  matchesPlayed: number
  winRate: number
  points: number
}

interface TournamentItem {
  id: string
  name: string
  venueName: string
  city: string
  date: string
  category: string
  prizePool: string
  status: "Pendaftaran Dibuka" | "Slot Terbatas" | "Segera Hadir"
  registeredTeams: number
  maxTeams: number
}

const leaderboardData: LeaderboardPlayer[] = [
  { rank: 1, name: "Adrian Tandiono", city: "Jakarta", ntrp: "5.0", matchesPlayed: 64, winRate: 88, points: 2840 },
  { rank: 2, name: "Kevin Sanjaya", city: "Jakarta", ntrp: "4.5+", matchesPlayed: 52, winRate: 85, points: 2610 },
  { rank: 3, name: "Lucas Van Houten", city: "Bali", ntrp: "4.5", matchesPlayed: 48, winRate: 81, points: 2420 },
  { rank: 4, name: "Sarah Wijaya", city: "Tangerang", ntrp: "4.0", matchesPlayed: 58, winRate: 78, points: 2190 },
  { rank: 5, name: "Dennis Leonardo", city: "Jakarta", ntrp: "4.0", matchesPlayed: 41, winRate: 75, points: 1980 },
  { rank: 6, name: "Gita Maharani", city: "Bandung", ntrp: "3.5", matchesPlayed: 37, winRate: 72, points: 1750 },
  { rank: 7, name: "Dimas Pratama", city: "Jakarta", ntrp: "3.5", matchesPlayed: 33, winRate: 70, points: 1620 },
  { rank: 8, name: "Reza Kurniawan", city: "Surabaya", ntrp: "3.0", matchesPlayed: 29, winRate: 68, points: 1480 },
]

const tournamentsData: TournamentItem[] = [
  {
    id: "tour-1",
    name: "Jakarta Padel Masters 2026 (Open Series)",
    venueName: "Senayan Central Padel",
    city: "Jakarta Pusat",
    date: "12 – 14 September 2026",
    category: "Men's & Women's Doubles",
    prizePool: "Rp 50.000.000",
    status: "Pendaftaran Dibuka",
    registeredTeams: 24,
    maxTeams: 32,
  },
  {
    id: "tour-2",
    name: "Bali Sunset Padel Invitational",
    venueName: "Canggu Padel Club",
    city: "Bali",
    date: "26 – 28 September 2026",
    category: "Mixed Doubles & Pro-Am",
    prizePool: "Rp 75.000.000",
    status: "Slot Terbatas",
    registeredTeams: 28,
    maxTeams: 32,
  },
  {
    id: "tour-3",
    name: "Bandung Amateur Cup (NTRP 2.5 – 3.5)",
    venueName: "Padel Studio Bandung",
    city: "Bandung",
    date: "10 – 11 Oktober 2026",
    category: "Intermediate Bracket",
    prizePool: "Rp 25.000.000",
    status: "Segera Hadir",
    registeredTeams: 12,
    maxTeams: 24,
  },
]

export function CommunityHub() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "tournaments">("leaderboard")

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-border/90 bg-gradient-to-br from-[#121F17] via-[#16291E] to-[#101D15] p-6 sm:p-10 text-white shadow-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 -bottom-16 size-56 rounded-full bg-booking/10 blur-3xl" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/20 border border-brand/30 px-3 py-1 text-xs font-extrabold text-brand">
            <Trophy className="size-3.5" />
            <span>PadelKu National Community</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Peringkat Pemain & Turnamen Padel Indonesia
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Ikuti pertandingan sparring, kumpulkan poin NTRP, dan ikuti turnamen resmi padel di berbagai kota untuk meraih gelar King & Queen of the Court.
          </p>
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("leaderboard")}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeTab === "leaderboard"
              ? "bg-ink text-white shadow-sm"
              : "bg-surface text-ink-muted border border-border hover:text-ink"
          }`}
        >
          <Medal className="size-3.5" />
          <span>Leaderboard Peringkat Nasional</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tournaments")}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeTab === "tournaments"
              ? "bg-ink text-white shadow-sm"
              : "bg-surface text-ink-muted border border-border hover:text-ink"
          }`}
        >
          <Trophy className="size-3.5" />
          <span>Kalender Turnamen ({tournamentsData.length})</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="rounded-3xl border border-border/90 bg-surface shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/80 bg-surface-muted/30 p-5 sm:p-6">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Top Players of the Season
              </h2>
              <p className="text-xs text-ink-muted">Poin dihitung berdasarkan winrate match dan rating NTRP</p>
            </div>
            <span className="badge-optic text-xs font-bold">MUSIM 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[45rem] text-left text-xs">
              <thead className="bg-surface-muted text-[0.6875rem] font-bold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-5 py-3.5">Peringkat</th>
                  <th className="px-5 py-3.5">Nama Pemain</th>
                  <th className="px-5 py-3.5">Kota</th>
                  <th className="px-5 py-3.5">Skill Level</th>
                  <th className="px-5 py-3.5">Matches</th>
                  <th className="px-5 py-3.5">Win Rate</th>
                  <th className="px-5 py-3.5 text-right">Poin NTRP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {leaderboardData.map((player) => {
                  const isTop3 = player.rank <= 3

                  return (
                    <tr key={player.rank} className="hover:bg-surface-muted/20 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-sm">
                        {player.rank === 1 && "🥇 #1"}
                        {player.rank === 2 && "🥈 #2"}
                        {player.rank === 3 && "🥉 #3"}
                        {player.rank > 3 && `#${player.rank}`}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`font-display text-sm font-bold ${isTop3 ? "text-brand" : "text-ink"}`}>
                          {player.name}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-ink-muted">{player.city}</td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-brand/10 px-2 py-0.5 font-mono text-xs font-bold text-brand border border-brand/20">
                          NTRP {player.ntrp}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-ink">{player.matchesPlayed} Matches</td>

                      <td className="px-5 py-4 font-mono font-bold text-success">
                        {player.winRate}%
                      </td>

                      <td className="px-5 py-4 text-right font-mono font-black text-sm text-ink">
                        {player.points.toLocaleString()} PTS
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TOURNAMENTS */}
      {activeTab === "tournaments" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournamentsData.map((tour) => (
            <article
              key={tour.id}
              className="group flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-xs hover:border-brand/40 hover:shadow-card transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-bold text-brand">
                    {tour.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-ink">
                    {tour.registeredTeams}/{tour.maxTeams} Tim
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand transition-colors">
                  {tour.name}
                </h3>

                <div className="rounded-2xl border border-border bg-surface-muted/50 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-ink">
                    <Calendar className="size-3.5 text-brand" />
                    <span>{tour.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-muted">
                    <Trophy className="size-3.5 text-amber-500" />
                    <span className="font-mono font-bold text-ink">Prize Pool: {tour.prizePool}</span>
                  </div>
                  <p className="text-ink-muted">{tour.venueName} · {tour.city}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-brand">{tour.status}</span>
                <button
                  type="button"
                  onClick={() => alert(`Pendaftaran untuk ${tour.name} segera diverifikasi oleh komite turnamen.`)}
                  className="btn-cta text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:scale-105 transition-all"
                >
                  Daftar Turnamen
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
