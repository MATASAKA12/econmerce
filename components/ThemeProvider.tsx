"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

// `attribute="class"` toggles a `dark` class on <html>, which globals.css
// is now set up to respond to. `defaultTheme="dark"` keeps your current
// look as the default; `enableSystem={false}` means it's purely the
// toggle button's call, not the OS's — set this to true if you'd rather
// it follow the visitor's system preference initially.
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}