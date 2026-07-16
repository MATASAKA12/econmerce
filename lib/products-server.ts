import { unstable_cache } from "next/cache"
import { getProducts, getHotProducts, getProduct } from "./products"

// ─────────────────────────────────────────────────────────────────────────
// Server-only cached wrappers.
//
// `lib/products.ts` uses the supabase-js client, which calls `fetch`
// internally — but since it's currently invoked from a "use client"
// component's useEffect, none of Next's caching ever applies: every page
// load re-hits Supabase from scratch, after JS has already hydrated.
//
// These wrappers use `unstable_cache` so that when called from a Server
// Component, the result is cached in Next's Data Cache for `revalidate`
// seconds — meaning most visitors get an instant, pre-rendered response
// instead of waiting on a live database round-trip.
//
// IMPORTANT: only import/call these from Server Components (e.g. app/page.tsx),
// never from a "use client" file — unstable_cache has no effect there.
// ─────────────────────────────────────────────────────────────────────────

export const getCachedProducts = unstable_cache(
  async () => getProducts(),
  ["products-list"],
  { revalidate: 60, tags: ["products"] }
)

export const getCachedHotProducts = unstable_cache(
  async () => getHotProducts(),
  ["hot-products-list"],
  { revalidate: 60, tags: ["products", "hot-products"] }
)

// Single-product fetch, used by the product detail page. Tagged with both
// the shared "products" tag (so it's busted by the same revalidateProducts()
// call used elsewhere) and a per-product tag (in case you later want to
// revalidate just one product without touching the whole cache).
export function getCachedProduct(id: string) {
  return unstable_cache(
    async () => getProduct(id),
    [`product-${id}`],
    { revalidate: 60, tags: ["products", `product-${id}`] }
  )()
}

// After creating/updating/deleting a product from the admin dashboard,
// call `revalidateTag("products")` in that Server Action / Route Handler
// so the cache updates immediately instead of waiting up to 60s. Example:
//
//   import { revalidateTag } from "next/cache"
//   await updateProduct(id, changes)
//   revalidateTag("products")