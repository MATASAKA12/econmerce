/**
 * lib/paystack.ts
 *
 * Environment setup (in .env.local):
 * ─────────────────────────────────────────────────────────────────────────
 * # Set to "test" locally, "live" in production Vercel env vars
 * NEXT_PUBLIC_PAYMENT_ENV=test
 *
 * # Test keys (safe to use in development)
 * NEXT_PUBLIC_PAYSTACK_TEST_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
 * PAYSTACK_TEST_SECRET=sk_test_xxxxxxxxxxxxxxxxxxxx
 *
 * # Live keys (only set these in your production environment)
 * NEXT_PUBLIC_PAYSTACK_LIVE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
 * PAYSTACK_LIVE_SECRET=sk_live_xxxxxxxxxxxxxxxxxxxx
 * ─────────────────────────────────────────────────────────────────────────
 *
 * To go live: change NEXT_PUBLIC_PAYMENT_ENV=live in Vercel.
 * No code changes needed.
 */

const isLive = process.env.NEXT_PUBLIC_PAYMENT_ENV === "live"

/** Public key — safe to expose in the browser */
export const PAYSTACK_PUBLIC_KEY = isLive
  ? process.env.NEXT_PUBLIC_PAYSTACK_LIVE_KEY!
  : process.env.NEXT_PUBLIC_PAYSTACK_TEST_KEY!

/** Secret key — server-side only (API routes / Server Actions) */
export const PAYSTACK_SECRET_KEY = isLive
  ? process.env.PAYSTACK_LIVE_SECRET!
  : process.env.PAYSTACK_TEST_SECRET!

export const PAYSTACK_BASE_URL = "https://api.paystack.co"

export interface PaystackMetadata {
  orderId: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

/** Initialize a transaction — returns the authorization URL */
export async function initializePaystackTransaction(params: {
  email: string
  amountNaira: number          // in Naira — we convert to kobo internally
  reference: string
  callbackUrl: string
  metadata: PaystackMetadata
}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100),   // Paystack uses kobo
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  })

  const data = await res.json()
  if (!data.status) throw new Error(data.message ?? "Failed to initialize payment")
  return data.data as { authorization_url: string; access_code: string; reference: string }
}

/** Verify a transaction server-side after redirect */
export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    cache: "no-store",
  })

  const data = await res.json()
  if (!data.status) throw new Error(data.message ?? "Verification failed")
  return data.data as {
    status: "success" | "failed" | "abandoned"
    amount: number           // in kobo
    reference: string
    customer: { email: string }
    metadata: PaystackMetadata
  }
}

/** Generate a unique order reference */
export function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `SS-${ts}-${rand}`
}