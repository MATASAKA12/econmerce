export interface Product {
  id: string
  name: string
  slug: string
  description: string

  category: string

  /** Price PER YARD, in Naira */
  price: number
  old_price?: number | null

  /** Total yards currently in stock */
  stock: number

  image_url: string
  images: string[]

  colors: string[]

  rating: number
  reviews: number

  badge?: string | null
  featured: boolean

  // Extra fields for richer filtering & admin
  is_active: boolean
  tags?: string[]
  discount_percent?: number | null

  created_at: string
  updated_at: string
}

export interface CartItem extends Product {
  /** Yards selected. Reuses the "quantity" name so all existing
   * price × quantity math throughout the app works unchanged — it's just
   * decimal yards now instead of an integer item count. */
  quantity: number
  selectedColor: string
}

export type SortOption =
  | "featured"
  | "top-sales"      // ← was missing; used in page.tsx <select>
  | "rating"
  | "price-asc"
  | "price-desc"

export type Category =
  | "All"
  | "Wedding Materials"
  | "Party Materials"
  | "Aso-Ebi & Native"
  | "Lace Materials"
  | "Senator & Suiting"
  | "Accessories & Beads"