/**
 * lib/flutterwave.ts
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENVIRONMENT SETUP  (.env.local for dev, Vercel env vars for production)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * NEXT_PUBLIC_PAYMENT_ENV=test          # change to "live" to go live — nothing else changes
 *
 * # Test keys  (get from dashboard.flutterwave.com → Settings → API)
 * NEXT_PUBLIC_FLW_TEST_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxx-X
 * FLW_TEST_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxx-X
 * FLW_TEST_ENCRYPTION_KEY=FLWSECK_TEST_xxxxxxxxxxxxxxxxxx
 *
 * # Live keys  (only set in your production Vercel environment)
 * NEXT_PUBLIC_FLW_LIVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxxxxxx-X
 * FLW_LIVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxx-X
 * FLW_LIVE_ENCRYPTION_KEY=FLWSECK_xxxxxxxxxxxxxxxxxx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * To go live:  set NEXT_PUBLIC_PAYMENT_ENV=live in Vercel. No code changes needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const isLive = process.env.NEXT_PUBLIC_PAYMENT_ENV === "live"

// ── Keys ─────────────────────────────────────────────────────────────────────

/** Safe to use in the browser (inline checkout widget) */
export const FLW_PUBLIC_KEY = isLive
  ? process.env.NEXT_PUBLIC_FLW_LIVE_PUBLIC_KEY!
  : process.env.NEXT_PUBLIC_FLW_TEST_PUBLIC_KEY!

/** Server-side only — never expose this in client bundles */
export const FLW_SECRET_KEY = isLive
  ? process.env.FLW_LIVE_SECRET_KEY!
  : process.env.FLW_TEST_SECRET_KEY!

/** Used for standard charge encryption */
export const FLW_ENCRYPTION_KEY = isLive
  ? process.env.FLW_LIVE_ENCRYPTION_KEY!
  : process.env.FLW_TEST_ENCRYPTION_KEY!

export const FLW_BASE_URL = "https://api.flutterwave.com/v3"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FlwCustomer {
  email: string
  name: string
  phonenumber?: string
}

export interface FlwMeta {
  orderId: string
  items: Array<{ name: string; quantity: number; price: number }>
}

export interface FlwInitPayload {
  tx_ref: string
  amount: number                // in Naira
  currency: "NGN"
  redirect_url: string
  customer: FlwCustomer
  meta: FlwMeta
  customizations: {
    title: string
    description: string
    logo?: string
  }
}

export interface FlwVerifyResponse {
  status: "successful" | "failed" | "pending"
  amount: number
  currency: string
  tx_ref: string
  flw_ref: string
  customer: { email: string; name: string }
  meta: FlwMeta
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Collision-safe order reference */
export function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `SS-${ts}-${rand}`
}

/**
 * Initialize a Flutterwave Standard payment (server-side).
 * Returns the hosted payment link to redirect the user to.
 */
export async function initializeFlutterwavePayment(
  payload: FlwInitPayload
): Promise<string> {
  const res = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (data.status !== "success") {
    throw new Error(data.message ?? "Failed to initialize Flutterwave payment")
  }

  return data.data.link as string
}

/**
 * Verify a transaction by its ID after redirect.
 * Always call server-side — never trust the client callback alone.
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<FlwVerifyResponse> {
  const res = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
    cache: "no-store",
  })

  const data = await res.json()
  if (data.status !== "success") {
    throw new Error(data.message ?? "Flutterwave verification failed")
  }

  return data.data as FlwVerifyResponse
}