/**
 * app/api/flw-checkout/route.ts
 * Accepts orderTotal (subtotal + delivery) from the form
 */
import { NextRequest, NextResponse } from "next/server"
import { initializeFlutterwavePayment, generateReference } from "@/lib/flutterwave"
import { createOrder } from "@/lib/orders"
import { supabase } from "@/lib/supabase"
import type { CartItem } from "@/types/Product"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      cart, email, customerName, phone,
      address, city, state,
      deliveryFee = 5000,
      orderTotal,
    } = body as {
      cart: CartItem[]
      email: string
      customerName: string
      phone?: string
      address: string
      city: string
      state: string
      deliveryFee: number
      orderTotal: number
    }

    if (!cart?.length)       return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    if (!email)              return NextResponse.json({ error: "Email required" }, { status: 400 })
    if (!customerName)       return NextResponse.json({ error: "Name required" }, { status: 400 })
    if (!address || !city || !state)
                             return NextResponse.json({ error: "Full address required" }, { status: 400 })

    // ── Resolve user_id from Bearer token ─────────────────────────────────
    const authHeader = req.headers.get("authorization")
    let userId: string | null = null
    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7))
      userId = user?.id ?? null
    }

    const subtotal    = cart.reduce((s, i) => s + i.price * i.quantity, 0)
    const totalAmount = orderTotal ?? (subtotal + deliveryFee)
    const reference   = generateReference()
    const origin      = req.headers.get("origin") ?? "http://localhost:3000"

    // Save pending order to Supabase
    await createOrder({
      reference,
      status:        "pending",
      email,
      customer_name: customerName,
      phone,
      address,
      city,
      state,
      items: cart.map((i) => ({
        id:            i.id,
        name:          i.name,
        image_url:     i.image_url,
        price:         i.price,
        quantity:      i.quantity,
        selectedSize:  i.selectedSize,
        selectedColor: i.selectedColor,
      })),
      amount_naira:              totalAmount,
      amount:                    totalAmount,   // keep original col in sync
      user_id:                   userId,
      flutterwave_tx_ref:        null,
      flutterwave_transaction_id: null,
    })

    // Initialize Flutterwave with full amount including delivery
    const paymentLink = await initializeFlutterwavePayment({
      tx_ref:       reference,
      amount:       totalAmount,                // ← full amount with delivery
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