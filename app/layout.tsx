import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import { OrderProvider } from "@/context/OrderContext"
import { ThemeProvider } from "@/components/ThemeProvider"

// `display: "swap"` avoids invisible-text-while-loading (FOIT), which
// directly improves perceived load speed on slow connections.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// Set this in .env.local once you have a real domain, e.g.:
// NEXT_PUBLIC_SITE_URL=https://bodegafabricsstore.com
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bodegafabricsstore.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Bodega Fabrics Store — Premium African Fabrics",
    template: "%s | Bodega Fabrics Store",
  },
  description:
    "Premium authentic African fabrics — Ankara, Lace, Damask, Indian George, Duchess/Crepe, Suiting/Senator materials. Based in Ekeoha Shopping Centre, Aba, Nigeria.",
  keywords: [
    "African fabrics",
    "Ankara",
    "Lace fabric",
    "Damask",
    "Indian George",
    "Nigerian fabric store",
    "Aba fabrics",
    "Duchess fabric",
    "Senator material",
    "Bodega Fabrics",
  ],
  authors: [{ name: "Bodega Fabrics Store" }],
  creator: "Bodega Fabrics Store",

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Bodega Fabrics Store",
    title: "Bodega Fabrics Store — Premium African Fabrics",
    description:
      "Premium authentic African fabrics — Ankara, Lace, Damask, Indian George, Duchess/Crepe, Suiting/Senator materials.",
    images: [
      {
        url: "/og-image.jpg", // add this file to /public — 1200x630 recommended
        width: 1200,
        height: 630,
        alt: "Bodega Fabrics Store",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Bodega Fabrics Store — Premium African Fabrics",
    description:
      "Premium authentic African fabrics — Ankara, Lace, Damask, Indian George, Duchess/Crepe, Suiting/Senator materials.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  alternates: {
    canonical: siteUrl,
  },
}

// Separate from `metadata` as of Next 15+ — controls the browser chrome
// color and mobile viewport behavior.
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

// Structured data — helps Google understand this is an online store,
// which can surface richer search results (sitelinks, store info, etc.)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "Bodega Fabrics Store",
  url: siteUrl,
  description:
    "Premium authentic African fabrics — Ankara, Lace, Damask, Indian George, Duchess/Crepe, Suiting/Senator materials.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ekeoha Shopping Centre",
    addressLocality: "Aba",
    addressRegion: "Abia State",
    addressCountry: "NG",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-white text-black dark:bg-[#0a0a0a] dark:text-white antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {/* OrderProvider needs useAuth(), so it must live inside AuthProvider. */}
            <OrderProvider>
              {/* CartProvider wraps everything so cart persists across all pages */}
              <CartProvider>
                {children}
              </CartProvider>
            </OrderProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}