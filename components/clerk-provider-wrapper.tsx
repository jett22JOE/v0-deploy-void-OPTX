"use client"

import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#f97316",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#ffffff",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
