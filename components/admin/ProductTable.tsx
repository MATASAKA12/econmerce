"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Trash2, ToggleLeft, ToggleRight, RefreshCw,
  Pencil, X, Check, Loader2,
} from "lucide-react"
import { getProducts, hardDeleteProduct, updateProduct } from "@/lib/products"
import { revalidateProducts } from "@/app/actions/revalidate"
import { fmt } from "@/lib/Utils"
import type { Product } from "@/types/Product"

const CATEGORIES = ["Tops","Bottoms","Outerwear","Accessories","Footwear"] as const
const BADGES     = ["", "NEW", "HOT", "SALE", "LIMITED"] as const

interface EditRow {
  name: string
  price: string
  stock: string
  category: string
  badge: string
  featured: boolean
}

export default function ProductTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const [products,   setProducts]   = useState<Product[]>([])
  const [loading,    setLoading]    = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [editRow,    setEditRow]    = useState<EditRow | null>(null)
  const [savingId,   setSavingId]   = useState<string | null>(null)
  const [search,     setSearch]     = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch ALL products (including inactive) for admin — bypass is_active filter
      const { createClient } = await import("@supabase/supabase-js")
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await sb
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
      setProducts(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load, refreshKey])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await hardDeleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      // Bust the storefront's cached product list so the deletion
      // reflects immediately instead of waiting up to 60s.
      revalidateProducts()
    } catch (err) {
      console.error(err)
      alert("Failed to delete product.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id)
    try {
      await updateProduct(product.id, { is_active: !product.is_active })
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p)
      )
      // Visibility changes should show/hide on the storefront right away.
      revalidateProducts()
    } catch (err) {
      console.error(err); alert("Failed to update status.")
    } finally {
      setTogglingId(null)
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditRow({
      name:     product.name,
      price:    String(product.price),
      stock:    String(product.stock),
      category: product.category,
      badge:    product.badge ?? "",
      featured: product.featured,
    })
  }

  const handleSaveEdit = async (product: Product) => {
    if (!editRow) return
    setSavingId(product.id)
    try {
      const updated = await updateProduct(product.id, {
        name:     editRow.name.trim(),
        price:    Number(editRow.price),
        stock:    Number(editRow.stock),
        category: editRow.category,
        badge:    editRow.badge || null,
        featured: editRow.featured,
      })
      setProducts((prev) => prev.map((p) => p.id === product.id ? updated : p))
      setEditingId(null)
      setEditRow(null)
      // Price/stock/name/badge edits should reflect on the storefront right away.
      revalidateProducts()
    } catch (err) {
      console.error(err); alert("Failed to save changes.")
    } finally {
      setSavingId(null)
    }
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount   = products.filter((p) => p.is_active).length
  const inactiveCount = products.filter((p) => !p.is_active).length
  const lowStock      = products.filter((p) => p.stock <= 5).length

  if (loading) {
    return (
      <div className="mt-10 flex justify-center py-12">
        <Loader2 size={28} className="animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="mt-10">

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",    value: products.length,  color: "text-white" },
          { label: "Live",     value: activeCount,      color: "text-green-400" },
          { label: "Hidden",   value: inactiveCount,    color: "text-gray-500" },
          { label: "Low stock",value: lowStock,         color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#111] rounded-xl p-4 border border-white/5">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Header + search */}
      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="flex-1 bg-[#111] border border-white/10 text-sm text-white rounded-full px-4 py-2 outline-none focus:border-orange-500/60 transition-colors placeholder:text-gray-600"
        />
        <button
          onClick={load}
          className="text-gray-500 hover:text-orange-400 transition-colors p-2"
          aria-label="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-600 py-12">No products yet. Add one above.</p>
      )}

      {products.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#111] text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Badge</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((product) => {
                const isEditing = editingId === product.id
                return (
                  <tr key={product.id} className={`transition-colors ${isEditing ? "bg-orange-500/5" : "bg-[#0d0d0d] hover:bg-[#111]"}`}>

                    {/* Name + image */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-zinc-800"
                        />
                        {isEditing ? (
                          <input
                            value={editRow!.name}
                            onChange={(e) => setEditRow((r) => r && ({ ...r, name: e.target.value }))}
                            className="bg-[#1a1a1a] border border-orange-500/40 text-white text-xs rounded-lg px-2 py-1 outline-none w-32"
                          />
                        ) : (
                          <span className="font-medium text-white leading-tight text-xs max-w-[120px] truncate">
                            {product.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {isEditing ? (
                        <select
                          value={editRow!.category}
                          onChange={(e) => setEditRow((r) => r && ({ ...r, category: e.target.value }))}
                          className="bg-[#1a1a1a] border border-orange-500/40 text-white text-xs rounded-lg px-2 py-1 outline-none"
                        >
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : product.category}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRow!.price}
                          onChange={(e) => setEditRow((r) => r && ({ ...r, price: e.target.value }))}
                          className="bg-[#1a1a1a] border border-orange-500/40 text-white text-xs rounded-lg px-2 py-1 outline-none w-24"
                        />
                      ) : (
                        <span className="text-orange-400 font-bold text-xs">{fmt(product.price)}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRow!.stock}
                          onChange={(e) => setEditRow((r) => r && ({ ...r, stock: e.target.value }))}
                          className="bg-[#1a1a1a] border border-orange-500/40 text-white text-xs rounded-lg px-2 py-1 outline-none w-16"
                        />
                      ) : (
                        <span className={`text-xs font-medium ${product.stock === 0 ? "text-red-400" : product.stock <= 5 ? "text-yellow-400" : "text-gray-300"}`}>
                          {product.stock === 0 ? "Out" : product.stock}
                        </span>
                      )}
                    </td>

                    {/* Badge */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editRow!.badge}
                          onChange={(e) => setEditRow((r) => r && ({ ...r, badge: e.target.value }))}
                          className="bg-[#1a1a1a] border border-orange-500/40 text-white text-xs rounded-lg px-2 py-1 outline-none"
                        >
                          {BADGES.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                        </select>
                      ) : product.badge ? (
                        <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {product.badge}
                        </span>
                      ) : <span className="text-gray-700 text-xs">—</span>}
                    </td>

                    {/* Featured */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editRow!.featured}
                          onChange={(e) => setEditRow((r) => r && ({ ...r, featured: e.target.checked }))}
                          className="accent-orange-500 w-4 h-4"
                        />
                      ) : (
                        <span className={`text-xs ${product.featured ? "text-orange-400 font-bold" : "text-gray-700"}`}>
                          {product.featured ? "Yes" : "No"}
                        </span>
                      )}
                    </td>

                    {/* is_active toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={togglingId === product.id}
                        className="flex items-center gap-1 text-xs font-medium transition-colors"
                      >
                        {togglingId === product.id ? (
                          <Loader2 size={14} className="animate-spin text-gray-500" />
                        ) : product.is_active ? (
                          <><ToggleRight size={18} className="text-green-400" /><span className="text-green-400">Live</span></>
                        ) : (
                          <><ToggleLeft size={18} className="text-gray-600" /><span className="text-gray-600">Hidden</span></>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(product)}
                              disabled={savingId === product.id}
                              className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-40"
                              aria-label="Save"
                            >
                              {savingId === product.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Check size={14} />
                              }
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditRow(null) }}
                              className="text-gray-600 hover:text-white transition-colors"
                              aria-label="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(product)}
                              className="text-gray-600 hover:text-orange-400 transition-colors"
                              aria-label="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={deletingId === product.id}
                              className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
                              aria-label="Delete"
                            >
                              {deletingId === product.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Trash2 size={14} />
                              }
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}