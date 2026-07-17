"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Check, Share2, ChevronRight, ChevronDown,
  Truck, Shield, RotateCcw, Zap, ArrowRight,
} from "lucide-react"
import { Navbar }         from "@/components/Navbar"
import { Hero }           from "@/components/Hero"
import { Footer }         from "@/components/Footer"
import { CartDrawer }     from "@/components/Cartdrawer"
import { QuickViewModal } from "@/components/Quickviewmodal"
import { ProductCard }    from "@/components/Productcard"
import { Stars }          from "@/components/Stars"
import { fmt }            from "@/lib/Utils"
import { useCart }        from "@/context/CartContext"
import type { Product, SortOption, Category } from "@/types/Product"

const CATEGORIES = ["All","Tops","Bottoms","Outerwear","Accessories","Footwear"] as const

const easeOutExpo = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
}

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const staggerItem = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
}

const viewportOnce = { once: true, margin: "-80px" }

interface StoreClientProps {
  initialProducts: Product[]
  initialHotProducts: Product[]
}

export function StoreClient({ initialProducts, initialHotProducts }: StoreClientProps) {
  const { cart, cartCount, cartTotal, addToCart, removeFromCart, updateQty } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const [wishlist, setWishlist] = useState<string[]>([])
  const toggleWishlist = (id: string) =>
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  const [quickView, setQuickView] = useState<Product | null>(null)

  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const [sortBy,         setSortBy]         = useState<SortOption>("featured")
  const [searchQuery,    setSearchQuery]    = useState("")

  const products    = initialProducts
  const hotProducts  = initialHotProducts

  const [toast, setToast] = useState("")
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2500)
  }

  const handleAddToCart = (product: Product, size?: string, color?: string) => {
    addToCart(product, size, color)
    showToast(`${product.name} added to bag`)
    setCartOpen(true)
  }

  const filtered = products
    .filter((p) => activeCategory === "All" || p.category === activeCategory)
    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price-asc")  return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      if (sortBy === "rating")     return b.rating - a.rating
      return 0
    })

  const handleNavigate = (section: string) => {
    const map: Record<string, string> = {
      tops: "Tops", bottoms: "Bottoms", outerwear: "Outerwear",
      footwear: "Footwear", accessories: "Accessories",
      sale: "All", "new-arrivals": "All",
    }
    if (map[section]) setActiveCategory(map[section] as Category)
  }

  const scrollToProducts = () =>
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-orange-500 text-white px-5 py-3 rounded-full text-sm font-medium flex items-center gap-2 shadow-xl">
          <Check size={14} /> {toast}
        </div>
      )}

      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartOpen={() => setCartOpen(true)}
        onNavigate={handleNavigate}
      />

      <Hero onShopNow={scrollToProducts} />

      {/* Features bar */}
      <div className="border-y border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0d0d0d]">
        <motion.div
          className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {[
            { icon: Truck,     title: "Free Delivery",  sub: "On orders over ₦30,000" },
            { icon: RotateCcw, title: "Easy Returns",   sub: "7-day return policy" },
            { icon: Shield,    title: "Secure Payment", sub: "100% protected checkout" },
            { icon: Zap,       title: "Fast Shipping",  sub: "Lagos: Same day delivery" },
          ].map(({ icon: Icon, title, sub }) => (
            <motion.div key={title} variants={staggerItem} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Shop by Category */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <h2 className="text-2xl font-black tracking-tight">Shop by Category</h2>
          <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            All categories <ChevronRight size={16} />
          </a>
        </motion.div>
        <motion.div
          className="grid grid-cols-3 lg:grid-cols-6 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              variants={staggerItem}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveCategory(cat); scrollToProducts() }}
              className={`py-4 px-2 rounded-2xl text-sm font-bold transition-colors ${
                activeCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 dark:bg-[#111] text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-white/5"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* New Arrivals Banner — brand-colored gradient card, reads fine on both themes unchanged */}
      <section id="new-arrivals" className="max-w-7xl mx-auto px-4 mb-16">
        <motion.div
          className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10"
            style={{ background: "radial-gradient(circle at 80% 50%, white, transparent)" }} />
          <div>
            <p className="text-orange-100 text-sm font-bold tracking-widest mb-2">LIMITED TIME</p>
            <h3 className="text-3xl lg:text-4xl font-black text-white mb-2">New Arrivals</h3>
            <p className="text-orange-100">Fresh drops every Friday. Be the first to cop.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToProducts}
            className="bg-white text-orange-600 px-8 py-3 rounded-full font-black text-sm hover:bg-orange-50 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            Shop New Arrivals <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </section>

      {/* Products Grid */}
      <section id="products" className="max-w-7xl mx-auto px-4 pb-24">
        <motion.div
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              {activeCategory === "All" ? "All Products" : activeCategory}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} products</p>
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 rounded-full px-4 py-2.5 pr-8 outline-none appearance-none cursor-pointer"
            >
              <option value="top-sales">Top Sales</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </motion.div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 dark:bg-[#111] text-gray-500 hover:text-black dark:hover:text-white border border-gray-200 dark:border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06, ease: easeOutExpo }}
            >
              <ProductCard
                product={product}
                wishlisted={wishlist.includes(product.id)}
                onAdd={handleAddToCart}
                onWishlist={toggleWishlist}
                onQuickView={setQuickView}
              />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && products.length > 0 && (
          <div className="text-center py-24">
            <p className="text-gray-500 dark:text-gray-600 text-lg">No products found</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All") }}
              className="text-orange-500 dark:text-orange-400 text-sm mt-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-500 dark:text-gray-600 text-lg">No products yet</p>
            <p className="text-gray-400 dark:text-gray-700 text-sm mt-1">Check back soon or visit the admin to add products.</p>
          </div>
        )}
      </section>

      {/* Trending Now */}
      {hotProducts.length > 0 && (
        <section id="trending" className="max-w-7xl mx-auto px-4 pb-24">
          <motion.div
            className="flex items-center justify-between mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
          >
            <h2 className="text-2xl font-black tracking-tight">🔥 Trending Now</h2>
            <a href="#" className="text-orange-500 dark:text-orange-400 text-sm font-medium flex items-center gap-1">
              See more <ChevronRight size={14} />
            </a>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
          >
            {hotProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={staggerItem}
                whileHover={{ y: -3 }}
                className="bg-gray-50 dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 flex gap-4 p-4 hover:border-orange-500/30 dark:hover:border-orange-500/20 transition-colors cursor-pointer"
                onClick={() => setQuickView(product)}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-200 dark:bg-[#1a1a1a]"
                />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                  <p className="font-bold text-sm leading-tight mb-2 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Stars rating={product.rating} />
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  <p className="text-orange-500 dark:text-orange-400 font-bold text-sm">{fmt(product.price)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Instagram CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <motion.div
          className="bg-gray-50 dark:bg-[#111] rounded-3xl p-8 text-center border border-gray-200 dark:border-white/5"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Share2 size={24} className="text-white" />
          </div>
          <h3 className="text-2xl font-black mb-2">Follow Our Style</h3>
          <p className="text-gray-500 mb-6">Tag us @bodegafabrics for a chance to be featured</p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            href="#"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Share2 size={16} /> @BodegaFabricsStore
          </motion.a>
        </motion.div>
      </section>

      <Footer />

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 lg:hidden z-40">
        <div className="grid grid-cols-4 h-16">
          {[
            { icon: "🛒", label: "Cart",    action: () => setCartOpen(true), badge: cartCount },
            { icon: "🔍", label: "Search",  action: () => {} },
            { icon: "♡",  label: "Saved",   badge: wishlist.length },
            { icon: "👤", label: "Profile", action: () => window.location.href = "/account/signin" },
          ].map(({ icon, label, action, badge }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-gray-600 hover:text-orange-500 dark:hover:text-orange-400 transition-colors relative"
            >
              <span className="text-lg">{icon}</span>
              <span className="text-[9px] font-medium">{label}</span>
              {badge ? (
                <span className="absolute top-2 right-[calc(50%-14px)] bg-orange-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <CartDrawer
        open={cartOpen}
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
      />

      <QuickViewModal
        product={quickView}
        onClose={() => setQuickView(null)}
        onAdd={handleAddToCart}
      />
    </div>
  )
}