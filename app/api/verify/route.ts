/**
 * app/api/verify/route.ts
 *
 * GET /api/verify?reference=SS-XXXXX
 * Called server-side from the verify page — secret key never touches the browser.
 */
import { NextRequest, NextResponse } from "next/server"
import { verifyPaystackTransaction } from "@/lib/paystack"
import { updateOrderStatus } from "@/lib/orders-admin"

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference")
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 })
  }

  try {
    const tx = await verifyPaystackTransaction(reference)

    if (tx.status === "success") {
      // DB status must be "completed" — matches the orders_status_check
      // constraint (pending | completed | failed). "paid" would violate it.
      await updateOrderStatus(reference, "completed")
      return NextResponse.json({ status: "paid", reference })
    } else {
      await updateOrderStatus(reference, "failed")
      return NextResponse.json({ status: tx.status, reference })
    }
  } catch (err: any) {
    console.error("[verify]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}