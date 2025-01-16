"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeWrapper } from "./theme-wrapper"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeWrapper>{children}</ThemeWrapper>
    </NextThemesProvider>
  )
}

