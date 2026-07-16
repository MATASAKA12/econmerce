"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import FlwCheckoutForm from "@/components/FlwCheckoutForm"
import { ArrowLeft, ShoppingBag } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart } = useCart()
  const { user } = useAuth()

  // Only redirect if cart is truly empty after hydration
  useEffect(() => {
    // Small delay to let context hydrate before checking
    const timer = setTimeout(() => {
      if (cart.length === 0) router.replace("/")
    }, 300)
    return () => clearTimeout(timer)
  }, [cart, router])

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Your cart is empty</p>
          <a href="/" className="text-orange-400 hover:underline text-sm">
            Back to shopping
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-lg mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black">Checkout</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {cart.reduce((s, i) => s + i.quantity, 0)} item(s) · {" "}
              <span className="text-orange-400 font-bold">
                ₦{cartTotal.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Checkout form — prefilled with auth user data */}
        <FlwCheckoutForm
          cart={cart}
          cartTotal={cartTotal}
          prefillEmail={user?.email ?? ""}
          prefillName={user?.name ?? ""}
          onSuccess={clearCart}
        />
      </div>
    </div>
  )
}