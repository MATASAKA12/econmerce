import { supabase } from "./supabase"
import type { Product } from "@/types/Product"

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProduct(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })

  if (error) { console.error("getFeaturedProducts:", error); return [] }
  return data ?? []
}

/**
 * Trending section.
 * Runs two simple queries instead of .or() to avoid PostgREST syntax issues.
 * Falls back gracefully — if both return nothing, returns top 3 by rating.
 */
export async function getHotProducts(): Promise<Product[]> {
  try {
    const [byBadge, byRating] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("badge", "HOT")
        .order("rating", { ascending: false })
        .limit(3),
      supabase
        .from("products")
        .select("*")
        .gte("rating", 4.9)
        .order("rating", { ascending: false })
        .limit(3),
    ])

    const merged = [...(byBadge.data ?? []), ...(byRating.data ?? [])]
    const seen   = new Set<string>()
    const unique = merged.filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    }).slice(0, 3)

    // Fallback: just return top 3 by rating if no HOT products exist yet
    if (unique.length === 0) {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("rating", { ascending: false })
        .limit(3)
      return data ?? []
    }

    return unique
  } catch (err) {
    console.error("getHotProducts:", err)
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) { console.error("getProductBySlug:", error); return null }
  return data
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${query}%`)

  return data ?? []
}

// ── Write (admin only) ────────────────────────────────────────────────────────

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at">>
): Promise<Product> {
  const payload: Record<string, unknown> = { ...updates }
  // Only include updated_at if column exists — won't break if it doesn't
  try { payload.updated_at = new Date().toISOString() } catch {}

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

/** Soft delete — sets is_active = false (requires is_active column) */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id)

  if (error) throw error
}

/** Hard delete — no recovery */
export async function hardDeleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
}