"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { useMemo, type ReactNode } from "react"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    // Return null if no URL (during build without env vars)
    if (!convexUrl) {
      return null
    }
    return new ConvexReactClient(convexUrl)
  }, [])

  // Skip Convex if client is not available
  if (!client) {
    return <>{children}</>
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>
}
