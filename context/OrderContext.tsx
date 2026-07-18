"use client"

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from "react"
import { useAuth } from "@/context/AuthContext"
import { getUserOrders } from "@/lib/orders"
import type { OrderRow, OrderItem } from "@/lib/orders"

export type { OrderItem }
export type OrderStatus = "pending" | "completed" | "failed"

// Includes the extra fields your real schema has (delivery address,
// contact info, reference) in case order-history UI wants to show them —
// feel free to trim what you don't need.
export interface Order {
  orderId:        string
  date:            string
  timestamp:       string
  status:          OrderStatus
  items:           OrderItem[]
  total:           number
  reference:       string | null
  email:           string | null
  customerName:    string | null
  phone:           string | null
  deliveryAddress: string | null
  city:            string | null
  state:           string | null
}

interface OrderContextType {
  orders:        Order[]
  isLoading:     boolean
  getOrder:      (orderId: string) => Order | undefined
  refreshOrders: () => Promise<void>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

function mapRowToOrder(row: OrderRow): Order {
  return {
    orderId: row.id,
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-NG", {
          year: "numeric", month: "long", day: "numeric",
        })
      : "",
    timestamp: row.created_at ?? "",
    status: (row.status as OrderStatus) ?? "pending",
    total: Number(row.amount),
    items: row.items ?? [],
    reference:       row.reference,
    email:           row.email,
    customerName:    row.customer_name,
    phone:           row.phone,
    deliveryAddress: row.address,
    city:            row.city,
    state:           row.state,
  }
}

// Order creation happens entirely through app/api/flw-checkout and
// app/api/checkout — this context is read-only, reflecting orders already
// in the database for the signed-in user.
export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [orders, setOrders]       = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const rows = await getUserOrders(user.id)
    setOrders(rows.map(mapRowToOrder))
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    refreshOrders()
  }, [refreshOrders])

  const getOrder = useCallback(
    (orderId: string) => orders.find((o) => o.orderId === orderId),
    [orders]
  )

  return (
    <OrderContext.Provider value={{ orders, isLoading, getOrder, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error("useOrders must be used within OrderProvider")
  return ctx
}