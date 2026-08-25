import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi layanan PadelKu.",
}

const sections = [
  {
    title: "Data yang kami proses",
    content: [
      "Data akun, seperti nama, alamat email, nomor telepon opsional, peran akun, dan informasi autentikasi yang dikelola oleh penyedia autentikasi kami.",
      "Data penggunaan layanan, seperti venue, lapangan, waktu booking, peserta, nominal, status transaksi, riwayat booking, dan komunikasi dukungan.",
      "Data teknis dan keamanan, seperti alamat IP, jenis perangkat atau peramban, cookie sesi, waktu akses, serta catatan kesalahan dan aktivitas keamanan.",
    ],
  },
  {
    title: "Cara kami menggunakan data",
    content: [
      "Kami menggunakan data untuk membuat dan mengamankan akun, menampilkan ketersediaan, memproses booking dan pembayaran, mengirim pembaruan layanan, menangani dukungan, mencegah penyalahgunaan, dan memenuhi kewajiban hukum.",
      "Kami tidak menjual data pribadi. Jika komunikasi pemasaran tersedia, pengguna dapat menolak komunikasi tersebut tanpa menghentikan pesan transaksional yang diperlukan untuk layanan.",
    ],
  },
  {
    title: "Pihak yang menerima data",
    content: [
      "Data dapat dibagikan seperlunya kepada operator venue untuk memenuhi booking, Supabase untuk autentikasi dan infrastruktur data, penyedia pembayaran untuk memproses transaksi, serta penyedia infrastruktur atau keamanan yang membantu menjalankan layanan.",
      "Kami juga dapat mengungkapkan data jika diwajibkan hukum, untuk melindungi pengguna dan layanan, atau dalam transaksi perubahan pengendalian dengan perlindungan yang sesuai.",
    ],
  },
  {
    title: "Pembayaran dan penyimpanan",
    content: [
      "Detail instrumen pembayaran diproses oleh penyedia pembayaran terkait. PadelKu dapat menyimpan referensi dan status transaksi, tetapi tidak bermaksud menyimpan kredensial kartu atau rekening lengkap.",
      "Data disimpan selama diperlukan untuk menyediakan layanan, menyelesaikan sengketa, menjaga keamanan, dan memenuhi kewajiban pencatatan. Periode yang berlaku dapat berbeda menurut jenis data dan kewajiban hukum.",
    ],
  },
  {
    title: "Pilihan dan hak pengguna",
    content: [
      "Pengguna dapat memperbarui informasi profil melalui akun. Permintaan akses, koreksi, penghapusan, atau keberatan atas pemrosesan dapat dikirim ke alamat kontak di bawah. Sebagian data mungkin tetap disimpan jika diperlukan untuk kewajiban hukum, keamanan, atau penyelesaian transaksi.",
      "Cookie yang diperlukan digunakan untuk autentikasi dan keamanan. Menonaktifkannya dapat membuat sebagian layanan tidak berfungsi.",
    ],
  },
  {
    title: "Keamanan dan perubahan kebijakan",
    content: [
      "Kami menerapkan kontrol teknis dan organisasi yang wajar, tetapi tidak ada sistem yang dapat menjamin keamanan mutlak. Pengguna harus menjaga kerahasiaan kredensial dan segera melaporkan aktivitas mencurigakan.",
      "Kebijakan ini dapat diperbarui ketika layanan atau ketentuan hukum berubah. Versi terbaru akan tersedia di halaman ini dengan tanggal berlaku yang diperbarui.",
    ],
  },
]

export default function PrivacyPage() {
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
            <ShieldCheck className="size-4" aria-hidden="true" /> Privasi dan data
          </div>
          <h1 className="font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Kebijakan Privasi</h1>
          <p className="mt-4 text-sm text-ink-muted">Berlaku sejak 25 Agustus 2026</p>
          <p className="mt-6 text-base leading-8 text-ink-muted">
            Kebijakan ini menjelaskan cara PadelKu memproses data pribadi ketika pengguna mengakses marketplace, membuat akun, melakukan booking, atau berkomunikasi dengan kami.
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
          <h2 className="font-display text-xl font-bold">Hubungi kami</h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            Pertanyaan atau permintaan terkait privasi dapat dikirim ke{" "}
            <a href="mailto:support@padelku.id" className="font-semibold text-brand hover:underline">support@padelku.id</a>.
          </p>
        </section>
      </article>
    </div>
  )
}
