import {
  CheckCircle2,
  Grid,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"

export function FeaturesBento() {
  return (
    <section className="py-12 lg:py-16">
      <div className="safe-area-x mx-auto max-w-7xl space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-surface px-3 py-1 text-xs font-bold text-brand shadow-2xs">
            <Sparkles className="size-3.5" />
            <span>Keunggulan Platform</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-ink">
            Didesain Khusus untuk Pemain Padel
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Bukan tabel spreadsheet biasa. PadelKu dibangun dari sudut pandang pemain yang butuh kecepatan, kepastian jadwal, dan kemudahan bermain bersama.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1: Court Grid Diagram (Big 7 Cols) */}
          <div className="md:col-span-7 rounded-3xl border border-border/90 bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-card relative overflow-hidden group">
            {/* Background court accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 size-64 rounded-full bg-brand/5 pointer-events-none" />

            <div className="space-y-4 max-w-md">
              <div className="grid size-12 place-items-center rounded-2xl bg-brand text-white shadow-2xs">
                <Grid className="size-6" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                Diagram Jadwal Lapangan Interaktif
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Lihat denah semua lapangan aktif berdampingan. Slot kosong disorot warna kuning bola optic (*Ball Optic*), slot terisi abu-abu netral, dan slot jam prima ditandai jelas.
              </p>
            </div>

            {/* Visual Micro Mockup */}
            <div className="mt-6 rounded-2xl border border-border/80 bg-surface-muted/70 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink pb-2 border-b border-border/60">
                <span className="font-mono text-[0.6875rem] text-brand">KEMANG ARENA · 4 LAPANGAN</span>
                <span className="badge-optic text-[0.625rem]">PILIH 1-KLIK</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                <div className="rounded-lg border border-brand bg-white p-2 font-bold text-ink">
                  18:00
                  <span className="block text-[0.625rem] text-brand font-semibold">Tersedia</span>
                </div>
                <div className="rounded-lg border-2 border-ink bg-booking p-2 font-extrabold text-ink shadow-2xs">
                  19:00
                  <span className="block text-[0.625rem] text-ink font-bold">Terpilih</span>
                </div>
                <div className="rounded-lg border border-border/50 bg-surface-muted p-2 text-ink-muted/50">
                  20:00
                  <span className="block text-[0.625rem]">Terisi</span>
                </div>
                <div className="rounded-lg border border-border/50 bg-surface-muted p-2 text-ink-muted/50">
                  21:00
                  <span className="block text-[0.625rem]">Terisi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Split Bill QRIS (5 Cols) */}
          <div className="md:col-span-5 rounded-3xl border border-border/90 bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-card relative overflow-hidden">
            <div className="space-y-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-urgent text-white shadow-2xs">
                <Users className="size-6" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                Split Bill Otomatis via QRIS
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Bagikan link pembayaran ke 3 teman mainmu. Masing-masing bayar via QRIS atau Virtual Account tanpa ada yang menalangi biaya penuh.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-urgent/20 bg-urgent/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-urgent text-white">
                  <Zap className="size-4" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-ink">Rp75.000 / orang</p>
                  <p className="text-[0.625rem] text-ink-muted">Terbagi 4 pemain otomatis</p>
                </div>
              </div>
              <span className="font-mono text-[0.6875rem] font-bold text-urgent">Instant QRIS</span>
            </div>
          </div>

          {/* Card 3: Digital Pass & QR Check-in (5 Cols) */}
          <div className="md:col-span-5 rounded-3xl border border-border/90 bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-card">
            <div className="space-y-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-ink text-white shadow-2xs">
                <QrCode className="size-6" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                E-Tiket & Check-in Digital
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Cukup tunjukkan QR Code di aplikasi saat tiba di arena. Staf venue langsung memverifikasi slot tanpa cetak struk atau konfirmasi manual.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-brand">
              <CheckCircle2 className="size-4" />
              <span>Simpan ke Apple Wallet & Google Calendar</span>
            </div>
          </div>

          {/* Card 4: Anti Double-Booking & Verified Venues (7 Cols) */}
          <div className="md:col-span-7 rounded-3xl border border-border/90 bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-card">
            <div className="space-y-4 max-w-md">
              <div className="grid size-12 place-items-center rounded-2xl bg-success text-white shadow-2xs">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                Garansi Anti Double-Booking 100%
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Saat kamu memilih slot, sistem otomatis mengunci jadwal selama 10 menit. Tidak ada risiko slot direbut orang lain di tengah proses pembayaran.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border/70 text-xs">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-brand" />
                <span className="font-medium text-ink">Venue WPT Terverifikasi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-brand" />
                <span className="font-medium text-ink">Kamera Rekam Match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-brand" />
                <span className="font-medium text-ink">Sewa Raket & Bola</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
