import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Add contact to waitlist
export const addToWaitlist = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists in waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first()

    if (existing) {
      throw new Error("Email already registered in waitlist")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format")
    }

    return await ctx.db.insert("waitlist", {
      email: args.email.toLowerCase(),
      name: args.name,
      source: args.source,
      referrer: args.referrer,
      metadata: args.metadata,
      status: "pending",
      joinedAt: Date.now(),
    })
  },
})

// Get waitlist entry by email
export const getWaitlistByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first()
  },
})

// Update waitlist status
export const updateWaitlistStatus = mutation({
  args: {
    id: v.id("waitlist"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.id)
    if (!entry) {
      throw new Error("Waitlist entry not found")
    }

    const updates: any = { status: args.status }

    if (args.status === "invited" && !entry.invitedAt) {
      updates.invitedAt = Date.now()
    }

    if (args.status === "converted" && !entry.convertedAt) {
      updates.convertedAt = Date.now()
    }

    await ctx.db.patch(args.id, updates)
  },
})

// Get waitlist entries by status
export const getWaitlistByStatus = query({
  args: {
    status: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    return await ctx.db
      .query("waitlist")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .take(limit)
  },
})

// List all waitlist entries
export const listWaitlist = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    return await ctx.db.query("waitlist").withIndex("by_joined_at").order("desc").take(limit)
  },
})

// Get waitlist statistics
export const getWaitlistStats = query({
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("waitlist").collect()

    const stats = {
      total: allEntries.length,
      pending: allEntries.filter((e) => e.status === "pending").length,
      approved: allEntries.filter((e) => e.status === "approved").length,
      invited: allEntries.filter((e) => e.status === "invited").length,
      converted: allEntries.filter((e) => e.status === "converted").length,
    }

    return stats
  },
})

export const add = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists in waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first()

    if (existing) {
      throw new Error("Email already registered in waitlist")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format")
    }

    return await ctx.db.insert("waitlist", {
      email: args.email.toLowerCase(),
      firstName: args.firstName,
      lastName: args.lastName,
      name: `${args.firstName} ${args.lastName}`,
      clerkUserId: args.clerkUserId,
      status: "pending",
      joinedAt: Date.now(),
    })
  },
})
