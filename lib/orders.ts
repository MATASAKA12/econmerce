import { supabase } from "@/lib/supabase"

// Client-safe reads only. All writes live in lib/orders-admin.ts
// (server-only) — this file is safe to import from "use client" components.
//
// Full confirmed schema (17 columns):
// id, user_id, amount, status, flutterwave_tx_ref, flutterwave_transaction_id,
// created_at, reference, email, customer_name, phone, address, city, state,
// items (jsonb), amount_naira, updated_at

export interface OrderItem {
  id:            string
  name:          string
  image_url:     string
  price:         number
  quantity:      number
  selectedSize:  string
  selectedColor: string
}

export interface OrderRow {
  id:                          string
  user_id:                     string | null
  amount:                      number
  status:                      string   // "pending" | "completed" | "failed"
  flutterwave_tx_ref:          string | null
  flutterwave_transaction_id:  string | null
  created_at:                  string
  reference:                   string | null
  email:                       string | null
  customer_name:               string | null
  phone:                       string | null
  address:                     string | null
  city:                        string | null
  state:                       string | null
  items:                       OrderItem[]
  amount_naira:                number
  updated_at:                  string
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