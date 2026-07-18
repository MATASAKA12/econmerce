"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, Plus, Heart } from "lucide-react"
import { Stars } from "@/components/Stars"
import { fmt, discountPercent } from "@/lib/Utils"
import { BADGE_COLORS } from "@/constants/product"
import type { Product } from "@/types/Product"

interface ProductCardProps {
  product: Product
  wishlisted: boolean
  onAdd: (p: Product) => void
  onWishlist: (id: string) => void   // ← was `number`, now matches Product.id: string
  onQuickView: (p: Product) => void
}

// Note: the scroll-reveal (whileInView) for this card is handled one level
// up, in page.tsx, where each ProductCard is wrapped in its own motion.div.
// Adding whileInView here too would double-animate the same element, so
// this file only adds motion to its internal hover/tap interactions.
//
// The image and product name link to the full product detail page
// (/products/[id]) — kept as siblings of the hover-overlay buttons rather
// than wrapping them, since nesting <button> inside <a> is invalid HTML
// and would break click handling.
export function ProductCard({
  product,
  wishlisted,
  onAdd,
  onWishlist,
  onQuickView,
}: ProductCardProps) {
  return (
    <div className="group relative bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all duration-300">

      {/* ── Image ── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.image_url}           // ← correct field
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badge top-left */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-full ${BADGE_COLORS[product.badge as keyof typeof BADGE_COLORS] ?? "bg-gray-500"}`}
          >
            {product.badge}
          </span>
        )}

        {/* Discount top-right */}
        {product.old_price && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            -{discountPercent(product.price, product.old_price)}%
          </span>
        )}

        {/* Hover action overlay — sibling of the Link above, not nested inside it */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 
          flex items-end justify-center gap-2 p-4 pointer-events-none group-hover:pointer-events-auto">

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onQuickView(product)}
            className="bg-white text-black p-2.5 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
            aria-label="Quick view"
          >
            <Eye size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAdd(product)}
            className="bg-orange-500 text-white px-4 py-2.5 rounded-full text-xs font-bold hover:bg-orange-400 transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> Add to Cart
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onWishlist(product.id)}   // ← string, no cast needed
            className={`p-2.5 rounded-full transition-colors ${
              wishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-black hover:bg-red-500 hover:text-white"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} className={wishlisted ? "fill-white" : ""} />
          </motion.button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4">
        <p className="text-gray-500 text-xs mb-1">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="text-white font-semibold text-sm mb-2 leading-tight hover:text-orange-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <Stars rating={product.rating} />
          <span className="text-gray-500 text-xs">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-orange-400 font-bold">{fmt(product.price)}</span>
            {product.old_price && (
              <span className="text-gray-600 text-xs line-through ml-2">
                {fmt(product.old_price)}
              </span>
            )}
          </div>

          {/* Color swatches — first 3 only */}
          <div className="flex gap-1">
            {product.colors.slice(0, 3).map((c) => (
              <div
                key={c}
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}