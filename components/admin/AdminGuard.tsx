"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "youradmin@gmail.com"

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Give AuthContext one tick to hydrate before deciding
    const timer = setTimeout(() => {
      if (user?.email !== ADMIN_EMAIL) {
        router.replace("/")          // replace so Back button doesn't return to admin
      } else {
        setChecking(false)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [user, router])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}