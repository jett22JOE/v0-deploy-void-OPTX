"use client"

import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useRef } from "react"

interface ClerkConvexSyncProps {
  onSyncComplete?: () => void
}

export function ClerkConvexSync({ onSyncComplete }: ClerkConvexSyncProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const syncProfile = useMutation(api.users.syncProfile)
  const addToWaitlist = useMutation(api.waitlist.add)
  const hasSynced = useRef(false)

  useEffect(() => {
    async function syncUserToConvex() {
      if (!isLoaded || !isSignedIn || !user || hasSynced.current) return

      try {
        const email = user.primaryEmailAddress?.emailAddress
        const firstName = user.firstName || ""
        const lastName = user.lastName || ""
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || email?.split("@")[0]

        if (!email) return

        // Sync to users table
        await syncProfile({
          clerkUserId: user.id,
          email,
          name: fullName,
          avatarUrl: user.imageUrl,
        })

        // Add to waitlist table
        try {
          await addToWaitlist({
            email,
            firstName,
            lastName,
            clerkUserId: user.id,
          })
        } catch (err) {
          // User might already be in waitlist, that's okay
          console.log("Waitlist entry may already exist:", err)
        }

        hasSynced.current = true
        onSyncComplete?.()
      } catch (error) {
        console.error("Failed to sync user to Convex:", error)
      }
    }

    syncUserToConvex()
  }, [isLoaded, isSignedIn, user, syncProfile, addToWaitlist, onSyncComplete])

  return null
}
