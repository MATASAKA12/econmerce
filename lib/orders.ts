import { supabase } from "@/lib/supabase"

// These match your ACTUAL orders table columns (confirmed from the Supabase
// dashboard): id, user_id, amount, status, flutterwave_tx_ref, created_at.
// No `order_items` table exists yet — see the note in OrderContext.tsx
// about what that means for item-level order history.

export interface OrderRow {
  id: string
  user_id: string
  amount: number
  status: string   // seen values so far: "pending", "paid" — kept as
                    // `string` rather than a strict union until you confirm
                    // the full set (does a failed/cancelled payment ever
                    // get written here, and with what status string?)
  flutterwave_tx_ref: string | null
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

interface CreateOrderParams {
  userId: string
  amount: number
  status?: string              // defaults to "pending"
  flutterwaveTxRef?: string    // Flutterwave tx_ref / transaction_id
}

export async function createOrder({
  userId,
  amount,
  status = "pending",
  flutterwaveTxRef,
}: CreateOrderParams): Promise<OrderRow> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      amount,
      status,
      flutterwave_tx_ref: flutterwaveTxRef ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Call this from your Flutterwave `onSuccessful` callback to flip a
// previously-created "pending" order to "paid" once payment clears.
export async function markOrderPaid(orderId: string, flutterwaveTxRef: string): Promise<OrderRow> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "paid", flutterwave_tx_ref: flutterwaveTxRef })
    .eq("id", orderId)
    .select()
    .single()

  if (error) throw error
  return data
}