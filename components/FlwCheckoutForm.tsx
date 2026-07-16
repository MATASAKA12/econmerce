"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, Truck } from "lucide-react"
import { fmt } from "@/lib/Utils"
import { supabase } from "@/lib/supabase"
import type { CartItem } from "@/types/Product"

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
]

const DELIVERY_FEE = 5000   // ₦5,000 flat delivery fee

interface Props {
  cart: CartItem[]
  cartTotal: number           // subtotal before delivery
  prefillEmail?: string
  prefillName?: string
  prefillPhone?: string
  onSuccess?: () => void
}

export default function FlwCheckoutForm({
  cart, cartTotal,
  prefillEmail = "", prefillName = "", prefillPhone = "",
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    customerName: prefillName,
    email:        prefillEmail,
    phone:        prefillPhone,
    address:      "",
    city:         "",
    state:        "",
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const orderTotal = cartTotal + DELIVERY_FEE   // ← subtotal + delivery

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!cart.length) { setError("Your cart is empty."); return }
    if (!form.address.trim()) { setError("Please enter your delivery address."); return }
    if (!form.city.trim())    { setError("Please enter your city."); return }
    if (!form.state)          { setError("Please select your state."); return }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      const res = await fetch("/api/flw-checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          cart,
          ...form,
          // Pass the full total including delivery to the API
          deliveryFee: DELIVERY_FEE,
          orderTotal,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Checkout failed")

      onSuccess?.()
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const cls = "w-full p-3 rounded-xl bg-[#1a1a1a] text-white border border-white/10 focus:border-orange-500 outline-none text-sm placeholder:text-gray-600 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <p className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
          {error}
        </p>
      )}

      {/* Contact */}
      <div>
        <p className="text-xs text-gray-500 font-bold tracking-widest mb-3">CONTACT</p>
        <div className="space-y-3">
          <input value={form.customerName} onChange={set("customerName")} placeholder="Full Name *" required className={cls} />
          <input value={form.email}        onChange={set("email")}        placeholder="Email *" type="email" required className={cls} />
          <input value={form.phone}        onChange={set("phone")}        placeholder="Phone (08012345678)" type="tel" className={cls} />
        </div>
      </div>

      {/* Delivery */}
      <div>
        <p className="text-xs text-gray-500 font-bold tracking-widest mb-3">DELIVERY ADDRESS</p>
        <div className="space-y-3">
          <input value={form.address} onChange={set("address")} placeholder="Street Address *" required className={cls} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.city} onChange={set("city")} placeholder="City *" required className={cls} />
            <select value={form.state} onChange={set("state")} required className={cls}>
              <option value="">State *</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Order summary with delivery fee */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 space-y-2">
        <p className="text-xs text-gray-500 font-bold tracking-widest mb-3">ORDER SUMMARY</p>

        {/* Cart items */}
        {cart.map((item) => (
          <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
            className="flex justify-between text-sm">
            <span className="text-gray-400 truncate mr-4">
              {item.name} <span className="text-gray-600">× {item.quantity}</span>
            </span>
            <span className="text-white font-medium flex-shrink-0">
              {fmt(item.price * item.quantity)}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-white/5 pt-2 space-y-1.5">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-300">{fmt(cartTotal)}</span>
          </div>

          {/* Delivery fee */}
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Truck size={12} className="text-orange-400" />
              Delivery fee
            </span>
            <span className="text-gray-300">{fmt(DELIVERY_FEE)}</span>
          </div>

          {/* Total */}
          <div className="border-t border-white/5 pt-2 flex justify-between font-black text-white">
            <span>Total</span>
            <span className="text-orange-400 text-lg">{fmt(orderTotal)}</span>
          </div>
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
        Secured by Flutterwave. We never store your card details.
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !cart.length}
        className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/40 disabled:cursor-not-allowed text-white font-black py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Redirecting to payment…</>
          : `Pay ${fmt(orderTotal)} with Flutterwave`
        }
      </button>
    </form>
  )
}