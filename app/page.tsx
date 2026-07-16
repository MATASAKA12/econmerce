import { getCachedProducts, getCachedHotProducts } from "@/lib/products-server"
import { StoreClient } from "@/components/StoreClient"

// This is now a Server Component. Product data is fetched here, on the
// server, using the cached wrappers from lib/products-server.ts — so by
// the time HTML reaches the browser, products are already in it. No
// client-side loading flash, no waiting on Supabase after hydration.
export default async function StorePage() {
  const [products, hotProducts] = await Promise.all([
    getCachedProducts(),
    getCachedHotProducts(),
  ])

  return <StoreClient initialProducts={products} initialHotProducts={hotProducts} />
}