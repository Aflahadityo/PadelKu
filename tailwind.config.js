const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        canvas: "#FBFAF6",
        surface: "#FFFFFF",
        ink: "#1B241F",
        "ink-muted": "#5E6B62",
        brand: "#0E9E96",
        cta: "#D6FF3D",
        urgent: "#FF6B4A",
        border: "#E6E2D6",
        success: "#1F9D6C",
        error: "#E5484D",
        // semantic aliases
        background: "var(--color-canvas)",
        foreground: "var(--color-ink)",
        primary: {
          DEFAULT: "var(--color-brand)",
          foreground: "var(--color-surface)",
        },
        destructive: {
          DEFAULT: "var(--color-error)",
          foreground: "var(--color-surface)",
        },
        muted: {
          DEFAULT: "var(--color-border)",
          foreground: "var(--color-ink-muted)",
        },
        accent: {
          DEFAULT: "var(--color-cta)",
          foreground: "var(--color-ink)",
        },
        card: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-ink)",
        },
      },
      borderRadius: {
        card: "16px",
        control: "12px",
        cta: "9999px",
        lg: "var(--radius-card)",
        md: "var(--radius-control)",
        sm: "8px",
        full: "9999px",
      },
      fontFamily: {
        display: ["var(--font-display)", ...fontFamily.sans],
        body: ["var(--font-body)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      fontSize: {
        "display-detail": ["32px", { lineHeight: "1.15", fontWeight: "700" }],
        h1: ["24px", { lineHeight: "1.2", fontWeight: "600" }],
        h2: ["18px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        "slot-time": ["14px", { lineHeight: "1.2", fontWeight: "500" }],
      },
      boxShadow: {
        card: "0 6px 16px rgba(27,36,31,0.06)",
      },
      spacing: {
        4.5: "18px",
        18: "72px",
      },
      keyframes: {
        "check-bounce": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slot-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      animation: {
        "check-bounce": "check-bounce 400ms ease-out",
        "slide-up": "slide-up 300ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
        "slot-pulse": "slot-pulse 100ms ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
