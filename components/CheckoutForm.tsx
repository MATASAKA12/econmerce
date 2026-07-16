"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldCheck } from "lucide-react"
import { fmt } from "@/lib/Utils"
import type { CartItem } from "@/types/Product"

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
]

interface CheckoutFormProps {
  cart: CartItem[]
  cartTotal: number
  onSuccess?: () => void          // e.g. clear cart after redirect
}

export default function CheckoutForm({ cart, cartTotal, onSuccess }: CheckoutFormProps) {
  const router = useRouter()

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!cart.length) { setError("Your cart is empty."); return }

    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, ...form }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Checkout failed")

      // Clear cart before leaving — Paystack will redirect back to /checkout/verify
      onSuccess?.()

      // Redirect to Paystack hosted payment page
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const inputClass =
    "w-full p-3 rounded-xl bg-[#1a1a1a] text-white border border-white/10 focus:border-orange-500 outline-none text-sm placeholder:text-gray-600 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <p className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
          {error}
        </p>
      )}

      {/* ── Contact ── */}
      <div>
        <p className="text-xs text-gray-500 font-bold tracking-widest mb-3">CONTACT</p>
        <div className="space-y-3">
          <input
            value={form.customerName}
            onChange={set("customerName")}
            placeholder="Full Name *"
            required
            className={inputClass}
          />
          <input
            value={form.email}
            onChange={set("email")}
            placeholder="Email Address *"
            type="email"
            required
            className={inputClass}
          />
          <input
            value={form.phone}
            onChange={set("phone")}
            placeholder="Phone Number (e.g. 08012345678)"
            type="tel"
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Delivery ── */}
      <div>
        <p className="text-xs text-gray-500 font-bold tracking-widest mb-3">DELIVERY ADDRESS</p>
        <div className="space-y-3">
          <input
            value={form.address}
            onChange={set("address")}
            placeholder="Street Address *"
            required
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.city}
              onChange={set("city")}
              placeholder="City *"
              required
              className={inputClass}
            />
            <select
              value={form.state}
              onChange={set("state")}
              required
              className={inputClass}
            >
              <option value="">State *</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Order summary ── */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 space-y-2">
        <p className="text-xs text-gray-500 font-bold tracking-widest mb-3">ORDER SUMMARY</p>
        {cart.map((item) => (
          <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-sm">
            <span className="text-gray-400">
              {item.name}
              <span className="text-gray-600 ml-1">× {item.quantity}</span>
            </span>
            <span className="text-white font-medium">{fmt(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-white/5 pt-2 flex justify-between font-black text-white">
          <span>Total</span>
          <span className="text-orange-400">{fmt(cartTotal)}</span>
        </div>
      </div>

      {/* ── Trust badge ── */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
        Payments are processed securely by Paystack. We never store your card details.
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={loading || !cart.length}
        className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/40 disabled:cursor-not-allowed text-white font-black py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Redirecting to payment…
          </>
        ) : (
          `Pay ${fmt(cartTotal)} securely`
        )}
      </button>
    </form>
  )
}