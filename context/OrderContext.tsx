"use client"

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from "react"
import { useAuth } from "@/context/AuthContext"
import { getUserOrders } from "@/lib/orders"
import type { OrderRow, OrderItem } from "@/lib/orders"
import { createPendingOrder, type PendingOrderResult } from "@/app/actions/create-order"
import type { CartItem } from "@/types/Product"

export type { OrderItem }
export type OrderStatus = "pending" | "completed" | "failed"

export interface Order {
  orderId: string
  date: string
  timestamp: string
  status: OrderStatus
  items: OrderItem[]
  total: number
}

interface OrderContextType {
  orders:    Order[]
  isLoading: boolean
  // Creates a pending order server-side (with server-verified pricing) and
  // returns what's needed to launch the Flutterwave checkout modal. Status
  // only ever becomes "completed" or "failed" via server-side verification
  // (app/api/flw-verify or the webhook) — never set directly from here.
  createOrder: (cart: CartItem[]) => Promise<PendingOrderResult>
  getOrder: (orderId: string) => Order | undefined
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
  }
}

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

  const createOrder = useCallback(async (cart: CartItem[]) => {
    if (!user) throw new Error("Cannot create an order — no authenticated user.")
    const result = await createPendingOrder({ userId: user.id, cart })
    await refreshOrders()
    return result
  }, [user, refreshOrders])

  const getOrder = useCallback(
    (orderId: string) => orders.find((o) => o.orderId === orderId),
    [orders]
  )

  return (
    <OrderContext.Provider value={{ orders, isLoading, createOrder, getOrder, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error("useOrders must be used within OrderProvider")
  return ctx
}