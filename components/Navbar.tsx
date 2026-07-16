"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCartIcon, Search, Heart, User, Menu, X,
  ChevronRight, ChevronDown, Home, Tag, Sparkles, Percent,
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

interface NavbarProps {
  cartCount: number
  wishlistCount: number
  searchQuery: string
  onSearchChange: (q: string) => void
  onCartOpen: () => void
  onNavigate: (section: string) => void
}

const NAV_LINKS = [
  { label: "Home",         href: "/",              icon: Home,     key: "hero" },
  { label: "Products",     href: "#products",       icon: Tag,      key: "products",    dropdown: ["Tops","Bottoms","Outerwear","Accessories","Footwear"] },
  { label: "Categories",   href: "#categories",     icon: Tag,      key: "categories",  dropdown: ["Tops","Bottoms","Outerwear","Accessories","Footwear"] },
  { label: "New Arrivals", href: "#new-arrivals",   icon: Sparkles, key: "new-arrivals" },
  { label: "Sale",         href: "#sale",           icon: Percent,  key: "sale" },
]

export function Navbar({
  cartCount, wishlistCount, searchQuery,
  onSearchChange, onCartOpen, onNavigate,
}: NavbarProps) {
  const [navOpen,    setNavOpen]    = useState(false)
  const [openDrop,   setOpenDrop]   = useState<string | null>(null)
  const [searching,  setSearching]  = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const handleNavClick = (key: string) => {
    onNavigate(key)
    setNavOpen(false)
    setOpenDrop(null)
  }

  useEffect(() => {
    if (searching) searchRef.current?.focus()
  }, [searching])

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <button
          onClick={() => handleNavClick("hero")}
          className="text-xl font-black tracking-tighter hover:opacity-80 transition-opacity flex-shrink-0"
        >
          {/* Inline style forces the gold color regardless of theme */}
          <span className="text-black dark:text-white">BODEGA FABRICS</span>
          <span style={{ color: "#d4a017" }}>STORE</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="relative">
              <button
                onClick={() => {
                  if (link.dropdown) {
                    setOpenDrop(openDrop === link.key ? null : link.key)
                  } else {
                    handleNavClick(link.key)
                  }
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-medium"
              >
                <link.icon size={14} />
                {link.label}
                {link.dropdown && <ChevronDown size={12} className={`transition-transform ${openDrop === link.key ? "rotate-180" : ""}`} />}
              </button>

              <AnimatePresence>
                {link.dropdown && openDrop === link.key && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 mt-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-1 min-w-[140px] z-50"
                  >
                    {link.dropdown.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { onNavigate(cat.toLowerCase()); setOpenDrop(null) }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          {/* Search */}
          {searching ? (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="flex items-center gap-2 bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-full px-3 py-1.5"
            >
              <Search size={14} className="text-gray-500 flex-shrink-0" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products…"
                className="bg-transparent text-sm text-black dark:text-white outline-none w-40 placeholder:text-gray-500"
                onBlur={() => { if (!searchQuery) setSearching(false) }}
              />
              <button onClick={() => { onSearchChange(""); setSearching(false) }}>
                <X size={14} className="text-gray-500 hover:text-black dark:hover:text-white" />
              </button>
            </motion.div>
          ) : (
            <button onClick={() => setSearching(true)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              <Search size={20} />
            </button>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Wishlist */}
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Account */}
          <a href="/account/signin" className="p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <User size={20} />
          </a>

          {/* Cart — brand orange/gold stays constant across both themes */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCartOpen}
            className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors ml-1"
          >
            <ShoppingCartIcon size={16} />
            Cart
            {cartCount > 0 && (
              <span className="bg-white text-orange-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </motion.button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {navOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#0d0d0d] px-4 py-3 space-y-1 overflow-hidden"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
              >
                <link.icon size={16} />
                {link.label}
                <ChevronRight size={14} className="ml-auto" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}