"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, ShoppingCartIcon, Heart, Check } from "lucide-react"
import { Stars } from "@/components/Stars"
import { fmt, discountPercent } from "@/lib/Utils"
import { BADGE_COLORS } from "@/constants/product"
import { useCart } from "@/context/CartContext"
import type { Product } from "@/types/Product"

const easeOutExpo = [0.16, 1, 0.3, 1] as const

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutExpo } },
}

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart()
  const [yards,         setYards]         = useState(1)
  const [selectedColor, setSelectedColor] = useState("")
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product, yards, selectedColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-xs text-gray-500 mb-8"
        >
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href={`/#products`} className="hover:text-white transition-colors">
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </motion.nav>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="grid md:grid-cols-2 gap-10 lg:gap-16"
        >
          {/* ── Image ── */}
          <motion.div variants={item} className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-[#111] border border-white/5">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.badge && (
              <span
                className={`absolute top-4 left-4 text-white text-xs font-black tracking-widest px-3 py-1.5 rounded-full ${BADGE_COLORS[product.badge as keyof typeof BADGE_COLORS] ?? "bg-gray-500"}`}
              >
                {product.badge}
              </span>
            )}
          </motion.div>

          {/* ── Details ── */}
          <motion.div variants={item} className="flex flex-col">
            <p className="text-xs text-gray-500 font-bold tracking-[0.2em] uppercase mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <Stars rating={product.rating} />
              <span className="text-gray-500 text-sm">({product.reviews} reviews)</span>
            </div>

            {product.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-black" style={{ color: "#d4a017" }}>
                {fmt(product.price)}
              </span>
              {product.old_price && (
                <>
                  <span className="text-gray-600 line-through ml-3 text-base">
                    {fmt(product.old_price)}
                  </span>
                  <span className="ml-3 text-red-400 text-sm font-bold">
                    -{discountPercent(product.price, product.old_price)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Color picker */}
            {product.colors?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-2 font-medium tracking-widest">COLOR</p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === c ? "border-orange-500 scale-110" : "border-white/20"
                      }`}
                      style={{ background: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yardage input — fabric is sold by the yard, not sized */}
            <div className="mb-8">
              <p className="text-xs text-gray-500 mb-2 font-medium tracking-widest">YARDS NEEDED</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-1">
                  <button
                    onClick={() => setYards((y) => Math.max(0.5, Math.round((y - 0.5) * 10) / 10))}
                    className="w-10 h-11 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg"
                    aria-label="Decrease yardage"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={yards}
                    onChange={(e) => setYards(Math.max(0.5, Number(e.target.value) || 0.5))}
                    className="w-16 bg-transparent text-center text-white font-bold outline-none"
                  />
                  <button
                    onClick={() => setYards((y) => Math.round((y + 0.5) * 10) / 10)}
                    className="w-10 h-11 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg"
                    aria-label="Increase yardage"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-500 text-sm">
                  {yards} yd × {fmt(product.price)}/yd = <span className="text-orange-400 font-bold">{fmt(product.price * yards)}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              {product.stock === 0 ? (
                <button
                  disabled
                  className="flex-1 bg-gray-800 text-gray-500 py-4 rounded-full font-black cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-full font-black transition-colors flex items-center justify-center gap-2"
                >
                  {added ? (
                    <>
                      <Check size={18} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon size={18} /> Add to Cart
                    </>
                  )}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label="Add to wishlist"
              >
                <Heart size={18} />
              </motion.button>
            </div>

            <p className="text-xs text-gray-600 mt-4">
              {product.stock > 0
                ? `${product.stock} in stock`
                : "Currently unavailable"}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}