"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

export default function SSOCallbackPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // User successfully signed in via SSO
        router.push("/?joined=true")
      } else {
        // SSO failed, redirect to sign-in
        router.push("/sign-in")
      }
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4" />
        <p className="font-mono text-sm text-white/60">Completing sign-in...</p>
      </div>
    </div>
  )
}
