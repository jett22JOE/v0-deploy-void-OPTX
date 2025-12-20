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
