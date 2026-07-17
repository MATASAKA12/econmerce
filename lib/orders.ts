import { supabase } from "@/lib/supabase"

// Client-safe reads only. All writes (create/update) now live in
// app/actions/create-order.ts and lib/orders-admin.ts, both server-only —
// this file is safe to import from "use client" components.

export interface OrderItem {
  id: string   // product id
  name: string
  image: string
  price: number
  quantity: number
  size: string
  color: string
}

export interface OrderRow {
  id: string
  user_id: string
  amount: number
  status: string   // "pending" | "completed" | "failed"
  flutterwave_tx_ref: string | null
  items: OrderItem[]
  created_at?: string
}

export async function getUserOrders(userId: string): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getUserOrders error:", error)
    return []
  }
  return data ?? []
}