# Product Requirements Document (PRD)
# PadelKu — Marketplace Booking Lapangan Padel Multi-Venue

| | |
|---|---|
| **Nama Produk** | PadelKu *(working name, bisa diganti)* |
| **Jenis Produk** | Marketplace SaaS Multi-Venue (Two-Sided Platform) |
| **Target Pasar** | Pemain padel & pemilik venue/klub padel di Indonesia |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 3 Juli 2026 |
| **Status** | Draft |

---

## 1. Ringkasan Produk (Executive Summary)

PadelKu adalah marketplace yang menghubungkan **pemain padel** dengan **venue/klub padel** dari berbagai lokasi dalam satu platform. Pemain bisa cari lapangan kosong, booking & bayar online secara real-time, langganan membership untuk diskon, booking pelatih, dan sewa alat — tanpa perlu chat WA satu-satu ke tiap venue.

Untuk pemilik venue, PadelKu adalah kanal distribusi + sistem manajemen booking & jadwal yang menggantikan pencatatan manual (buku/WA/Excel), lengkap dengan laporan pendapatan.

---

## 2. Latar Belakang & Masalah

Olahraga padel sedang tumbuh pesat, tapi proses booking di lapangan masih tradisional:

- Pemain harus tanya satu-satu ke tiap venue via WhatsApp/telepon untuk cek slot kosong.
- Tidak ada cara mudah membandingkan harga & lokasi venue dalam satu tempat.
- Pembayaran sering manual (transfer + kirim bukti), rawan miskomunikasi & double booking.
- Venue kecil-menengah belum punya sistem manajemen jadwal digital — masih pakai buku/Excel.
- Booking pelatih dan sewa alat masih terpisah-pisah, tidak terintegrasi dengan booking lapangan.

## 3. Tujuan Produk

1. Menyediakan **satu platform pencarian & booking** lapangan padel dari banyak venue sekaligus.
2. Menghilangkan risiko **double booking** lewat sistem slot real-time yang atomik.
3. Memberi pemilik venue **tools manajemen jadwal & laporan pendapatan** tanpa perlu bangun sistem sendiri.
4. Membuka revenue tambahan lewat **membership, booking pelatih, dan rental alat**.
5. Menjadi platform two-sided yang scalable secara komisi per transaksi.

---

## 4. Target Pengguna & Persona

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Player (Pemain)** | Cari & booking lapangan, member, sewa alat | Pencarian cepat, harga transparan, booking sekali klik |
| **Venue Owner/Admin** | Daftarkan venue, kelola jadwal & harga | Dashboard jadwal, laporan pendapatan, kontrol harga per jam |
| **Coach (Pelatih)** | Menawarkan jasa coaching lewat platform | Kalender availability sendiri, terima booking sesi |
| **Superadmin PadelKu** | Kelola seluruh venue & transaksi platform | Approval venue baru, monitoring komisi, handle dispute |

---

## 5. Ruang Lingkup

### 5.1 In Scope — Fase 1 (MVP)
- Pencarian & discovery venue (lokasi, harga, jam operasional)
- Booking lapangan real-time dengan kalender slot per jam
- Sistem anti double-booking (locking slot saat proses pembayaran)
- Pembayaran online (VA, e-wallet, QRIS via payment gateway)
- Dashboard venue dasar: kelola lapangan, jadwal, harga
- Rating & review venue
- Notifikasi booking (email, opsional WhatsApp)

### 5.2 In Scope — Fase 2
- Membership/subscription player (diskon booking, prioritas slot)
- Marketplace pelatih (booking sesi coaching terpisah dari lapangan)
- Rental alat (raket, bola, sepatu) sebagai add-on saat booking
- Laporan pendapatan venue yang lebih lengkap (grafik, ekspor)

### 5.3 In Scope — Fase 3
- Komunitas & matchmaking (buka/gabung open match, cari partner main)
- Dynamic pricing (harga peak/off-peak otomatis)
- Program loyalti/poin

### 5.4 Out of Scope (belum direncanakan)
- Live streaming pertandingan
- Turnamen berskala besar dengan bracket otomatis
- Integrasi wearable/tracking performa main

---

## 6. Fitur Utama (Modul)

### 6.1 Marketplace & Discovery
- Cari venue berdasarkan kota/lokasi (peta + list)
- Filter: harga per jam, jam operasional, fasilitas (indoor/outdoor, parkir, kantin)
- Halaman detail venue: foto, harga per lapangan, ulasan, lokasi

### 6.2 Booking & Jadwal Lapangan
- Kalender slot per jam per lapangan, update real-time
- Locking slot sementara (misal 10 menit) saat player masuk proses pembayaran, supaya tidak ada dua orang booking slot yang sama
- Riwayat booking player (upcoming & selesai)
- Kebijakan pembatalan (cancellation window, refund policy)

### 6.3 Pembayaran Online
- Integrasi payment gateway (Midtrans): Virtual Account, e-wallet, QRIS
- Invoice/bukti pembayaran otomatis
- Split komisi otomatis: pendapatan venue vs komisi platform

### 6.4 Membership & Paket Langganan
- Paket bulanan player: diskon per booking, kuota booking prioritas
- Venue bisa punya tier listing (standard/promoted) untuk visibilitas lebih di hasil pencarian

### 6.5 Coaching & Sewa Pelatih
- Profil pelatih (foto, spesialisasi, harga per sesi, rating)
- Kalender availability pelatih terpisah dari lapangan
- Booking gabungan: lapangan + pelatih sekaligus (opsional)

### 6.6 Rental Alat
- Add-on saat booking: sewa raket, bola, sepatu
- Stok alat dikelola per venue

### 6.7 Manajemen Venue (Venue Owner Dashboard)
- CRUD lapangan (nama, foto, harga per jam, jam operasional)
- Kalender jadwal semua lapangan dalam satu tampilan
- Laporan pendapatan (harian/mingguan/bulanan)
- Kelola pelatih & alat sewa yang terdaftar di venue tsb

### 6.8 Komunitas & Matchmaking *(Fase 3)*
- Buka "open match" (cari 2-3 pemain lagi untuk gabung)
- Gabung open match milik pemain lain

### 6.9 Rating & Review
- Player bisa review venue & pelatih setelah booking selesai
- Rating tampil di hasil pencarian untuk bantu keputusan player lain

### 6.10 Notifikasi
- Reminder booking (H-1, 2 jam sebelum main)
- Notifikasi konfirmasi pembayaran, pembatalan, refund

### 6.11 Admin & Superadmin Panel
- Approval venue baru sebelum tampil publik
- Monitoring transaksi & komisi platform
- Handle dispute/refund manual jika diperlukan

---

## 7. User Flow Utama (Ringkas)

**Player:**
1. Cari venue berdasarkan lokasi/tanggal → pilih venue
2. Pilih lapangan & slot jam kosong di kalender
3. (Opsional) tambah rental alat / booking pelatih
4. Bayar online → slot ter-lock otomatis selama proses bayar
5. Terima konfirmasi + reminder booking

**Venue Owner:**
1. Daftar venue → isi data lapangan, harga, jam operasional
2. Menunggu approval Superadmin
3. Kelola jadwal & pantau booking masuk dari dashboard
4. Lihat laporan pendapatan periodik

---

## 8. Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| Konsistensi Data | Booking harus atomik — tidak boleh ada dua transaksi berhasil mengunci slot yang sama (database transaction/lock) |
| Performa | Cek ketersediaan slot < 1 detik, terutama saat jam ramai (sore/malam & weekend) |
| Keamanan Pembayaran | Gunakan payment gateway resmi bersertifikasi, jangan simpan data kartu langsung di server sendiri |
| Mobile-first | Mayoritas player booking dari HP saat mau main — UI wajib dioptimalkan mobile dulu, baru desktop |
| Ketersediaan | Uptime tinggi terutama jam ramai (sore-malam & akhir pekan) |

---

## 9. Tech Stack (Rekomendasi)

| Layer | Teknologi |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend & DB | Supabase (Postgres, Auth, Storage), Prisma ORM |
| Booking Lock | Postgres transaction + row lock / advisory lock untuk cegah double booking |
| Payment | Midtrans (VA, e-wallet, QRIS) |
| Notifikasi | Email (Resend/SMTP) + WhatsApp API (opsional, fase 2) |
| Peta/Lokasi | Google Maps Platform / Mapbox |
| Hosting | Vercel |

---

## 10. Model Data (Ringkas)

Entitas utama: `User (role: player/venue_owner/coach/admin)`, `Venue`, `Court`, `BookingSlot`, `Booking`, `Payment`, `Membership`, `Coach`, `CoachAvailability`, `RentalItem`, `Review`, `Notification`.

Relasi inti: `Venue` punya banyak `Court` → `Court` punya banyak `BookingSlot` per hari → `BookingSlot` dikunci oleh satu `Booking` yang terhubung ke `Payment`. `Coach` dan `RentalItem` bisa ditambahkan sebagai item tambahan dalam satu `Booking`.

---

## 11. Model Bisnis

| Sumber Revenue | Skema |
|---|---|
| Komisi booking | % dari tiap transaksi booking sukses, dipotong otomatis dari pembayaran venue |
| Membership player | Biaya langganan bulanan, dapat diskon booking & prioritas slot |
| Listing premium venue | Biaya tambahan untuk venue supaya muncul lebih atas di hasil pencarian |
| Komisi coaching | % dari tiap booking sesi pelatih |

---

## 12. Success Metrics / KPI

- GMV (Gross Merchandise Value) booking per bulan
- Jumlah venue aktif terdaftar & terverifikasi
- Tingkat utilisasi lapangan (occupancy rate per venue)
- Retention player bulanan
- Rasio booking selesai vs dibatalkan

---

## 13. Roadmap Pengembangan

| Fase | Fokus | Estimasi |
|---|---|---|
| **Fase 1 (MVP)** | Discovery, booking real-time, pembayaran, dashboard venue dasar | 8–10 minggu |
| **Fase 2** | Membership, coaching marketplace, rental alat | 6 minggu |
| **Fase 3** | Matchmaking/komunitas, dynamic pricing, loyalti | 4–6 minggu |

---

## 14. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Double booking pada slot yang sama | Kunci slot dengan database transaction/lock saat proses pembayaran, auto-release jika pembayaran gagal/timeout |
| Venue palsu/tidak sesuai deskripsi | Verifikasi manual oleh Superadmin sebelum venue tampil publik |
| Sengketa refund/pembatalan | Kebijakan cancellation window yang jelas + proses dispute manual oleh admin |
| Traffic tinggi saat jam ramai (peak hour) | Desain database & caching yang siap menangani lonjakan request slot-checking |

---

## 15. Lampiran: Glosarium

- **Slot** — satu unit waktu booking (biasanya per jam) untuk satu lapangan.
- **Locking slot** — mekanisme mengunci sementara satu slot saat player sedang proses pembayaran, supaya tidak direbut orang lain.
- **GMV** — total nilai transaksi booking yang terjadi di platform dalam periode tertentu.