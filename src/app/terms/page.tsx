import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, FileCheck2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Ketentuan Penggunaan",
  description: "Ketentuan penggunaan layanan PadelKu.",
}

const sections = [
  {
    title: "Akun dan kelayakan",
    content: [
      "Pengguna harus memberikan informasi yang benar, menjaga keamanan kredensial, dan bertanggung jawab atas aktivitas pada akun. Jika pengguna belum cakap untuk membuat perjanjian menurut hukum yang berlaku, penggunaan layanan memerlukan persetujuan orang tua atau wali.",
      "Akun pemain dan mitra venue dapat mengikuti proses pendaftaran yang tersedia. Hak akses administratif tidak diberikan melalui pendaftaran publik.",
    ],
  },
  {
    title: "Peran PadelKu",
    content: [
      "PadelKu menyediakan sarana untuk menemukan venue, melihat ketersediaan, dan mengelola booking. Informasi venue, fasilitas, aturan bermain, dan pelaksanaan layanan lapangan menjadi tanggung jawab operator venue terkait, kecuali dinyatakan lain secara tegas.",
      "Ketersediaan dan harga dapat berubah sampai booking dikonfirmasi. Tampilan status sementara atau demo bukan konfirmasi booking.",
    ],
  },
  {
    title: "Booking, pembayaran, dan pembatalan",
    content: [
      "Pengguna wajib memeriksa venue, tanggal, waktu, harga, dan kebijakan yang ditampilkan sebelum mengonfirmasi transaksi. Booking dianggap diterima setelah layanan menampilkan konfirmasi yang sah.",
      "Pembayaran dapat diproses oleh penyedia pembayaran pihak ketiga. Kebijakan perubahan jadwal, pembatalan, pengembalian dana, keterlambatan, dan ketidakhadiran mengikuti informasi yang ditampilkan saat transaksi atau aturan operator venue. PadelKu tidak menjanjikan pengembalian dana di luar kebijakan tersebut atau kewajiban hukum.",
    ],
  },
  {
    title: "Kewajiban pengguna dan mitra",
    content: [
      "Pengguna wajib mematuhi aturan venue, menjaga keselamatan, dan tidak menyalahgunakan layanan. Mitra venue wajib menjaga informasi, harga, ketersediaan, fasilitas, serta pemenuhan booking tetap akurat.",
      "Dilarang mengakses sistem tanpa izin, mengganggu layanan, melakukan penipuan, memakai identitas pihak lain, mengikis data secara otomatis tanpa izin, atau menggunakan layanan untuk kegiatan yang melanggar hukum.",
    ],
  },
  {
    title: "Ketersediaan dan batas tanggung jawab",
    content: [
      "Kami berupaya menjaga layanan tersedia dan akurat, tetapi tidak menjamin layanan selalu bebas gangguan atau kesalahan. Pemeliharaan, gangguan jaringan, tindakan penyedia pihak ketiga, atau keadaan di luar kendali wajar dapat memengaruhi layanan.",
      "Sejauh diizinkan hukum, tanggung jawab setiap pihak dibatasi pada kerugian langsung yang dapat dibuktikan. Ketentuan ini tidak menghapus hak konsumen atau tanggung jawab yang tidak dapat dikecualikan menurut hukum Indonesia.",
    ],
  },
  {
    title: "Penangguhan, kekayaan intelektual, dan perubahan",
    content: [
      "Kami dapat membatasi atau menangguhkan akun untuk melindungi pengguna, menanggapi dugaan pelanggaran, memenuhi hukum, atau menjaga keamanan layanan. Jika wajar dan diizinkan, kami akan memberikan pemberitahuan atau kesempatan untuk menghubungi dukungan.",
      "Merek, tampilan, perangkat lunak, dan materi PadelKu dilindungi oleh hak yang berlaku. Ketentuan dapat diperbarui jika layanan atau hukum berubah; penggunaan setelah tanggal berlaku versi baru berarti pengguna tunduk pada versi tersebut sejauh diizinkan hukum.",
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="border-b border-border bg-surface/90">
        <div className="safe-area-x mx-auto flex h-16 max-w-5xl items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">PadelKu</Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-brand">
            <ArrowLeft className="size-4" aria-hidden="true" /> Kembali
          </Link>
        </div>
      </header>

      <article className="safe-area-x mx-auto max-w-3xl py-12 sm:py-16">
        <div className="border-b border-border pb-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-bold text-brand">
            <FileCheck2 className="size-4" aria-hidden="true" /> Ketentuan layanan
          </div>
          <h1 className="font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Ketentuan Penggunaan</h1>
          <p className="mt-4 text-sm text-ink-muted">Berlaku sejak 25 Agustus 2026</p>
          <p className="mt-6 text-base leading-8 text-ink-muted">
            Ketentuan ini mengatur penggunaan situs dan layanan PadelKu. Dengan membuat akun atau menggunakan layanan, pengguna menyetujui ketentuan ini dan{" "}
            <Link href="/privacy" className="font-semibold text-brand hover:underline">Kebijakan Privasi</Link>.
          </p>
        </div>

        <div className="divide-y divide-border">
          {sections.map((section) => (
            <section key={section.title} className="py-8">
              <h2 className="font-display text-xl font-bold">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-ink-muted">
                {section.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-panel border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold">Hukum dan kontak</h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            Ketentuan ini ditafsirkan menurut hukum Republik Indonesia. Pertanyaan, keluhan, atau sengketa dapat diajukan terlebih dahulu melalui{" "}
            <a href="mailto:support@padelku.id" className="font-semibold text-brand hover:underline">support@padelku.id</a> untuk penyelesaian secara wajar.
          </p>
        </section>
      </article>
    </div>
  )
}
