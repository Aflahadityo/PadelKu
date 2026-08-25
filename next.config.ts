import type { NextConfig } from "next"

const standaloneBuild =
  process.env.NEXT_BUILD_TARGET === "standalone" && !process.env.VERCEL

const nextConfig: NextConfig = {
  ...(standaloneBuild ? { output: "standalone" as const } : {}),
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
