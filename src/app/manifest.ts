import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PadelKu — Marketplace Booking Lapangan Padel",
    short_name: "PadelKu",
    description: "Sistem booking lapangan padel real-time, cari sparring open match, dan sewa alat padel di Indonesia.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFAF6",
    theme_color: "#0E9E96",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
