import { v } from "convex/values"

import { mutation, query } from "./_generated/server"

export const getUserDevStatus = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()
    if (!user) return null

    const hasStripeSub =
      !!user.stripeSubscriptionId && user.stripeStatus === "active"

    return {
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripeStatus: user.stripeStatus,
      okxWallet: user.okxWallet,
      gazeVerified: user.gazeVerified,
      devAccessGranted: user.devAccessGranted,
      isComplete: !!user.okxWallet && hasStripeSub && user.gazeVerified,
    }
  },
})

export const updateStripeSubscription = mutation({
  args: {
    clerkUserId: v.string(),
    customerId: v.optional(v.string()),
    subscriptionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()
    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      stripeCustomerId: args.customerId,
      stripeSubscriptionId: args.subscriptionId,
      stripeStatus: args.status,
    })
  },
})

export const updateOkxWallet = mutation({
  args: { clerkUserId: v.string(), wallet: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()
    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      okxWallet: args.wallet,
    })
  },
})

export const setGazeVerified = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()
    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      gazeVerified: true,
    })
  },
})

export const grantDevAccess = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()
    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      devAccessGranted: true,
    })
  },
})
