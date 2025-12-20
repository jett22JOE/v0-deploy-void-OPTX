"use client"

import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#b55200",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa",
          colorBackground: "#0a0a0a",
          colorInputBackground: "rgba(255, 255, 255, 0.05)",
          colorInputText: "#ffffff",
          borderRadius: "0.5rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
