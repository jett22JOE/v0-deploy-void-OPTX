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
  // Check domain - always render ClerkProvider on valid domains
  // On non-production domains (like Vercel preview URLs without proper Clerk config),
  // render children without Clerk to avoid API errors
  const shouldUseClerk = isClerkDomain()

  if (!shouldUseClerk) {
    return <>{children}</>
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/loading"
      appearance={{
        baseTheme: shadesOfPurple,
        variables: {
          colorPrimary: "#b55200",
          colorDanger: "#ff4444",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#18181b",
          colorInputText: "#ffffff",
          borderRadius: "0.5rem",
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: "#b55200",
            "&:hover": {
              backgroundColor: "#8a3f00",
            },
          },
          card: {
            backgroundColor: "rgba(10, 10, 10, 0.95)",
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
