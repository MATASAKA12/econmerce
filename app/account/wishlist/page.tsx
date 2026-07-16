"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { getWishlistIds, addToWishlist, removeFromWishlist, clearWishlist } from "@/lib/wishlist"
import { getProducts } from "@/lib/products"
import { Heart, ArrowLeft, ShoppingBag, Trash2, Eye, Loader2 } from "lucide-react"
import { Stars } from "@/components/Stars"
import { fmt } from "@/lib/Utils"
import type { Product } from "@/types/Product"

export default function WishlistPage() {
  const { user } = useAuth()

  // ── State ──────────────────────────────────────────────────────────────────
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // ── Derived ────────────────────────────────────────────────────────────────
  // Products whose id is in the wishlist
  const wishlisted = allProducts.filter((p) => wishlistIds.includes(p.id))
  // Recommendations: active products NOT in wishlist
  const recommended = allProducts
    .filter((p) => !wishlistIds.includes(p.id))
    .slice(0, 4)

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [products, ids] = await Promise.all([
        getProducts(),
        user ? getWishlistIds(user.id) : Promise.resolve([]),
      ])
      setAllProducts(products)
      setWishlistIds(ids)
    } catch (err) {
      console.error("WishlistPage load:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRemove = async (productId: string) => {
    if (!user) return
    setWishlistIds((prev) => prev.filter((id) => id !== productId))  // optimistic
    try {
      await removeFromWishlist(user.id, productId)
    } catch {
      setWishlistIds((prev) => [...prev, productId])                  // rollback
    }
  }

  const handleAdd = async (productId: string) => {
    if (!user) return
    setWishlistIds((prev) => [...prev, productId])                    // optimistic
    try {
      await addToWishlist(user.id, productId)
    } catch {
      setWishlistIds((prev) => prev.filter((id) => id !== productId)) // rollback
    }
  }

  const handleClearAll = async () => {
    if (!user) return
    const prev = [...wishlistIds]
    setWishlistIds([])
    try {
      await clearWishlist(user.id)
    } catch {
      setWishlistIds(prev)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d0d0d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </a>
          <div>
            <h1 className="text-lg font-black flex items-center gap-2">
              <Heart size={18} className="text-red-400 fill-red-400" />
              Wishlist
            </h1>
            <p className="text-xs text-gray-500">
              {loading ? "Loading…" : `${wishlisted.length} saved items`}
            </p>
          </div>
        </div>
        {wishlisted.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={12} /> Clear all
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 size={32} className="animate-spin text-orange-500" />
          </div>
        )}

        {/* Not signed in */}
        {!loading && !user && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={36} className="text-red-400" />
            </div>
            <h2 className="text-xl font-black mb-2">Sign in to view your wishlist</h2>
            <p className="text-gray-500 text-sm mb-8">Your saved items are stored in your account</p>
            <a
              href="/account/login"
              className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors inline-flex items-center gap-2"
            >
              Sign In
            </a>
          </div>
        )}

        {/* Empty wishlist */}
        {!loading && user && wishlisted.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={36} className="text-red-400" />
            </div>
            <h2 className="text-xl font-black mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-8">Save items you love by clicking the heart icon</p>
            <a
              href="/"
              className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors inline-flex items-center gap-2"
            >
              <ShoppingBag size={16} /> Browse Products
            </a>
          </div>
        )}

        {/* Wishlist grid */}
        {!loading && user && wishlisted.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlisted.map((product) => (
                <WishlistCard
                  key={product.id}
                  product={product}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Recommendations */}
            {recommended.length > 0 && (
              <div className="mt-16">
                <h2 className="text-lg font-black mb-6">You might also like</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommended.map((product) => (
                    <RecommendedCard
                      key={product.id}
                      product={product}
                      onWishlist={() => handleAdd(product.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function WishlistCard({
  product,
  onRemove,
}: {
  product: Product
  onRemove: (id: string) => void          // string — matches Product.id
}) {
  return (
    <div className="group bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
        <img
          src={product.image_url}          // ← correct field (was product.image)
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={() => onRemove(product.id)}
          className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Remove from wishlist"
        >
          <Heart size={14} className="fill-white" />
        </button>
        {product.badge && (
          <span className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500 mb-0.5">{product.category}</p>
        <p className="font-semibold text-sm leading-tight mb-1.5">{product.name}</p>
        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={product.rating} />
          <span className="text-gray-600 text-xs">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-orange-400 font-bold text-sm">{fmt(product.price)}</span>
          {product.old_price && (              // ← correct field (was originalPrice)
            <span className="text-gray-600 text-xs line-through">{fmt(product.old_price)}</span>
          )}
        </div>
        <a
          href={`/products/${product.slug}`}
          className="w-full mt-3 bg-orange-500 hover:bg-orange-400 text-white py-2 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingBag size={12} /> View Product
        </a>
      </div>
    </div>
  )
}

function RecommendedCard({
  product,
  onWishlist,
}: {
  product: Product
  onWishlist: () => void
}) {
  return (
    <div className="group bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
        <img
          src={product.image_url}          // ← correct field
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onWishlist}
            className="bg-white text-black p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors"
            aria-label="Save to wishlist"
          >
            <Heart size={14} />
          </button>
          <a
            href={`/products/${product.slug}`}
            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-400 transition-colors"
            aria-label="View product"
          >
            <Eye size={14} />
          </a>
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-xs leading-tight mb-1">{product.name}</p>
        <span className="text-orange-400 font-bold text-sm">{fmt(product.price)}</span>
      </div>
    </div>
  )
}
