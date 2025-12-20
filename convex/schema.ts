import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // User profiles table for account management
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    // Auth provider info (for future Clerk integration)
    authProviderId: v.optional(v.string()),
    authProvider: v.optional(v.string()), // "clerk", "google", etc.
    // Profile data
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    // Status
    isActive: v.boolean(),
    emailVerified: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_auth_provider", ["authProviderId"])
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_created_at", ["createdAt"]),

  waitlist: defineTable({
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    name: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    // Source tracking
    source: v.optional(v.string()), // "homepage", "footer", etc.
    referrer: v.optional(v.string()),
    // Status management
    status: v.string(), // "pending", "approved", "invited", "converted"
    // Timestamps
    joinedAt: v.number(),
    invitedAt: v.optional(v.number()),
    convertedAt: v.optional(v.number()),
    // Additional data
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()), // Flexible field for additional data
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_joined_at", ["joinedAt"])
    .index("by_clerk_user", ["clerkUserId"]),
})
