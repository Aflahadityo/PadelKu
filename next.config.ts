import type { NextConfig } from "next"

const standaloneBuild =
  process.env.NEXT_BUILD_TARGET === "standalone" && !process.env.VERCEL
const isDevelopment = process.env.NODE_ENV === "development"
const isProduction = process.env.NODE_ENV === "production"

const supabaseConnectSources = ["https://*.supabase.co", "wss://*.supabase.co"]
const supabaseImageSources = ["https://*.supabase.co"]

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const websocketProtocol = supabaseUrl.protocol === "https:" ? "wss:" : "ws:"

    supabaseConnectSources.push(supabaseUrl.origin, `${websocketProtocol}//${supabaseUrl.host}`)
    supabaseImageSources.push(supabaseUrl.origin)
  } catch {
    // Environment validation reports malformed URLs with application context.
  }
}

if (isDevelopment) {
  supabaseConnectSources.push(
    "http://127.0.0.1:*",
    "ws://127.0.0.1:*",
    "http://localhost:*",
    "ws://localhost:*",
  )
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://vercel.live https://*.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com https://vercel.live ${supabaseImageSources.join(" ")}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseConnectSources.join(" ")} https://*.vercel-insights.com https://vercel.live wss://*.pusher.com`,
  "frame-src https://vercel.live",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
]

const nextConfig: NextConfig = {
  ...(standaloneBuild ? { output: "standalone" as const } : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
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
