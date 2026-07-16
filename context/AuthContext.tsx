"use client"

import {
  createContext, useContext, useEffect,
  useState, type ReactNode,
} from "react"
import { supabase } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"

export interface User {
  id: string
  email: string
  name: string
  created_at?: string
  last_sign_in_at?: string
}

interface AuthContextType {
  user:            User | null
  isAuthenticated: boolean
  isLoading:       boolean
  login:    (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout:   () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function buildUser(session: Session | null): Promise<User | null> {
  if (!session?.user) return null

  const authUser = session.user

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", authUser.id)
    .single()

  return {
    id:              authUser.id,
    email:           authUser.email ?? "",
    name:            profile?.full_name
                       ?? authUser.user_metadata?.full_name
                       ?? authUser.email?.split("@")[0]
                       ?? "User",
    created_at:      authUser.created_at,
    last_sign_in_at: authUser.last_sign_in_at,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hydrate from existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(await buildUser(session))
      setIsLoading(false)
    })

    // Stay in sync with any auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(await buildUser(session))
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  async function register(name: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) return { success: false, error: error.message }

    if (data.user) {
      await supabase
        .from("profiles")
        .upsert({ id: data.user.id, full_name: name }, { onConflict: "id" })
    }

    return { success: true }
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}