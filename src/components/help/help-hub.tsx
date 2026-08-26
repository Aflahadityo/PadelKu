"use client"

import { useState } from "react"
import {
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Search,
} from "lucide-react"

interface FAQCategory {
  title: string
  items: { question: string; answer: string }[]
}

const faqData: FAQCategory[] = [
  {
    title: "Booking & Pembayaran",
    items: [
      {
        question: "Bagaimana cara booking lapangan padel di PadelKu?",
        answer: "Pilih venue favorit Anda di halaman pencarian, pilih tanggal dan jam slot yang tersedia di diagram lapangan (warna hijau/terang), lalu klik Amankan Slot dan selesaikan pembayaran via QRIS, Virtual Account BCA/Mandiri/BRI, atau Kartu Kredit.",
      },
      {
        question: "Apakah sistem menjamin tidak ada jadwal bentrok (double booking)?",
        answer: "Ya, PadelKu dilengkapi fitur Real-Time Court Lock selama 10 menit saat Anda checkout. Slot tersebut otomatis dikunci dari pengguna lain di database serverless kami.",
      },
      {
        question: "Apakah bisa bayar patungan (Split Bill) bersama teman?",
        answer: "Bisa! Saat bergabung ke Open Match atau membuat sparring, total sewa lapangan otomatis dibagi rata sesuai jumlah slot pemain dan masing-masing pemain membayar bagian mereka via QRIS.",
      },
    ],
  },
  {
    title: "Pembatalan, Reschedule & Refund",
    items: [
      {
        question: "Bagaimana kebijakan pembatalan jadwal bermain?",
        answer: "Pembatalan yang dilakukan minimal 24 jam sebelum jadwal main berhak mendapatkan pengembalian dana (refund) penuh 100% yang diproses otomatis ke rekening/e-wallet Anda dalam 1x24 jam kerja.",
      },
      {
        question: "Apakah bisa mengajukan pindah jadwal (reschedule)?",
        answer: "Reschedule dapat diajukan minimal 12 jam sebelum jadwal dengan menghubungi resepsionis venue langsung melalui kontak telepon/WhatsApp yang tertera pada e-tiket Anda.",
      },
    ],
  },
  {
    title: "Kemitraan Pemilik Venue (Venue Partner)",
    items: [
      {
        question: "Berapa biaya bergabung menjadi mitra venue PadelKu?",
        answer: "Pendaftaran venue 100% gratis tanpa biaya setup atau lisensi bulanan. PadelKu menerapkan skema bagi hasil transparan 95% net payout untuk venue dan 5% platform service fee dari setiap transaksi yang berhasil.",
      },
      {
        question: "Kapan dana payout hasil booking ditransfer ke pemilik venue?",
        answer: "Saldo payout dapat ditarik kapan saja melalui Dashboard Owner dan diproses otomatis setiap hari kerja pukul 16:00 WIB langsung ke rekening bank terdaftar Anda.",
      },
    ],
  },
  {
    title: "Panduan Rating Skill NTRP",
    items: [
      {
        question: "Apa itu rating skill NTRP di PadelKu?",
        answer: "NTRP (National Tennis & Padel Rating Program) adalah standar internasional untuk mengukur kemampuan pemain: NTRP 1.5 - 2.5 untuk Pemula, NTRP 3.0 - 3.5 untuk Intermediate yang menguasai pantulan dinding, dan NTRP 4.0+ untuk Kompetitif / Turnamen.",
      },
    ],
  },
]

export function HelpHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "0-0": true, // open first item by default
  })

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredCategories = faqData
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-border/90 bg-gradient-to-br from-[#121F17] via-[#16291E] to-[#101D15] p-6 sm:p-10 text-white shadow-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 -bottom-16 size-56 rounded-full bg-booking/10 blur-3xl" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/20 border border-brand/30 px-3 py-1 text-xs font-extrabold text-brand">
            <HelpCircle className="size-3.5" />
            <span>Pusat Bantuan & FAQ PadelKu</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ada yang Bisa Kami Bantu?
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Temukan jawaban lengkap seputar cara reservasi, kebijakan refund 24 jam, panduan split bill, dan kemitraan venue.
          </p>

          {/* Search Bar */}
          <div className="relative pt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik pertanyaan Anda (contoh: refund, split bill, ganti jam)..."
              className="h-12 w-full rounded-2xl border border-white/20 bg-surface pl-11 pr-4 text-xs sm:text-sm font-medium text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none shadow-md"
            />
          </div>
        </div>
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-8 max-w-3xl mx-auto">
        {filteredCategories.map((category, catIndex) => (
          <section key={category.title} className="space-y-3">
            <h2 className="font-display text-lg font-bold text-ink px-1">
              {category.title}
            </h2>

            <div className="divide-y divide-border/80 rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
              {category.items.map((item, itemIndex) => {
                const key = `${catIndex}-${itemIndex}`
                const isOpen = openItems[key]

                return (
                  <div key={item.question} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleItem(key)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left text-xs sm:text-sm font-bold text-ink hover:bg-surface-muted/30 transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-brand transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-ink-muted leading-relaxed animate-in fade-in-50">
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {!filteredCategories.length && (
          <div className="rounded-3xl border border-border bg-surface p-8 text-center text-xs text-ink-muted">
            Tidak ada jawaban yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;. Silakan hubungi tim bantuan langsung.
          </div>
        )}
      </div>

      {/* 24/7 CS Support Card */}
      <div className="rounded-3xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 via-surface to-brand/5 p-6 sm:p-8 max-w-3xl mx-auto shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display text-lg font-bold text-ink">Butuh Bantuan Mendesak?</h3>
          <p className="text-xs text-ink-muted">
            Tim Support PadelKu siap melayani konfirmasi reservasi dan kendala teknis 24/7.
          </p>
        </div>

        <a
          href="https://wa.me/6281234567890?text=Halo%20Admin%20PadelKu,%20saya%20membutuhkan%20bantuan%20terkait%20reservasi%20lapangan..."
          target="_blank"
          rel="noreferrer"
          className="btn-cta inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-ink rounded-xl shadow-xs shrink-0 hover:scale-105 transition-transform"
        >
          <MessageSquare className="size-4" />
          <span>WhatsApp CS 24/7</span>
        </a>
      </div>
    </div>
  )
}
