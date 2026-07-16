"use client"

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from "react"
import { useAuth } from "@/context/AuthContext"
import { getUserOrders, createOrder, markOrderPaid } from "@/lib/orders"
import type { OrderRow } from "@/lib/orders"

// NOTE ON STATUS VALUES:
// Your database has shown "pending" and "paid" so far. This type is kept
// permissive (not a strict union) until you confirm whether failed/
// cancelled Flutterwave attempts ever get written here, and what status
// string they'd use. The dashboard below buckets anything that isn't
// exactly "paid" or "pending" into "failed/cancelled" as a safe default.
export type OrderStatus = string

export interface OrderItem {
  id: string   // product id — was `number` in the original stub, changed
               // to match Product.id (string) throughout the rest of the app
  name: string
  image: string
  price: number
  quantity: number
  size: string
  color: string
}

export interface Order {
  orderId: string
  date: string        // human-readable, e.g. "July 10, 2026"
  timestamp: string    // ISO string, for sorting
  status: OrderStatus
  items: OrderItem[]
  total: number
  deliveryAddress?: string
}

interface OrderContextType {
  orders:    Order[]
  isLoading: boolean
  // NOTE: there is currently no `order_items` table (or an `items` jsonb
  // column) in your `orders` table, so line items are NOT persisted to
  // the database. `items` is kept in memory so the UI can show "what you
  // just ordered" right after checkout, but a page refresh will show that
  // order with an empty items array. If you want real order history with
  // product details, either add an `order_items` table (like the schema
  // I drafted earlier) or an `items jsonb` column on `orders` — happy to
  // wire either one up once you pick.
  addOrder: (
    items: OrderItem[],
    total: number,
    options?: { status?: string; flutterwaveTxRef?: string; deliveryAddress?: string }
  ) => Promise<Order>
  markPaid: (orderId: string, flutterwaveTxRef: string) => Promise<void>
  getOrder: (orderId: string) => Order | undefined
  refreshOrders: () => Promise<void>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

// Maps a Supabase `orders` row to the shape components consume. Items are
// filled in from local state where available (see itemsCache below) —
// otherwise empty, since the DB has nowhere to store them yet.
function mapRowToOrder(row: OrderRow, items: OrderItem[] = []): Order {
  return {
    orderId: row.id,
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-NG", {
          year: "numeric", month: "long", day: "numeric",
        })
      : "",
    timestamp: row.created_at ?? "",
    status: row.status,
    total: Number(row.amount),
    items,
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders]       = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // In-memory only — items created this session, keyed by order id, so a
  // freshly-placed order can still show its line items without a DB round
  // trip. Lost on refresh; see the note on OrderContextType.addOrder above.
  const [itemsCache, setItemsCache] = useState<Record<string, OrderItem[]>>({})

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const rows = await getUserOrders(user.id)
    setOrders(rows.map((row) => mapRowToOrder(row, itemsCache[row.id] ?? [])))
    setIsLoading(false)
  }, [user, itemsCache])

  useEffect(() => {
    refreshOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const addOrder = useCallback(
    async (
      items: OrderItem[],
      total: number,
      options?: { status?: string; flutterwaveTxRef?: string; deliveryAddress?: string }
    ): Promise<Order> => {
      if (!user) {
        throw new Error("Cannot create an order — no authenticated user.")
      }

      const row = await createOrder({
        userId: user.id,
        amount: total,
        status: options?.status,
        flutterwaveTxRef: options?.flutterwaveTxRef,
      })

      setItemsCache((prev) => ({ ...prev, [row.id]: items }))
      const newOrder = mapRowToOrder(row, items)
      if (options?.deliveryAddress) newOrder.deliveryAddress = options.deliveryAddress

      setOrders((prev) => [newOrder, ...prev])
      return newOrder
    },
    [user]
  )

  // Call this from your Flutterwave `onSuccessful` callback if you create
  // the order as "pending" before payment, then confirm it after.
  const markPaid = useCallback(async (orderId: string, flutterwaveTxRef: string) => {
    const row = await markOrderPaid(orderId, flutterwaveTxRef)
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? mapRowToOrder(row, o.items) : o))
    )
  }, [])

  const getOrder = useCallback(
    (orderId: string) => orders.find((o) => o.orderId === orderId),
    [orders]
  )

  return (
    <OrderContext.Provider value={{ orders, isLoading, addOrder, markPaid, getOrder, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error("useOrders must be used within OrderProvider")
  return ctx
}