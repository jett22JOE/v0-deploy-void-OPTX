"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSafeAuth } from "@/lib/hooks/use-safe-auth"

// Catch-all route for Clerk verification callbacks
// Handles: /optx-login/verify, /optx-login/factor-one, etc.
export default function OptxLoginCatchAll() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useSafeAuth()

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // User is verified — redirect to DOJO
        const afterSignIn = searchParams.get("after_sign_in_url") || searchParams.get("sign_in_force_redirect_url")
        if (afterSignIn) {
          try {
            const url = new URL(afterSignIn)
            router.push(url.pathname)
          } catch {
            router.push("/dojo")
          }
        } else {
          router.push("/dojo")
        }
      } else {
        // Not signed in — redirect back to login
        router.push("/optx-login")
      }
    }
  }, [isSignedIn, isLoaded, router, searchParams])

  // Fallback after 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/optx-login")
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
        <p className="font-mono text-xs text-zinc-500">Verifying...</p>
      </div>
    </div>
  )
}
