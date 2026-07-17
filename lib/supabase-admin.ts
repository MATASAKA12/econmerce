import "server-only"
import { createClient } from "@supabase/supabase-js"

// SERVER-ONLY. Do not import this file from any "use client" component —
// the service role key bypasses Row Level Security entirely. If it ever
// reached the browser bundle, anyone could read/write every table in your
// database regardless of RLS policies. Only reference this from Server
// Actions (files starting with "use server") or Route Handlers.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is not set. Get it from Supabase → " +
    "Project Settings → API → service_role key, and add it to .env.local " +
    "(and your hosting provider's env vars) WITHOUT a NEXT_PUBLIC_ prefix."
  )
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})