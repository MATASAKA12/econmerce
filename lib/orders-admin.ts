import "server-only"
import { supabaseAdmin } from "@/lib/supabase-admin"

// SERVER-ONLY writes to `orders`. Never import this from a "use client"
// component — it uses the service role key, which bypasses RLS. Safe to
// import from Route Handlers (app/api/**) and Server Actions only.
//
// `status` is typed loosely (string) rather than a strict union so this
// stays compatible with whatever your existing Paystack/Flutterwave verify
// routes already pass in — but the values this whole system is designed
// around are: "pending" | "completed" | "failed".

/**
 * Updates an order's status by matching its payment reference.
 * Call this ONLY after independently verifying the transaction with the
 * payment provider's own API (Flutterwave/Paystack) — never based on
 * anything the client claims happened.
 */
export async function updateOrderStatus(reference: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("flutterwave_tx_ref", reference)
    .select()
    .single()

  if (error) throw error
  return data
}