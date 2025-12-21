"use client"

import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { shadesOfPurple } from "@clerk/themes"
import { useState, useEffect } from "react"

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const [isProductionDomain, setIsProductionDomain] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hostname = window.location.hostname
    const isProduction = hostname === "jettoptics.ai" || hostname.endsWith(".jettoptics.ai")
    setIsProductionDomain(isProduction)
  }, [])

  // Show nothing until mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  // On non-production domains, render children without Clerk to avoid API errors
  if (!isProductionDomain) {
    return <>{children}</>
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple,
        variables: {
          // Override the yellow accent with your orange
          colorPrimary: "#b55200",
          colorDanger: "#ff4444",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
