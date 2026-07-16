"use client"

import { useState } from "react"
import ProductForm from "@/components/admin/ProductForm"
import ProductTable from "@/components/admin/ProductTable"
import { revalidateProducts } from "@/app/actions/revalidate"

export default function AdminDashboard() {
  // Incrementing this tells ProductTable to refetch after a new product is created
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreated = () => {
    setRefreshKey((k) => k + 1)
    // Busts the storefront's cached product list (lib/products-server.ts)
    // so the new product shows up on the homepage immediately, instead of
    // waiting up to 60s for the cache to naturally expire.
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

        {/* Form — onCreated bumps refreshKey → table reloads, and busts the storefront cache */}
        <ProductForm onCreated={handleCreated} />

        {/* Table reacts to refreshKey. See note below re: also revalidating on edit/delete. */}
        <ProductTable refreshKey={refreshKey} />
      </div>
    </div>
  )
}