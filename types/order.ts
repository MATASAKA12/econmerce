/**
 * types/Order.ts
 * Matches actual Supabase orders table (original 7 cols + migration additions)
 */

export interface OrderItem {
  id: string
  name: string
  image_url: string
  price: number
  quantity: number
  selectedSize: string
  selectedColor: string
}

export interface Order {
  id: string
  user_id?: string | null

  // Original Supabase columns
  amount: number
  status: "pending" | "paid" | "failed" | "processing" | "completed" | "cancelled"
  flutterwave_tx_ref?: string | null
  flutterwave_transaction_id?: string | null

  // Added via migration
  reference: string
  email: string
  customer_name: string
  phone?: string | null
  address: string
  city: string
  state: string
  items: OrderItem[]
  amount_naira: number

  created_at: string
  updated_at: string
}

export type CreateOrderInput = Omit<Order, "id" | "created_at" | "updated_at">