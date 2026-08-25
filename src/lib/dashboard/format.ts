import { formatCurrency } from "@/lib/utils"

export { formatCurrency }

export const jakartaTimeZone = "Asia/Jakarta"

export function formatDashboardDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: jakartaTimeZone,
    ...options,
  }).format(new Date(value))
}

export function formatDashboardDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: jakartaTimeZone,
  }).format(new Date(value))
}

export function formatDashboardTime(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: jakartaTimeZone,
  }).format(new Date(value))
}

export function localDateKey(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: jakartaTimeZone,
    year: "numeric",
  }).format(value)
}

export function dateRangeForJakarta(date: string) {
  const start = new Date(`${date}T00:00:00+07:00`)
  const end = new Date(`${date}T00:00:00+07:00`)
  end.setUTCDate(end.getUTCDate() + 1)
  return { end: end.toISOString(), start: start.toISOString() }
}

export function percent(value: number) {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)}%`
}

export function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
