import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCachedProduct } from "@/lib/products-server"
import { ProductDetailClient } from "@/components/ProductDetailClient"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

// Per-product SEO — each fabric gets its own indexable title, description,
// and Open Graph image instead of every product page looking identical
// to search engines.
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getCachedProduct(id).catch(() => null)

  if (!product) {
    return { title: "Product Not Found" }
  }

  const description =
    product.description?.slice(0, 160) ??
    `${product.name} — premium ${product.category} fabric from Bodega Fabrics Store.`

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image_url ? [{ url: product.image_url, width: 800, height: 800, alt: product.name }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
    alternates: {
      canonical: `/products/${id}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getCachedProduct(id).catch(() => null)

  if (!product) notFound()

  // Structured data — helps Google show price/availability directly in
  // search results for individual products.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviews ?? 0,
        }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  )
}