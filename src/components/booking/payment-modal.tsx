"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Copy, Check, Banknote, Smartphone, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  totalPrice: number
  paymentUrl?: string
  vaNumber?: string
  bankName?: string
  qrCode?: string
  expiryTime?: string
  status: "pending" | "success" | "expired" | "error"
  onCheckStatus: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  orderId,
  totalPrice,
  paymentUrl,
  vaNumber,
  bankName,
  qrCode,
  expiryTime,
  status,
  onCheckStatus,
}: PaymentModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/50 flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-surface rounded-t-[16px] sm:rounded-[16px] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-h2 font-display text-ink">Pembayaran</h2>
              <button onClick={onClose} className="p-1" aria-label="Tutup">
                <X className="w-5 h-5 text-ink-muted" />
              </button>
            </div>

            {status === "pending" && (
              <div className="space-y-5">
                <div className="bg-canvas rounded-control p-4 space-y-3">
                  <div className="flex justify-between text-body">
                    <span className="text-ink-muted">Total</span>
                    <span className="font-mono font-bold text-ink">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span className="text-ink-muted">ID Order</span>
                    <span className="font-mono text-sm text-ink">{orderId}</span>
                  </div>
                </div>

                {vaNumber && (
                  <div className="space-y-3">
                    <p className="text-body text-ink font-medium">
                      Transfer ke {bankName}
                    </p>
                    <div className="flex items-center gap-2 bg-canvas rounded-control p-4">
                      <span className="font-mono text-h2 text-ink flex-1 tracking-wider">
                        {vaNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(vaNumber)}
                        className="p-2 hover:bg-border/40 rounded-control transition-colors"
                        aria-label="Salin nomor VA"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-success" />
                        ) : (
                          <Copy className="w-5 h-5 text-ink-muted" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {qrCode && (
                  <div className="space-y-3 text-center">
                    <p className="text-body text-ink font-medium">Scan QRIS</p>
                    <div className="bg-surface border-2 border-border rounded-card p-4 inline-block mx-auto">
                      <img src={qrCode} alt="QR Code Pembayaran" className="w-48 h-48" />
                    </div>
                  </div>
                )}

                {expiryTime && (
                  <p className="text-caption text-urgent text-center">
                    Batas pembayaran: {expiryTime}
                  </p>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={onCheckStatus}
                >
                  Cek Status Pembayaran
                </Button>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <p className="text-body text-ink font-medium">Pembayaran Berhasil!</p>
                <Button variant="primary" className="w-full" onClick={onClose}>
                  Selesai
                </Button>
              </div>
            )}

            {status === "expired" && (
              <div className="text-center space-y-4 py-4">
                <p className="text-body text-error font-medium">
                  Pembayaran telah expired. Booking dibatalkan.
                </p>
                <Button variant="secondary" className="w-full" onClick={onClose}>
                  Tutup
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
