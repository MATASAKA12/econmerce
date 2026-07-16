/**
 * app/api/flw-verify/route.ts
 *
 * GET /api/flw-verify?transaction_id=<flw_id>&tx_ref=<our_ref>&status=<successful|failed>
 *
 * Flutterwave appends these three params to redirect_url automatically.
 * We always re-verify server-side — never trust the client status param alone.
 */
import { NextRequest, NextResponse } from "next/server"
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave"
import { updateOrderStatus } from "@/lib/orders"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const transactionId = searchParams.get("transaction_id")
  const txRef         = searchParams.get("tx_ref")
  const clientStatus  = searchParams.get("status")

  if (!transactionId || !txRef) {
    return NextResponse.json({ error: "Missing transaction params" }, { status: 400 })
  }

  // If user cancelled on Flutterwave's page, short-circuit without an API call
  if (clientStatus === "cancelled") {
    await updateOrderStatus(txRef, "failed").catch(console.error)
    return NextResponse.json({ status: "cancelled", tx_ref: txRef })
  }

  try {
    const tx = await verifyFlutterwaveTransaction(transactionId)

    if (tx.status === "successful") {
      await updateOrderStatus(tx.tx_ref, "paid")
      return NextResponse.json({ status: "paid", tx_ref: tx.tx_ref, amount_naira: tx.amount })
    } else {
      await updateOrderStatus(tx.tx_ref, "failed")
      return NextResponse.json({ status: tx.status, tx_ref: tx.tx_ref })
    }
  } catch (err: any) {
    console.error("[flw-verify]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}