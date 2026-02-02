import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()
  },
})

// Get user by ID
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Create new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    authProviderId: v.optional(v.string()),
    authProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (existing) {
      throw new Error("User with this email already exists")
    }

    const now = Date.now()
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      authProviderId: args.authProviderId,
      authProvider: args.authProvider,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      emailVerified: false,
    })
  },
})

// Update user profile
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

// Update last login time
export const updateLastLogin = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastLoginAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

// List all users (admin function)
export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    return await ctx.db.query("users").withIndex("by_created_at").order("desc").take(limit)
  },
})

export const syncProfile = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // First, try to find by clerkUserId
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()

    // If not found by clerkUserId, try by email
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first()
    }

    if (user) {
      // Update existing user
      await ctx.db.patch(user._id, {
        clerkUserId: args.clerkUserId,
        email: args.email,
        name: args.name ?? user.name,
        avatarUrl: args.avatarUrl ?? user.avatarUrl,
        lastLoginAt: now,
        updatedAt: now,
        emailVerified: true,
      })
      return user._id
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        authProvider: "clerk",
        authProviderId: args.clerkUserId,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        isActive: true,
        emailVerified: true,
      })
    }
  },
})

export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()
  },
})

// Update gaze verification status
export const updateGazeVerification = mutation({
  args: {
    clerkUserId: v.string(),
    gazeVerified: v.boolean(),
    gazeTemplateHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const now = Date.now()
    await ctx.db.patch(user._id, {
      gazeVerified: args.gazeVerified,
      gazeVerifiedAt: args.gazeVerified ? now : undefined,
      gazeTemplateHash: args.gazeTemplateHash,
      updatedAt: now,
    })
    return user._id
  },
})

// Update Solana wallet address
export const updateSolanaWallet = mutation({
  args: {
    clerkUserId: v.string(),
    solanaWallet: v.string(),
    jtxBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    await ctx.db.patch(user._id, {
      solanaWallet: args.solanaWallet,
      jtxBalance: args.jtxBalance,
      updatedAt: Date.now(),
    })
    return user._id
  },
})

// Get user by Solana wallet
export const getUserBySolanaWallet = query({
  args: { solanaWallet: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("solanaWallet"), args.solanaWallet))
      .first()
  },
})
