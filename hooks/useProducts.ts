"use client"

import { useEffect, useState } from "react"
import { getProducts } from "@/lib/products"

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getProducts()
        setProducts(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return {
    products,
    loading,
  }
}