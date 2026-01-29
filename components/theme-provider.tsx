'use client'

import { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

// Placeholder theme provider so the app works without Next-specific theming.
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}
