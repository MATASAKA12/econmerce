/**
 * app/api/flw-checkout/route.ts
 * Accepts orderTotal (subtotal + delivery) from the form
 */
import { NextRequest, NextResponse } from "next/server"
import { initializeFlutterwavePayment, generateReference } from "@/lib/flutterwave"
import { createOrder } from "@/lib/orders-admin"
import { supabase } from "@/lib/supabase"
import type { CartItem } from "@/types/Product"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      cart, email, customerName, phone,
      address, city, state,
      deliveryFee = 5000,
    } = body as {
      cart: CartItem[]
      email: string
      customerName: string
      phone?: string
      address: string
      city: string
      state: string
      deliveryFee: number
    }

    if (!cart?.length)       return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    if (!email)              return NextResponse.json({ error: "Email required" }, { status: 400 })
    if (!customerName)       return NextResponse.json({ error: "Name required" }, { status: 400 })
    if (!address || !city || !state)
                             return NextResponse.json({ error: "Full address required" }, { status: 400 })

    // ── Resolve user_id from Bearer token (guest checkout allowed — userId stays null) ──
    const authHeader = req.headers.get("authorization")
    let userId: string | null = null
    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7))
      userId = user?.id ?? null
    }

    const reference = generateReference()
    const origin     = req.headers.get("origin") ?? "http://localhost:3000"

    // Creates the pending order — prices are re-verified against the
    // products table inside createOrder(), not trusted from `cart` here.
    // `totalAmount` below comes back from that server-verified calculation,
    // not from the client-sent orderTotal that used to be trusted directly.
    const { amount: totalAmount } = await createOrder({
      reference,
      email,
      customerName,
      phone,
      address,
      city,
      state,
      cart,
      deliveryFee,
      userId,
    })

    // Initialize Flutterwave with the server-verified amount
    const paymentLink = await initializeFlutterwavePayment({
      tx_ref:       reference,
      amount:       totalAmount,
      currency:     "NGN",
      redirect_url: `${origin}/checkout/flw-verify`,
      customer: { email, name: customerName, phonenumber: phone },
      meta: {
        orderId: reference,
        items:   cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      },
      customizations: {
        title:       "Bodega Fabrics Store",
        description: `Order ${reference} · Delivery: ₦${deliveryFee.toLocaleString()}`,
        logo:        `${origin}/logo.png`,
      },
    })

    return NextResponse.json({ url: paymentLink })
  } catch (err: any) {
    console.error("[flw-checkout]", err)
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 })
  }
}