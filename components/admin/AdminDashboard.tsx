"use client"

import { useState } from "react"
import ProductForm from "@/components/admin/ProductForm"
import ProductTable from "@/components/admin/ProductTable"
import { revalidateProducts } from "@/app/actions/revalidate"
import AdminGuard from "@/components/admin/AdminGuard"

function AdminDashboardContent() {
  const [refreshKey, setRefreshKey] = useState(0)
  const handleCreated = () => {
    setRefreshKey((k) => k + 1)
    revalidateProducts()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your BODEGA FABRICS inventory</p>
        </div>
        <ProductForm onCreated={handleCreated} />
        <ProductTable refreshKey={refreshKey} />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  )
}