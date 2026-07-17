"use server"

import { randomUUID } from "crypto"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { CartItem } from "@/types/Product"

interface CreatePendingOrderInput {
  userId: string
  cart: CartItem[]
}

export interface PendingOrderResult {
  orderId:  string
  txRef:    string
  amount:   number
  currency: string
}

/**
 * Creates a "pending" order ahead of a Flutterwave checkout.
 *
 * Security-critical: prices are re-fetched from the `products` table here,
 * server-side — the client's cart (and whatever price it thinks each item
 * is) is NEVER trusted directly. This closes the gap where someone could
 * otherwise tamper with prices/totals in the browser before checkout.
 *
 * Call this from your checkout flow BEFORE launching the Flutterwave
 * modal, then pass the returned `txRef` and `amount` into Flutterwave's
 * config so what the user is asked to pay always matches what's in the DB.
 */
export async function createPendingOrder(
  { userId, cart }: CreatePendingOrderInput
): Promise<PendingOrderResult> {
  if (!userId) throw new Error("Not authenticated.")
  if (!cart.length) throw new Error("Cart is empty.")

  const productIds = cart.map((item) => item.id)

  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("id, name, price, image_url")
    .in("id", productIds)

  if (productsError) throw productsError

  const productMap = new Map(products.map((p) => [p.id, p]))

  let amount = 0
  const items = cart.map((cartItem) => {
    const product = productMap.get(cartItem.id)
    if (!product) {
      throw new Error(`Product ${cartItem.id} no longer exists — remove it from your cart.`)
    }
    const lineTotal = Number(product.price) * cartItem.quantity
    amount += lineTotal
    return {
      id:       product.id,
      name:     product.name,
      image:    product.image_url,
      price:    Number(product.price),   // server-verified, not client-sent
      quantity: cartItem.quantity,
      size:     cartItem.selectedSize,
      color:    cartItem.selectedColor,
    }
  })

  const txRef = `bodega-${randomUUID()}`

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: userId,
      amount,
      items,
      status: "pending",
      flutterwave_tx_ref: txRef,
    })
    .select()
    .single()

  if (orderError) throw orderError

  return { orderId: order.id, txRef, amount, currency: "NGN" }
}