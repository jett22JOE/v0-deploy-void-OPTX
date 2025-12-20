"use client"

import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
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
