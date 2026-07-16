/**
 * app/api/account/delete/route.ts
 * Deletes the authenticated user. Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(authHeader.slice(7))
    if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[delete-account]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}