"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCartIcon } from "lucide-react"
import { Stars } from "@/components/Stars"
import { fmt, discountPercent } from "@/lib/Utils"
import { BADGE_COLORS } from "@/constants/product"
import type { Product } from "@/types/Product"

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
  onAdd: (p: Product, size: string, color: string) => void
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const

// This is a modal, not scroll content — it opens/closes based on `product`
// state rather than scroll position, so it uses AnimatePresence for
// enter/exit transitions instead of whileInView. The old `if (!product)
// return null` pattern is moved inside the AnimatePresence child so the
// exit animation gets a chance to play before the modal actually unmounts.
export function QuickViewModal({ product, onClose, onAdd }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")

  const handleAdd = () => {
    if (!product) return
    onAdd(product, selectedSize, selectedColor)
    onClose()
    setSelectedSize("")
    setSelectedColor("")
  }

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-[#111] rounded-3xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
          >

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white z-10 bg-black/50 rounded-full p-2"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="grid md:grid-cols-2">

              {/* ── Image ── */}
              <div className="aspect-square overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                <img
                  src={product.image_url}        // ← was `product.image` (wrong field)
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* ── Details ── */}
              <div className="p-6 flex flex-col">

                {/* Badge */}
                {product.badge && (
                  <span
                    className={`self-start text-white text-xs font-black tracking-widest px-3 py-1 rounded-full mb-4 ${BADGE_COLORS[product.badge]}`}
                  >
                    {product.badge}
                  </span>
                )}

                <h3 className="text-xl font-black mb-2">{product.name}</h3>

                <div className="flex items-center gap-2 mb-4">
                  <Stars rating={product.rating} />
                  <span className="text-gray-500 text-sm">
                    ({product.reviews} reviews)
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {product.description}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-orange-400 font-black text-2xl">
                    {fmt(product.price)}
                  </span>
                  {product.old_price && (               // ← was `product.originalPrice` (wrong field)
                    <>
                      <span className="text-gray-600 line-through ml-2 text-sm">
                        {fmt(product.old_price)}
                      </span>
                      <span className="ml-2 text-red-400 text-xs font-bold">
                        -{discountPercent(product.price, product.old_price)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Color picker */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium tracking-widest">COLOR</p>
                  <div className="flex gap-2">
                    {product.colors.map((c) => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-colors ${
                          selectedColor === c
                            ? "border-orange-500 scale-110"
                            : "border-white/20"
                        }`}
                        style={{ background: c }}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Size picker */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-2 font-medium tracking-widest">SIZE</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          selectedSize === s
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-white/10 text-gray-400 hover:border-white/30"
                        }`}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Out of stock guard */}
                {product.stock === 0 ? (
                  <button
                    disabled
                    className="bg-gray-800 text-gray-500 py-3 rounded-full font-black cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdd}
                    className="bg-orange-500 hover:bg-orange-400 text-white py-3 rounded-full font-black transition-colors flex items-center justify-center gap-2 mt-auto"
                  >
                    <ShoppingCartIcon size={18} /> Add to Cart
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}