import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { updateOrderStatus } from "@/lib/orders-admin"

// Configure in Flutterwave dashboard: Settings → Webhooks →
// https://yourdomain.com/api/webhooks/flutterwave, with a Secret Hash you
// choose — put the same value in FLUTTERWAVE_WEBHOOK_SECRET_HASH below.
//
// This exists as a backup to app/api/flw-verify/route.ts (which verifies
// on redirect back to your site) — it catches cases where a user pays but
// closes the tab before the redirect completes.
export async function POST(req: NextRequest) {
  // ── Layer 1: confirm this request actually came from Flutterwave ──────
  const signature = req.headers.get("verif-hash")
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH

  if (!secretHash || signature !== secretHash) {
    console.warn("Flutterwave webhook: invalid or missing signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const payload = await req.json().catch(() => null)
  const txRef = payload?.data?.tx_ref   // this IS your `reference` column value
  const transactionId = payload?.data?.id

  if (!txRef || !transactionId) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 })
  }

  // ── Layer 2: never trust the webhook body alone — independently
  // re-verify directly with Flutterwave's own API. ───────────────────────
  const verifyRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
  )

  if (!verifyRes.ok) {
    console.error("Flutterwave verify call failed:", await verifyRes.text())
    return NextResponse.json({ error: "Verification request failed" }, { status: 502 })
  }

  const verifyJson = await verifyRes.json()
  const tx = verifyJson?.data

  // ── Look up the order — matches on `reference`, not `flutterwave_tx_ref` ──
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("reference", txRef)
    .single()

  if (orderError || !order) {
    console.error("No matching order for reference:", txRef, orderError)
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Already finalized (webhooks can be delivered more than once) — ack
  // and stop, don't reprocess.
  if (order.status === "completed" || order.status === "failed") {
    return NextResponse.json({ received: true })
  }

  if (!tx || tx.status !== "successful" || tx.tx_ref !== txRef) {
    console.warn("Transaction did not verify as successful:", tx)
    await updateOrderStatus(txRef, "failed")
    return NextResponse.json({ received: true })
  }

  // ── Layer 3: cross-check the amount actually paid against what this
  // order expects — guards against a tampered or mismatched checkout. ────
  const expectedAmount = Number(order.amount)
  const paidAmount = Number(tx.amount)
  const currencyOk = tx.currency === "NGN"

  if (paidAmount < expectedAmount || !currencyOk) {
    console.error("Amount/currency mismatch:", {
      orderId: order.id, expectedAmount, paidAmount, currency: tx.currency,
    })
    await updateOrderStatus(txRef, "failed")
    return NextResponse.json({ received: true })
  }

  // ── All checks passed — record Flutterwave's own identifiers as
  // metadata alongside flipping status. ───────────────────────────────────
  await updateOrderStatus(txRef, "completed", {
    txRef: tx.flw_ref,
    transactionId: String(transactionId),
  })

  return NextResponse.json({ received: true })
}