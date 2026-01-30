"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Redirect old sign-in page to new /optx-login page
export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/optx-login")
  }, [router])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-4" />
        <p className="font-mono text-sm text-white/60">Redirecting...</p>
      </div>
    </div>
  )
}
