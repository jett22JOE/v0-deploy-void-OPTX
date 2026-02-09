"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"

/**
 * SSO Callback Page - Handles OAuth redirects from social providers
 *
 * HEDGEHOG MCP Analysis:
 * - X/Twitter OAuth uses OAuth 2.0 PKCE flow
 * - State parameter must be validated to prevent CSRF
 * - Clerk's AuthenticateWithRedirectCallback handles token exchange
 *
 * Fix for infinite loop:
 * - Remove manual redirect logic that competes with Clerk
 * - Let AuthenticateWithRedirectCallback handle all redirects
 * - Only manually handle error states
 */
export default function SSOCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const [error] = useState<string | null>(errorDescription || errorParam || null)

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="font-mono text-lg text-white mb-2">Authentication Error</h2>
          <p className="font-mono text-sm text-red-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/optx-login")}
            className="px-6 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white font-mono text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Use Clerk's built-in callback handler for proper OAuth flow completion
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Clerk's AuthenticateWithRedirectCallback handles the OAuth token exchange */}
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dojo"
        signUpForceRedirectUrl="/dojo"
        signInFallbackRedirectUrl="/loading"
        signUpFallbackRedirectUrl="/loading"
      />
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4" />
        <p className="font-mono text-sm text-white/60">
          Completing authentication...
        </p>
        <p className="font-mono text-xs text-white/40 mt-2">
          Processing OAuth callback
        </p>
      </div>
    </div>
  )
}
