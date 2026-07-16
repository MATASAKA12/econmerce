import { supabase } from "./supabase"

/** Get all product IDs in a user's wishlist */
export async function getWishlistIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId)

  if (error) { console.error("getWishlistIds:", error); return [] }
  return (data ?? []).map((r) => r.product_id)
}

/** Add a product to wishlist — safe to call even if already exists */
export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("wishlists")
    .upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" })

  if (error) throw error
}

/** Remove a product from wishlist */
export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)

  if (error) throw error
}

/** Clear entire wishlist for a user */
export async function clearWishlist(userId: string): Promise<void> {
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)

  if (error) throw error
}