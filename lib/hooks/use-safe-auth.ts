"use client"

import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk as useClerkClerk } from "@clerk/nextjs"
import { useQuery as useConvexQuery } from "convex/react"
import type { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server"

// Safe auth hook that returns null values if Clerk isn't available
export function useSafeAuth() {
  try {
    return useClerkAuth()
  } catch {
    return {
      isSignedIn: false,
      isLoaded: true,
      userId: null,
      sessionId: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      actor: null,
      getToken: async () => null,
      has: () => false,
      signOut: async () => {},
    }
  }
}

// Safe user hook that returns null if Clerk isn't available
export function useSafeUser() {
  try {
    return useClerkUser()
  } catch {
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    }
  }
}

// Safe clerk hook that returns mock functions if Clerk isn't available
export function useSafeClerk() {
  try {
    return useClerkClerk()
  } catch {
    return {
      loaded: true,
      signOut: async () => {},
      openSignIn: () => {},
      openSignUp: () => {},
      openUserProfile: () => {},
      openOrganizationProfile: () => {},
      openCreateOrganization: () => {},
      setActive: async () => {},
      session: null,
      user: null,
      organization: null,
      client: null,
    }
  }
}

// Safe Convex query hook that returns undefined if Convex isn't available
export function useSafeQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query> | "skip"
): FunctionReturnType<Query> | undefined {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConvexQuery(query, args)
  } catch {
    return undefined
  }
}
