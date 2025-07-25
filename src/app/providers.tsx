'use client'

import {HeroUIProvider} from '@heroui/react'
import {ThemeProvider} from 'next-themes'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      disableTransitionOnChange
    >
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  )
} 