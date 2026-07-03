import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  title: "PadelKu — Booking Lapangan Padel",
  description: "Cari & booking lapangan padel dari berbagai venue di Indonesia. Mudah, cepat, anti ribet.",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="light">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=general-sans@400,500,600&f[]=jet-brains-mono@400,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("bg-canvas text-ink font-body antialiased")}>
        <main className="min-h-screen pb-20 max-w-lg mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
