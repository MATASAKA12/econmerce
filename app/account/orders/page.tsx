"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getUserOrders } from "@/lib/orders"
import {
  ArrowLeft, Package, ChevronDown, ChevronUp,
  Copy, Check, Loader2, ShoppingBag,
} from "lucide-react"
import { fmt } from "@/lib/Utils"
import type { Order, OrderItem } from "@/types/order"

const STATUS_STYLES: Record<string, string> = {
  paid:        "bg-green-500/20 text-green-400 border-green-500/30",
  completed:   "bg-green-500/20 text-green-400 border-green-500/30",
  pending:     "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  failed:      "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled:   "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const STATUS_LABEL: Record<string, string> = {
  paid: "Completed", completed: "Completed",
  pending: "Pending", processing: "Processing",
  failed: "Failed",  cancelled: "Cancelled",
}

type FilterTab = "all" | "processing" | "pending" | "completed" | "cancelled"

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [expanded, setExpanded]   = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getUserOrders(user.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  // ── Derived ──────────────────────────────────────────────────────────────
  const filtered = orders.filter((o) => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return o.status === "paid" || o.status === "completed"
    if (activeTab === "cancelled") return o.status === "failed" || o.status === "cancelled"
    return o.status === activeTab
  })

  const totalSpent = orders
    .filter((o) => o.status === "paid" || o.status === "completed")
    .reduce((s, o) => s + (o.amount_naira ?? o.amount ?? 0), 0)

  const completedCount  = orders.filter((o) => o.status === "paid" || o.status === "completed").length
  const processingCount = orders.filter((o) => o.status === "processing").length
  const pendingCount    = orders.filter((o) => o.status === "pending").length
  const cancelledCount  = orders.filter((o) => o.status === "failed" || o.status === "cancelled").length

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all",        label: "All Orders",  count: orders.length },
    { key: "processing", label: "Processing",  count: processingCount },
    { key: "pending",    label: "Pending",     count: pendingCount },
    { key: "completed",  label: "Completed",   count: completedCount },
    { key: "cancelled",  label: "Cancelled",   count: cancelledCount },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2">Sign in to view orders</h2>
          <a href="/account/login" className="text-orange-400 hover:underline text-sm">Go to login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d0d0d] px-6 py-4 flex items-center gap-4">
        <a href="/" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1 className="text-lg font-black">My Orders</h1>
          <p className="text-xs text-gray-500">
            {loading ? "Loading…" : `${orders.length} total orders`}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 size={32} className="animate-spin text-orange-500" />
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-black mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-8">Your orders will appear here after you make a purchase</p>
            <a
              href="/"
              className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors inline-flex items-center gap-2"
            >
              <ShoppingBag size={16} /> Start Shopping
            </a>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Orders", value: orders.length, sub: "All time" },
                { label: "Total Spent",  value: fmt(totalSpent), sub: "All purchases" },
                { label: "Completed",    value: completedCount, sub: `${orders.length - completedCount} in progress` },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-[#111] rounded-2xl p-5 border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-gray-600 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {tabs.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    activeTab === key
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-[#111] border-white/10 text-gray-500 hover:text-white"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Orders list */}
            <div className="space-y-4">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={expanded === order.id}
                  onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-600 py-12">No orders in this category.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── OrderCard ──────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  expanded,
  onToggle,
}: {
  order: Order
  expanded: boolean
  onToggle: () => void
}) {
  const [copied, setCopied] = useState(false)
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : []
  const displayAmount = order.amount_naira ?? order.amount ?? 0
  const statusKey = order.status in STATUS_STYLES ? order.status : "pending"

  const copyRef = () => {
    navigator.clipboard.writeText(order.reference ?? order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const date = new Date(order.created_at)
  const dateStr = date.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
  const timeStr = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">

      {/* Top row */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-mono">
                Order ID: <span className="text-white font-bold">{order.reference ?? order.id.slice(0, 12).toUpperCase()}</span>
              </span>
              <button onClick={copyRef} className="text-gray-600 hover:text-orange-400 transition-colors">
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>📅 {dateStr}</span>
              <span>🕐 {timeStr}</span>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[statusKey]}`}>
            • {STATUS_LABEL[statusKey] ?? order.status}
          </span>
        </div>

        {/* Item thumbnails */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {items.slice(0, 3).map((item, i) => (
              <img
                key={i}
                src={item.image_url}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover border-2 border-[#111]"
              />
            ))}
            {items.length > 3 && (
              <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border-2 border-[#111] flex items-center justify-center text-xs text-gray-500 font-bold">
                +{items.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          <span className="ml-auto text-orange-400 font-black">{fmt(displayAmount)}</span>
        </div>

        {/* Toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors mt-3"
        >
          {expanded ? "Hide details" : "View details"}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-4">

          {/* Items breakdown */}
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-xl bg-[#1a1a1a] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Size: {item.selectedSize} · Color: {item.selectedColor} · Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-orange-400 font-bold text-sm flex-shrink-0">
                  {fmt(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-gray-500 font-bold tracking-widest mb-2">DELIVERY ADDRESS</p>
              <p className="text-sm text-gray-300">{order.customer_name}</p>
              <p className="text-sm text-gray-400">{order.address}, {order.city}, {order.state}</p>
              {order.phone && <p className="text-sm text-gray-500 mt-1">{order.phone}</p>}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <span className="text-sm text-gray-500">Order Total</span>
            <span className="text-orange-400 font-black text-lg">{fmt(displayAmount)}</span>
          </div>
        </div>
      )}
    </div>
  )
}