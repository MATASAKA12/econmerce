export interface Product {
  id: string
  name: string
  slug: string
  description?: string

  category: string

  price: number
  old_price?: number

  stock: number

  image_url: string
  images: string[]

  sizes: string[]
  colors: string[]

  rating: number
  reviews: number

  badge?: string

  featured: boolean

  created_at: string
}