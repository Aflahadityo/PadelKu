# Design System — PadelKu
### Arahan Visual untuk Marketplace Booking Padel Multi-Venue

| | |
|---|---|
| **Produk** | PadelKu |
| **Mode** | Light mode |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 3 Juli 2026 |

---

## 1. Filosofi Desain

PadelKu dipakai orang dalam kondisi terburu-buru — mau booking lapangan sebelum jam main, sering dari HP di bawah sinar matahari sore. Desainnya harus **cepat dibaca, energik, dan terasa seperti olahraga**, bukan seperti dashboard finansial.

Sumber inspirasi visual: **lapangan padel itu sendiri** — turf turquoise, garis-garis lapangan (service line, back line), dan bola optic yellow yang jadi ciri khas olahraga raket. Bukan generic "sports app" dengan gradient oranye-biru template.

Prinsip inti:
- **Cepat & jelas di bawah tekanan.** Slot kosong harus langsung kelihatan, CTA booking tidak boleh tersembunyi.
- **Energik tapi tidak berisik.** Warna terang dari dunia padel dipakai bertarget, bukan menutupi seluruh layar.
- **Mobile-first sungguhan.** Semua keputusan desain dites dulu di lebar layar HP, bukan desktop yang di-scale down.
- **Struktur meniru lapangan.** Grid jadwal booking terasa seperti diagram lapangan, bukan tabel spreadsheet biasa.

---

## 2. Palet Warna

Diambil langsung dari elemen fisik olahraga padel: turf turquoise sebagai warna brand utama, bola optic yellow sebagai aksen energi terbatas, dan coral hangat untuk urgensi (slot terbatas, promo).

| Token | Hex | Nama | Penggunaan |
|---|---|---|---|
| `--color-canvas` | `#FBFAF6` | Court Chalk | Background utama |
| `--color-surface` | `#FFFFFF` | Clean Surface | Card, panel, modal |
| `--color-ink` | `#1B241F` | Deep Court Ink | Teks utama, heading |
| `--color-ink-muted` | `#5E6B62` | Sideline Gray | Teks sekunder, caption |
| `--color-brand` | `#0E9E96` | Court Turquoise | Warna brand, navigasi aktif, ikon |
| `--color-cta` | `#D6FF3D` | Ball Optic | **Hanya** untuk tombol booking utama & highlight slot tersedia |
| `--color-urgent` | `#FF6B4A` | Match Coral | Urgensi: slot terbatas, promo, badge "hampir penuh" |
| `--color-border` | `#E6E2D6` | Line Marking | Border, divider, garis grid jadwal |
| `--color-success` | `#1F9D6C` | — | Booking berhasil |
| `--color-error` | `#E5484D` | — | Booking gagal/dibatalkan |

**Aturan pemakaian:**
- Ball Optic (`--color-cta`) sengaja sangat terang — dipakai SANGAT terbatas: tombol "Booking Sekarang" dan highlight slot kosong yang bisa diklik. Kalau dipakai di banyak tempat, efek "ini tombol penting"-nya hilang.
- Court Turquoise adalah warna identitas (logo, active nav, ikon), bukan warna aksi.
- Match Coral hanya untuk elemen yang menandakan waktu terbatas — jangan dipakai sebagai warna dekoratif biasa.
- Tetap light mode — konteks pemakaian di luar lapangan/siang hari membuat background terang lebih mudah dibaca di bawah sinar matahari dibanding panel gelap.

---

## 3. Tipografi

| Peran | Typeface | Alasan |
|---|---|---|
| Display / Heading | **Clash Display** | Geometris, tebal, energik — cocok untuk judul venue & harga yang harus langsung "kena" saat di-scroll cepat |
| Body / UI | **General Sans** | Netral, sangat legible di ukuran kecil untuk layar HP |
| Jadwal / Harga / Waktu | **JetBrains Mono** (tabular) | Angka jam & harga berjajar rapi di grid jadwal — penting supaya slot 08:00 dan 08:30 tidak "geser" secara visual |

### Skala Tipe

| Level | Ukuran | Weight | Font |
|---|---|---|---|
| Display (nama venue di halaman detail) | 32px / 1.15 | 700 | Clash Display |
| H1 | 24px / 1.2 | 600 | Clash Display |
| H2 | 18px / 1.3 | 600 | Clash Display |
| Body | 15px / 1.5 | 400 | General Sans |
| Caption / Badge | 12px / 1.4 | 500 | General Sans |
| Jam & Harga (grid jadwal) | 14px / 1.2, tabular-nums | 500 | JetBrains Mono |

---

## 4. Grid, Spacing & Radius

- **Grid:** mobile-first single column dengan breakpoint ke 2–3 kolom di tablet/desktop untuk list venue.
- **Spacing scale (8pt base):** 4 / 8 / 12 / 16 / 24 / 32 / 48px.
- **Border radius:** lebih besar & ramah dibanding produk B2B — merefleksikan produk konsumen yang santai:
  - Card venue: `16px`
  - Tombol & badge slot: `12px` (mendekati pill tapi tidak penuh, supaya tetap terasa "solid" bukan gimmick)
  - Tombol CTA utama: pill penuh (`9999px`) — satu-satunya elemen pill, supaya benar-benar menonjol sebagai titik aksi
- **Shadow:** sangat tipis, hanya untuk card venue yang mengambang di atas canvas (`0 6px 16px rgba(27,36,31,0.06)`).

---

## 5. Elemen Signature: "Court Grid"

Elemen pembeda utama PadelKu: **grid jadwal booking didesain seperti diagram lapangan padel**, bukan tabel spreadsheet generik.

- Grid slot jam digambar dengan garis tipis mirip garis lapangan (service line style — garis ganda tipis di antara kolom jam).
- Slot yang tersedia disorot Ball Optic; slot terisi berwarna abu netral dengan label "Terisi"; slot yang sedang di-lock orang lain berwarna Match Coral pudar dengan label "Diproses".
- Kartu venue di halaman pencarian punya aksen garis turquoise tipis di tepi kiri (bukan seluruh border) — meniru garis samping lapangan (sideline).
- Empty state ("belum ada booking") ditampilkan sebagai diagram lapangan kosong dengan ajakan "Cari & booking lapangan pertamamu".

Elemen ini dipakai konsisten di halaman jadwal & pencarian, tapi tidak dipaksakan ke elemen kecil seperti form settings biasa.

---

## 6. Komponen

### Button
| Varian | Style |
|---|---|
| Primary (Booking Sekarang) | Pill penuh, background `--color-cta`, teks `--color-ink` (bukan putih, karena Ball Optic terlalu terang untuk teks putih) |
| Secondary | Radius 12px, border 1px `--color-border`, teks `--color-ink` |
| Ghost | Tanpa background, teks `--color-brand`, underline saat hover |
| Destructive (Batalkan Booking) | Border/teks `--color-error`, fill merah muda saat hover |

### Card Venue
- Radius 16px, shadow tipis, foto venue di atas (rasio 16:9), aksen garis kiri turquoise 3px.
- Info harga ditulis JetBrains Mono supaya angka harga langsung "kebaca" tanpa perlu fokus lama.

### Grid Jadwal (Court Grid)
- Kolom = lapangan, baris = slot jam.
- Warna sel: kosong (putih + border) → hover jadi Ball Optic pudar → selected jadi Ball Optic penuh.
- Sel terisi: abu `--color-border` fill, teks "Terisi", tidak bisa diklik.

### Badge Status
- "Tersedia": teks+border `--color-success`, fill hijau 8% opacity.
- "Hampir Penuh" (< 3 slot tersisa hari ini): teks+border `--color-urgent`, fill coral 8% opacity — dipakai sebagai pemicu urgensi yang jujur (bukan fake scarcity).
- "Terverifikasi" (venue sudah lolos approval admin): ikon centang + teks `--color-brand`.

### Navigasi (Bottom Nav — mobile-first)
- Bottom navigation bar untuk mobile (Cari, Booking Saya, Membership, Profil) — bukan sidebar seperti produk desktop-first.
- Item aktif: ikon + label warna `--color-brand`, indikator titik kecil di atas ikon (bukan background block penuh).

---

## 7. Motion & Interaksi

Lebih hidup dibanding produk B2B karena konteksnya konsumen & olahraga — tapi tetap terarah, bukan ramai tanpa tujuan:

- **Konfirmasi booking sukses:** micro-animation checkmark dengan sedikit "bounce" (durasi 400ms) — satu-satunya tempat efek bounce dipakai, merepresentasikan momen kemenangan kecil (berhasil dapat slot).
- **Pilih slot di grid jadwal:** transisi warna instan + slight scale 1.02 saat tap (100ms) supaya terasa responsif di HP.
- **Loading pencarian venue:** skeleton card, bukan spinner generik.
- **Reduced motion:** hormati `prefers-reduced-motion` — matikan efek bounce, ganti fade instan.

---

## 8. Aksesibilitas

- Kontras teks `--color-ink` di atas `--color-canvas` aman WCAG AA. Untuk teks di atas `--color-cta` (Ball Optic), WAJIB pakai `--color-ink` (bukan putih) karena kontras putih-di-atas-kuning terlalu rendah.
- Target sentuh (tap target) minimum 44×44px di semua elemen grid jadwal — penting karena mayoritas interaksi lewat jari di HP.
- Status slot (tersedia/terisi/diproses) tidak hanya dibedakan warna — selalu disertai label teks.
- Focus state terlihat jelas untuk pengguna keyboard di versi desktop/admin dashboard.

---

## 9. Token CSS (Handoff untuk Dev — Tailwind/shadcn)

```css
:root {
  --color-canvas: #FBFAF6;
  --color-surface: #FFFFFF;
  --color-ink: #1B241F;
  --color-ink-muted: #5E6B62;
  --color-brand: #0E9E96;
  --color-cta: #D6FF3D;
  --color-urgent: #FF6B4A;
  --color-border: #E6E2D6;
  --color-success: #1F9D6C;
  --color-error: #E5484D;

  --radius-card: 16px;
  --radius-control: 12px;
  --radius-cta: 9999px;

  --font-display: 'Clash Display', sans-serif;
  --font-body: 'General Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  color-scheme: light only;
}
```

---

## 10. Do & Don't

| ✅ Do | ❌ Don't |
|---|---|
| Ball Optic hanya untuk CTA booking & slot tersedia | Pakai Ball Optic sebagai warna background/dekorasi |
| Grid jadwal terasa seperti diagram lapangan | Grid jadwal jadi tabel spreadsheet generik tanpa karakter |
| Desain mobile-first, dites di lebar HP dulu | Desain desktop lalu di-scale-down ke mobile |
| Badge urgensi jujur (berdasar data slot real) | Fake scarcity ("cuma 2 slot!" padahal tidak benar) |
| Radius besar & pill untuk elemen konsumen | Radius tajam 0px yang terasa terlalu "enterprise" |

---

## 11. Ringkasan Kepribadian Brand

Jika PadelKu adalah sebuah objek fisik, ia adalah **bola padel optic yellow yang baru dibuka dari kaleng** — terang, siap main, tidak butuh basa-basi. Cepat dipahami, enak dipakai satu tangan sambil jalan ke lapangan.