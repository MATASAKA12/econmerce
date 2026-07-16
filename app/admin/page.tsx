"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import ProductForm from "@/components/admin/ProductForm"
import ProductTable from "@/components/admin/ProductTable"
import { Loader2 } from "lucide-react"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ""

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Debug — remove after it works
    console.log("AdminPage — isLoading:", isLoading)
    console.log("AdminPage — user email:", user?.email)
    console.log("AdminPage — ADMIN_EMAIL env:", ADMIN_EMAIL)
    console.log("AdminPage — match:", user?.email === ADMIN_EMAIL)
  }, [user, isLoading])

  // Wait for auth to hydrate before deciding
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    )
  }

  // Not logged in at all
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">You must be signed in to access admin.</p>
          <a href="/account/login" className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  // Logged in but wrong email
  if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-2">Access Denied</p>
          <p className="text-gray-500 text-sm mb-1">Signed in as: <span className="text-white">{user.email}</span></p>
          <p className="text-gray-500 text-sm mb-4">
            {!ADMIN_EMAIL
              ? "NEXT_PUBLIC_ADMIN_EMAIL is not set in .env.local"
              : `Expected: ${ADMIN_EMAIL}`
            }
          </p>
          <a href="/" className="text-orange-400 text-sm hover:underline">Go home</a>
        </div>
      </div>
    )
  }

  // ✅ Authorised admin
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome, {user.name} · <span className="text-orange-400">{user.email}</span></p>
          </div>
          <a href="/" className="text-xs text-gray-500 hover:text-white border border-white/10 px-4 py-2 rounded-full transition-colors">
            ← Back to store
          </a>
        </div>

        <ProductForm onCreated={() => setRefreshKey((k) => k + 1)} />
        <ProductTable refreshKey={refreshKey} />
      </div>
    </div>
  )
}