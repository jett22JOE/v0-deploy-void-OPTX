import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get or create the astrojoe channel (public or dev)
export const getOrCreateChannel = mutation({
  args: {
    channelName: v.union(v.literal("astrojoe"), v.literal("astrojoe-dev")),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", args.channelName))
      .first()

    if (existing) {
      return existing._id
    }

    return await ctx.db.insert("channels", {
      name: args.channelName,
      description:
        args.channelName === "astrojoe"
          ? "AstroJOE public chat"
          : "AstroJOE dev terminal",
      createdBy: args.createdBy,
      createdAt: Date.now(),
      isDefault: false,
    })
  },
})

// List messages for an astrojoe channel
export const listMessages = query({
  args: {
    channelId: v.id("channels"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .take(limit)
  },
})

// Find channel by name (query — no mutation needed for reads)
export const getChannelByName = query({
  args: {
    channelName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", args.channelName))
      .first()
  },
})

// Send a message to the astrojoe channel
export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    clerkUserId: v.string(),
    displayName: v.string(),
    content: v.string(),
    messageType: v.string(), // "chat" | "joe" | "system" | "dev"
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // JOE and system messages bypass auth check
    if (args.messageType !== "joe" && args.messageType !== "system") {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        throw new Error("Unauthorized: not authenticated")
      }
    }

    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      clerkUserId: args.clerkUserId,
      displayName: args.displayName,
      content: args.content,
      messageType: args.messageType,
      createdAt: Date.now(),
      avatarUrl: args.avatarUrl,
    })
  },
})
