"use client"

import { useState } from "react"
import {
  Check,
  Package,
  ShoppingBag,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface EquipmentItem {
  id: string
  name: string
  brand: string
  category: "racket" | "balls" | "accessories" | "machine"
  type: "Sewa (Rental)" | "Beli Baru"
  price: number
  description: string
  specs: string[]
  inStock: boolean
}

const equipmentData: EquipmentItem[] = [
  {
    id: "eq-1",
    name: "Bullpadel Hack 03 (Paquito Navarro Edition)",
    brand: "Bullpadel",
    category: "racket",
    type: "Sewa (Rental)",
    price: 50000,
    description: "Raket tipe diamond berdaya hancur tinggi untuk pemain agresif dan smasher.",
    specs: ["Bentuk: Diamond", "Balance: High", "Carbon 12K & MultiEVA Core"],
    inStock: true,
  },
  {
    id: "eq-2",
    name: "Babolat Technical Viper 2026",
    brand: "Babolat",
    category: "racket",
    type: "Sewa (Rental)",
    price: 50000,
    description: "Explosive power dengan permukaan bertekstur 3D Spin+ untuk efek putaran maksimal.",
    specs: ["Bentuk: Diamond", "Weight: 365g", "Full Carbon Surface"],
    inStock: true,
  },
  {
    id: "eq-3",
    name: "Head Speed Pro X",
    brand: "Head",
    category: "racket",
    type: "Sewa (Rental)",
    price: 45000,
    description: "Kombinasi kontrol dan kecepatan manuver terbaik untuk pemain serba bisa.",
    specs: ["Bentuk: Teardrop", "Auxetic Tech", "Power Foam"],
    inStock: true,
  },
  {
    id: "eq-4",
    name: "Nox AT10 Genius 18K (Agustin Tapia)",
    brand: "Nox",
    category: "racket",
    type: "Sewa (Rental)",
    price: 50000,
    description: "Sensasi sentuhan lembut dan akurasi kelas dunia dari sang raja padel dunia.",
    specs: ["Bentuk: Teardrop", "Carbon 18K", "SmartStrap System"],
    inStock: true,
  },
  {
    id: "eq-5",
    name: "Bola Padel Head Pro (Can of 3 Balls)",
    brand: "Head",
    category: "balls",
    type: "Beli Baru",
    price: 95000,
    description: "Bola resmi turnamen World Padel Tour dengan tekanan presisi dan ketahanan tinggi.",
    specs: ["Isi: 3 Bola Segel", "Standar FIP", "Felt Wol Premium"],
    inStock: true,
  },
  {
    id: "eq-6",
    name: "Sewa Mesin Pelontar Bola (Ball Machine 1 Jam)",
    brand: "Spinfire Pro Padel",
    category: "machine",
    type: "Sewa (Rental)",
    price: 120000,
    description: "Latihan intensif solo drill untuk mengasah konsistensi pukulan Bandeja dan Volley.",
    specs: ["Kapasitas: 150 Bola", "Remote Control", "Topspin & Backspin Setting"],
    inStock: true,
  },
]

export function EquipmentHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [cartSuccess, setCartSuccess] = useState<string | null>(null)

  const filteredItems = equipmentData.filter((item) => {
    if (selectedCategory === "all") return true
    return item.category === selectedCategory
  })

  const handleRent = (item: EquipmentItem) => {
    setCartSuccess(`✓ "${item.name}" berhasil ditambahkan ke reservasi Anda! Silakan ambil langsung di meja resepsionis venue saat check-in.`)
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-border/90 bg-gradient-to-br from-[#121F17] via-[#16291E] to-[#101D15] p-6 sm:p-10 text-white shadow-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 -bottom-16 size-56 rounded-full bg-booking/10 blur-3xl" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/20 border border-brand/30 px-3 py-1 text-xs font-extrabold text-brand">
            <Package className="size-3.5" />
            <span>Rental & Pro Shop Lapangan</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Sewa Raket Premium & Perlengkapan Padel
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Belum punya raket sendiri? Sewa raket pro tour (Bullpadel, Babolat, Head, Nox) atau beli bola baru langsung siap diambil di resepsionis venue saat Anda bermain.
          </p>
        </div>
      </div>

      {cartSuccess && (
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-xs font-bold text-success flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <Check className="size-4 shrink-0 stroke-[3]" />
            <span>{cartSuccess}</span>
          </div>
          <button type="button" onClick={() => setCartSuccess(null)} className="text-ink-muted hover:text-ink">
            ✕
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-surface p-4 rounded-2xl border border-border shadow-2xs">
        <span className="text-xs font-bold text-ink-muted mr-1">Kategori Alat:</span>
        {[
          { id: "all", label: "Semua Perlengkapan" },
          { id: "racket", label: "Sewa Raket Pro" },
          { id: "balls", label: "Bola Padel Baru" },
          { id: "machine", label: "Mesin Pelontar Bola" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? "bg-brand text-white shadow-xs"
                : "bg-surface-muted/60 text-ink-muted hover:text-ink"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-xs hover:border-brand/40 hover:shadow-card transition-all duration-200"
          >
            <div className="space-y-3">
              {/* Tag & Brand */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-brand uppercase tracking-wider">
                  {item.brand}
                </span>
                <span className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-[0.6875rem] font-bold text-ink-muted border border-border">
                  {item.type}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand transition-colors">
                  {item.name}
                </h3>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Specs Chips */}
              <div className="space-y-1 pt-1">
                <span className="text-[0.6875rem] font-bold text-ink-muted">Spesifikasi:</span>
                <div className="flex flex-wrap gap-1">
                  {item.specs.map((spec) => (
                    <span
                      key={spec}
                      className="rounded-md bg-surface-muted/80 px-2 py-0.5 text-[0.6875rem] font-medium text-ink"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Action Button */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
              <div>
                <span className="text-[0.6875rem] text-ink-muted block">Tarif:</span>
                <span className="font-mono text-base font-black text-ink">
                  {formatCurrency(item.price)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRent(item)}
                className="btn-cta inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-ink rounded-xl shadow-xs hover:scale-105 transition-all"
              >
                <ShoppingBag className="size-3.5" />
                <span>Pesan Sewa</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
