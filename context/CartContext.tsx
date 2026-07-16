"use client"

import {
  createContext, useContext, useState,
  useCallback, type ReactNode,
} from "react"
import type { Product, CartItem } from "@/types/Product"

interface CartContextType {
  cart:       CartItem[]
  cartCount:  number
  cartTotal:  number
  addToCart:  (product: Product, size?: string, color?: string) => void
  removeFromCart: (id: string, size: string, color: string) => void
  updateQty:  (id: string, size: string, color: string, delta: number) => void
  clearCart:  () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = useCallback((product: Product, size?: string, color?: string) => {
    const s = size  || product.sizes[0]  || ""
    const c = color || product.colors[0] || ""
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id && i.selectedSize === s && i.selectedColor === c
      )
      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.selectedSize === s && i.selectedColor === c
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...product, quantity: 1, selectedSize: s, selectedColor: c }]
    })
  }, [])

  const removeFromCart = useCallback((id: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.id === id && i.selectedSize === size && i.selectedColor === color))
    )
  }, [])

  const updateQty = useCallback((id: string, size: string, color: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id && i.selectedSize === size && i.selectedColor === color
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, updateQty, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}