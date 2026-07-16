/**
 * lib/profile.ts
 * CRUD for the `profiles` table: { id, full_name, avatar_url, created_at }
 */
import { supabase } from "./supabase"

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) { console.error("getProfile:", error); return null }
  return data
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id" | "created_at">>
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates }, { onConflict: "id" })

  if (error) throw error
}