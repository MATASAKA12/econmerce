"use server"

import { revalidateTag } from "next/cache"

// Call this from any client component right after a product is created,
// updated, or deleted, so the storefront's cached product list
// (lib/products-server.ts) updates immediately instead of waiting up to
// 60 seconds for the cache to naturally expire.
export async function revalidateProducts() {
  revalidateTag("products")
}