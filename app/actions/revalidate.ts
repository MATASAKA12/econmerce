"use server"

import { revalidateTag } from "next/cache"

// Call this from any client component right after a product is created,
// updated, or deleted, so the storefront's cached product list
// (lib/products-server.ts) updates immediately instead of waiting up to
// 60 seconds for the cache to naturally expire.
export async function revalidateProducts() {
  // { expire: 0 } forces immediate expiry — matches the original intent of
  // this function (admin makes a change, it shows up on the storefront
  // right away). The alternative, revalidateTag("products", "max"), gives
  // better performance but means the very next visitor could still briefly
  // see stale data while it revalidates in the background — not ideal
  // right after an admin edit.
  revalidateTag("products", { expire: 0 })
}