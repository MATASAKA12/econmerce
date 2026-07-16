"use client"

import { useRouter } from "next/navigation"
import { X, ShoppingCartIcon, Plus, Minus, Trash2, ArrowRight } from "lucide-react"
import { fmt } from "@/lib/Utils"
import type { CartItem } from "@/types/Product"

interface CartDrawerProps {
  open: boolean
  cart: CartItem[]
  cartTotal: number
  cartCount: number
  onClose: () => void
  onUpdateQty: (id: string, size: string, color: string, delta: number) => void
  onRemove: (id: string, size: string, color: string) => void
}

export function CartDrawer({
  open, cart, cartTotal, cartCount,
  onClose, onUpdateQty, onRemove,
}: CartDrawerProps) {
  const router = useRouter()

  const handleCheckout = () => {
    if (cart.length === 0) return
    onClose()
    router.push("/checkout")
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0d0d0d] border-l border-white/5 z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon size={20} className="text-orange-400" />
            <h2 className="text-base font-black">Your Cart</h2>
            {cartCount > 0 && (
              <span className="bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                <ShoppingCartIcon size={28} className="text-orange-400" />
              </div>
              <p className="text-gray-400 font-semibold mb-1">Your cart is empty</p>
              <p className="text-gray-600 text-sm mb-6">Add some items to get started</p>
              <button
                onClick={onClose}
                className="text-orange-400 text-sm font-bold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                className="flex gap-3 bg-[#111] rounded-2xl p-3 border border-white/5"
              >
                {/* Product image from Supabase Storage */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                  <img
                    src={item.image_url}        // ← correct field
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{item.selectedSize}</span>
                    <div
                      className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                      style={{ background: item.selectedColor }}
                    />
                  </div>
                  <p className="text-orange-400 font-black text-sm mt-1">
                    {fmt(item.price * item.quantity)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.selectedColor, -1)}
                      className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.selectedColor, 1)}
                      className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => onRemove(item.id, item.selectedSize, item.selectedColor)}
                      className="ml-auto text-gray-600 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-white/5 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="text-white font-bold">{fmt(cartTotal)}</span>
            </div>
            <p className="text-xs text-gray-600 text-center">
              Shipping calculated at checkout
            </p>

            {/* ← This is the working checkout button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Checkout <ArrowRight size={16} />
            </button>

            <button
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-full transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}