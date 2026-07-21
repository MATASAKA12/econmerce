"use client"

import { useState } from "react"
import { uploadProductImage } from "@/lib/storage"
import { createProduct } from "@/lib/products"
import { ImagePlus, Loader2, Check } from "lucide-react"

const CATEGORIES = [
  "Wedding Materials",
  "Party Materials",
  "Aso-Ebi & Native",
  "Lace Materials",
  "Senator & Suiting",
  "Accessories & Beads",
] as const
const BADGES = ["", "NEW", "HOT", "SALE", "LIMITED"] as const

export default function ProductForm({ onCreated }: { onCreated?: () => void }) {
  const [name,        setName]        = useState("")
  const [price,       setPrice]       = useState("")
  const [description, setDescription] = useState("")
  const [category,    setCategory]    = useState("")
  const [oldPrice,    setOldPrice]    = useState("")
  const [stock,       setStock]       = useState("")
  const [colors,      setColors]      = useState("")
  const [badge,       setBadge]       = useState("")
  const [featured,    setFeatured]    = useState(false)
  const [image,       setImage]       = useState<File | null>(null)
  const [preview,     setPreview]     = useState<string | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState("")
  const [success,     setSuccess]     = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImage(file)
    if (file) setPreview(URL.createObjectURL(file))
    else setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess(false)

    if (!image)          { setError("Select a product image."); return }
    if (!name.trim())    { setError("Product name is required."); return }
    if (!price || isNaN(Number(price))) { setError("Enter a valid price per yard."); return }
    if (!category)       { setError("Select a category."); return }
    if (!stock || isNaN(Number(stock))) { setError("Enter stock in yards."); return }

    setLoading(true)
    try {
      const imageUrl = await uploadProductImage(image)

      await createProduct({
        name:        name.trim(),
        slug:        name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: description.trim(),
        category,
        price:       Number(price),       // per yard
        old_price:   oldPrice ? Number(oldPrice) : null,
        stock:       Number(stock),       // yards in stock
        image_url:   imageUrl,
        images:      [imageUrl],
        colors:      colors.split(",").map((c) => c.trim()).filter(Boolean),
        rating:      5,
        reviews:     0,
        badge:       badge || null,
        featured,
        is_active:   true,
      })

      // Reset
      setName(""); setPrice(""); setDescription(""); setCategory("")
      setOldPrice(""); setStock(""); setColors("")
      setBadge(""); setFeatured(false); setImage(null); setPreview(null)
      setSuccess(true)
      onCreated?.()
    } catch (err: any) {
      setError(err?.message ?? "Upload failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full p-3 rounded-xl bg-zinc-900 text-white border border-white/10 focus:border-orange-500/60 outline-none text-sm placeholder:text-gray-600 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="text-base font-black text-white">Add New Fabric</h2>

      {error   && <p className="bg-red-500/10 text-red-400 text-xs px-4 py-2.5 rounded-xl border border-red-500/20">{error}</p>}
      {success && <p className="bg-green-500/10 text-green-400 text-xs px-4 py-2.5 rounded-xl border border-green-500/20 flex items-center gap-2"><Check size={12} /> Product uploaded successfully!</p>}

      {/* Image upload */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Product Image *</label>
        <label
          htmlFor="product-image"
          className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl p-6 cursor-pointer hover:border-orange-500/40 transition-colors relative overflow-hidden"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          ) : null}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <ImagePlus size={24} className="text-gray-500" />
            <p className="text-xs text-gray-500">
              {image ? <span className="text-orange-400 font-medium">{image.name}</span> : "Click to upload image"}
            </p>
          </div>
        </label>
        <input id="product-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </div>

      {/* Name */}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name *" required className={inputCls} />

      {/* Description */}
      <textarea
        value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder="Product description…" rows={3}
        className={`${inputCls} resize-none`}
      />

      {/* Price row — clarified as per-yard */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Price per Yard (₦) *</label>
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 25000" required className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Old Price per Yard (₦)</label>
          <input type="number" min="0" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="e.g. 35000" className={inputCls} />
        </div>
      </div>

      {/* Category + Stock */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required className={inputCls}>
            <option value="">Select…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Stock (yards) *</label>
          <input type="number" min="0" step="0.5" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 50" required className={inputCls} />
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Colors (comma separated hex)</label>
        <input value={colors} onChange={(e) => setColors(e.target.value)} placeholder='e.g. "#000000, #ffffff, #ff5733"' className={inputCls} />
        {/* Color preview */}
        {colors && (
          <div className="flex gap-2 mt-2">
            {colors.split(",").map((c) => c.trim()).filter(Boolean).map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ background: c }} title={c} />
            ))}
          </div>
        )}
      </div>

      {/* Badge + Featured */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Badge</label>
          <select value={badge} onChange={(e) => setBadge(e.target.value)} className={inputCls}>
            {BADGES.map((b) => <option key={b} value={b}>{b || "No badge"}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none mt-4">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 accent-orange-500"
          />
          Featured
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-black py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
          : "Upload Product"
        }
      </button>
    </form>
  )
}