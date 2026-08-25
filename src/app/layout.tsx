import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/toast-provider"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
})

const description =
  "Marketplace booking lapangan padel #1 di Indonesia. Temukan arena premium di Jakarta, Bali, BSD, Bandung, & Surabaya dengan jadwal real-time instan."

export const metadata: Metadata = {
  metadataBase: new URL("https://padelku.id"),
  title: {
    default: "PadelKu — Modern Sport & Padel Court Booking Indonesia",
    template: "%s | PadelKu",
  },
  description,
  applicationName: "PadelKu",
  keywords: ["padel", "booking lapangan padel", "venue padel", "padel indonesia", "padel jakarta", "padel bali", "sewa lapangan padel"],
  authors: [{ name: "PadelKu" }],
  creator: "PadelKu",
  publisher: "PadelKu",
  category: "sports",
  alternates: { canonical: "/" },
  openGraph: {
    title: "PadelKu — Modern Sport & Padel Court Booking",
    description,
    url: "/",
    siteName: "PadelKu",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/hero-padel.jpg",
        width: 1200,
        height: 630,
        alt: "PadelKu Modern Court Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PadelKu — Booking Lapangan Padel Instan",
    description,
    images: ["/images/hero-padel.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
}


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#f3efe3",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="font-body text-ink antialiased selection:bg-brand selection:text-white">
        <a className="skip-link" href="#main-content">
          Lewati ke konten utama
        </a>
        <main id="main-content" tabIndex={-1} className="relative isolate min-h-dvh">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}

