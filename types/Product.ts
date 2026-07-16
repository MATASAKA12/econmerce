export interface Product {
  id: string
  name: string
  slug: string
  description: string

  category: string

  price: number
  old_price?: number | null

  stock: number

  image_url: string
  images: string[]

  sizes: string[]
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
  quantity: number
  selectedColor: string
  selectedSize: string
}

export type SortOption =
  | "featured"
  | "top-sales"      // ← was missing; used in page.tsx <select>
  | "rating"
  | "price-asc"
  | "price-desc"

export type Category =
  | "All"
  | "Tops"
  | "Bottoms"
  | "Outerwear"
  | "Accessories"
  | "Footwear"