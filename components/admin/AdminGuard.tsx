"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "youradmin@gmail.com"

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for AuthContext to actually finish resolving the session before
    // deciding anything — a fixed setTimeout(0) isn't a real wait, since
    // the Supabase session fetch is a genuine async call that can easily
    // take longer than one JS tick, especially on a slower connection.
    if (isLoading) return
    if (user?.email !== ADMIN_EMAIL) {
      router.replace("/")   // replace so Back button doesn't return to admin
    }
  }, [user, isLoading, router])

  if (isLoading || user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}