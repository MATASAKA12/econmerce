"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { fmt } from "@/lib/Utils"

type Status = "loading" | "paid" | "failed" | "cancelled" | "error"

export default function FlwVerifyPage() {
  const params        = useSearchParams()
  const router        = useRouter()
  const transactionId = params.get("transaction_id")
  const txRef         = params.get("tx_ref")
  const clientStatus  = params.get("status")

  const [status, setStatus]           = useState<Status>("loading")
  const [amountNaira, setAmountNaira] = useState<number | null>(null)
  const [reference, setReference]     = useState<string>("")

  useEffect(() => {
    if (!transactionId || !txRef) { router.replace("/"); return }

    // Build the API URL with all three params Flutterwave provides
    const qs = new URLSearchParams({
      transaction_id: transactionId,
      tx_ref:         txRef,
      status:         clientStatus ?? "",
    })

    fetch(`/api/flw-verify?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setReference(data.tx_ref ?? txRef)
        if (data.status === "paid")            { setStatus("paid"); setAmountNaira(data.amount_naira) }
        else if (data.status === "cancelled")    setStatus("cancelled")
        else if (data.status === "failed")       setStatus("failed")
        else                                     setStatus("error")
      })
      .catch(() => setStatus("error"))
  }, [transactionId, txRef, clientStatus, router])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#111] rounded-3xl border border-white/5 p-10 text-center">

        {/* Loading */}
        {status === "loading" && (
          <>
            <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">Verifying payment…</h2>
            <p className="text-gray-500 text-sm">Please wait, do not close this page.</p>
          </>
        )}

        {/* Success */}
        {status === "paid" && (
          <>
            <CheckCircle2 size={56} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Order Confirmed!</h2>
            {amountNaira && (
              <p className="text-orange-400 font-bold text-lg mb-2">{fmt(amountNaira)}</p>
            )}
            <p className="text-gray-400 text-sm mb-1">
              Reference: <span className="font-mono text-gray-300">{reference}</span>
            </p>
            <p className="text-gray-500 text-sm mb-8">
              You'll receive a confirmation email shortly. We ship within 24 hours.
            </p>
            <Link
              href="/"
              className="bg-orange-500 hover:bg-orange-400 text-white font-black px-8 py-3 rounded-full transition-colors inline-block"
            >
              Continue Shopping
            </Link>
          </>
        )}

        {/* Cancelled */}
        {status === "cancelled" && (
          <>
            <XCircle size={56} className="text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Payment Cancelled</h2>
            <p className="text-gray-400 text-sm mb-8">
              You cancelled the payment. Your cart is still saved — try again whenever you're ready.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="bg-orange-500 hover:bg-orange-400 text-white font-black px-6 py-3 rounded-full transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="bg-[#1a1a1a] text-gray-300 font-bold px-6 py-3 rounded-full border border-white/5 hover:bg-[#222] transition-colors"
              >
                Go Home
              </Link>
            </div>
          </>
        )}

        {/* Failed / Error */}
        {(status === "failed" || status === "error") && (
          <>
            <XCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Payment Failed</h2>
            <p className="text-gray-400 text-sm mb-8">
              {status === "failed"
                ? "Your payment was not completed. No charge was made."
                : "We couldn't verify your payment. Contact support if you were charged."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="bg-orange-500 hover:bg-orange-400 text-white font-black px-6 py-3 rounded-full transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="bg-[#1a1a1a] text-gray-300 font-bold px-6 py-3 rounded-full border border-white/5 hover:bg-[#222] transition-colors"
              >
                Go Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}