import { Badge, type BadgeProps } from "@/components/ui/badge"

const labels: Record<string, string> = {
  APPROVED: "Disetujui",
  AVAILABLE: "Tersedia",
  BLOCKED: "Diblokir",
  BOOKED: "Dipesan",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
  CONFIRMED: "Terkonfirmasi",
  DRAFT: "Draf",
  EXPIRED: "Kedaluwarsa",
  FAILED: "Gagal",
  LOCKED: "Dikunci",
  PENDING: "Menunggu",
  PENDING_PAYMENT: "Menunggu bayar",
  REFUNDED: "Dikembalikan",
  REJECTED: "Ditolak",
  SETTLED: "Lunas",
  SUSPENDED: "Ditangguhkan",
}

function variantForStatus(status: string): BadgeProps["variant"] {
  if (["APPROVED", "AVAILABLE", "COMPLETED", "CONFIRMED", "SETTLED"].includes(status)) return "success"
  if (["PENDING", "PENDING_PAYMENT", "LOCKED"].includes(status)) return "pending"
  if (["REJECTED", "FAILED", "CANCELLED", "SUSPENDED"].includes(status)) return "error"
  if (status === "BLOCKED") return "warning"
  if (status === "REFUNDED") return "info"
  return "neutral"
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={variantForStatus(status)}>{labels[status] ?? status}</Badge>
}
