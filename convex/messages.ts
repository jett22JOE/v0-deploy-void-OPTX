import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// List all channels
export const listChannels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("channels").collect()
  },
})

// List messages in a channel
export const listMessages = query({
  args: {
    channelId: v.id("channels"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .take(limit)
  },
})

// Send a message to a channel
export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    clerkUserId: v.string(),
    displayName: v.string(),
    content: v.string(),
    tensor: v.optional(v.string()),
    emoji: v.optional(v.string()),
    messageType: v.string(), // "chat" | "attestation" | "system" | "joe"
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      clerkUserId: args.clerkUserId,
      displayName: args.displayName,
      content: args.content,
      tensor: args.tensor,
      emoji: args.emoji,
      messageType: args.messageType,
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
    })
  },
})

// Create a channel (returns existing if name matches)
export const createChannel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if channel with same name exists
    const existing = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first()

    if (existing) {
      return existing._id
    }

    return await ctx.db.insert("channels", {
      name: args.name,
      description: args.description,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      isDefault: false,
    })
  },
})

// Seed default channels (idempotent)
export const seedChannels = mutation({
  args: {},
  handler: async (ctx) => {
    const defaults = [
      { name: "general", description: "General discussion" },
      { name: "dojo-training", description: "DOJO training sessions & AGT data" },
      { name: "augments", description: "Research & augment discussion" },
    ]

    const channelIds = []

    for (const ch of defaults) {
      const existing = await ctx.db
        .query("channels")
        .withIndex("by_name", (q) => q.eq("name", ch.name))
        .first()

      if (existing) {
        channelIds.push(existing._id)
      } else {
        const id = await ctx.db.insert("channels", {
          name: ch.name,
          description: ch.description,
          createdBy: "system",
          createdAt: Date.now(),
          isDefault: true,
        })
        channelIds.push(id)
      }
    }

    return channelIds
  },
})
