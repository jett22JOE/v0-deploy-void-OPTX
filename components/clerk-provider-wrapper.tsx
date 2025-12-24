"use client"

import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { shadesOfPurple } from "@clerk/themes"

// Check if we're on a valid Clerk domain
// This runs on the server during SSR and client during hydration
function isClerkDomain(): boolean {
  if (typeof window === "undefined") {
    // During SSR, assume production (Clerk handles this gracefully)
    return true
  }
  const hostname = window.location.hostname
  return (
    hostname === "jettoptics.ai" ||
    hostname.endsWith(".jettoptics.ai") ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  )
}

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  // Check domain - but always render ClerkProvider on valid domains
  // The old approach of checking isProductionDomain in useEffect caused timing issues
  // where Clerk wasn't initialized when the Waitlist component tried to submit
  const shouldUseClerk = isClerkDomain()

  // On non-production domains (like Vercel preview URLs without proper Clerk config),
  // render children without Clerk to avoid API errors
  if (!shouldUseClerk) {
    return <>{children}</>
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        baseTheme: shadesOfPurple,
        variables: {
          // Override the yellow accent with your orange
          colorPrimary: "#b55200",
          colorDanger: "#ff4444",
        },
        elements: {
          // Ensure form elements work properly
          formButtonPrimary: {
            backgroundColor: "#b55200",
            "&:hover": {
              backgroundColor: "#8a3f00",
            },
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
