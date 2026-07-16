"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Package, CheckCircle2, Clock, XCircle, Wallet, LogOut,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useOrders } from "@/context/OrderContext"
import { fmt } from "@/lib/Utils"

const easeOutExpo = [0.16, 1, 0.3, 1] as const

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { orders, isLoading: ordersLoading } = useOrders()

  const loading = authLoading || ordersLoading

  // Redirect once auth has settled and there's genuinely no session —
  // avoids bouncing someone to signin during the brief initial load.
  if (!authLoading && !isAuthenticated) {
    router.push("/account/signin")
  }

  const stats = useMemo(() => {
    let completed = 0, pending = 0, failedOrCancelled = 0, totalSpent = 0
    for (const order of orders) {
      if (order.status === "paid") {
        completed += 1
        totalSpent += order.total
      } else if (order.status === "pending") {
        pending += 1
      } else {
        // Anything else (failed, cancelled, or an unrecognized status)
        // falls here — update this if your Flutterwave flow writes a
        // specific status string for failed/cancelled payments.
        failedOrCancelled += 1
      }
    }
    return { totalOrders: orders.length, completed, pending, failedOrCancelled, totalSpent }
  }, [orders])

  const STAT_CARDS = [
    { label: "Total Orders",       value: stats.totalOrders,       icon: Package,      accent: "text-orange-400 bg-orange-500/10" },
    { label: "Completed",          value: stats.completed,         icon: CheckCircle2, accent: "text-green-400 bg-green-500/10" },
    { label: "Pending",            value: stats.pending,           icon: Clock,        accent: "text-yellow-400 bg-yellow-500/10" },
    { label: "Failed / Cancelled", value: stats.failedOrCancelled, icon: XCircle,      accent: "text-red-400 bg-red-500/10" },
  ]

  const handleSignOut = async () => {
    await logout()
    router.push("/account/signin")
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">

        {/* ── Header ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10"
        >
          <motion.div variants={item}>
            <p className="text-xs text-gray-500 font-bold tracking-[0.2em] uppercase mb-1">Dashboard</p>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
              Welcome back, <span style={{ color: "#d4a017" }}>{user.name}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          </motion.div>

          <motion.button
            variants={item}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            className="self-start lg:self-auto flex items-center gap-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white px-4 py-2.5 rounded-full text-sm font-bold transition-colors"
          >
            <LogOut size={15} /> Sign Out
          </motion.button>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {STAT_CARDS.map(({ label, value, icon: Icon, accent }) => (
            <motion.div
              key={label}
              variants={item}
              className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Total spent — larger highlight card ── */}
        <motion.div initial="hidden" animate="visible" variants={container}>
          <motion.div
            variants={item}
            className="bg-gradient-to-r from-[#1a1408] to-[#111] border border-orange-500/20 rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Wallet size={22} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold tracking-[0.15em] uppercase mb-1">
                Total Amount Spent
              </p>
              <p className="text-3xl font-black" style={{ color: "#d4a017" }}>
                {fmt(stats.totalSpent)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Across {stats.completed} completed order{stats.completed === 1 ? "" : "s"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}