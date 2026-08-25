import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  ...(process.env.NEXT_BUILD_TARGET === "standalone"
    ? { output: "standalone" as const }
    : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    qualities: [75, 85],
  },
}

export default nextConfig
