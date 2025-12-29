"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth, useClerk } from "@clerk/nextjs"
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"

/**
 * SSO Callback Page - Handles OAuth redirects from social providers
 *
 * HEDGEHOG MCP Analysis:
 * - X/Twitter OAuth uses OAuth 2.0 PKCE flow
 * - State parameter must be validated to prevent CSRF
 * - Clerk's AuthenticateWithRedirectCallback handles token exchange
 *
 * Root cause of infinite loop:
 * 1. Missing AuthenticateWithRedirectCallback component
 * 2. Manual redirect logic interfering with Clerk's OAuth flow
 * 3. State parameter not being consumed properly
 */
export default function SSOCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoaded, isSignedIn } = useAuth()
  const { handleRedirectCallback } = useClerk()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Check for OAuth error in URL params
    const errorParam = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    if (errorParam) {
      setError(errorDescription || errorParam)
      setIsProcessing(false)
      return
    }

    // Let Clerk handle the callback automatically via AuthenticateWithRedirectCallback
    // Only redirect after Clerk has finished processing
    const timeout = setTimeout(() => {
      if (isLoaded) {
        if (isSignedIn) {
          router.push("/?joined=true")
        } else {
          // Give more time for Clerk to process the callback
          setTimeout(() => {
            if (!isSignedIn) {
              router.push("/loading")
            }
          }, 2000)
        }
        setIsProcessing(false)
      }
    }, 1500)

    return () => clearTimeout(timeout)
  }, [isLoaded, isSignedIn, router, searchParams])

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
            onClick={() => router.push("/loading")}
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
        signInForceRedirectUrl="/?joined=true"
        signUpForceRedirectUrl="/?joined=true"
        signInFallbackRedirectUrl="/loading"
        signUpFallbackRedirectUrl="/loading"
      />
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4" />
        <p className="font-mono text-sm text-white/60">
          {isProcessing ? "Completing authentication..." : "Redirecting..."}
        </p>
        <p className="font-mono text-xs text-white/40 mt-2">
          Processing OAuth callback
        </p>
      </div>
    </div>
  )
}
