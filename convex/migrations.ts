import { internalMutation } from "./_generated/server"

// Migration to fix clerkId -> clerkUserId and add missing fields
export const fixUserSchema = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect()
    let fixed = 0

    for (const user of users) {
      const updates: Record<string, unknown> = {}

      // Fix clerkId -> clerkUserId
      if ((user as any).clerkId && !user.clerkUserId) {
        updates.clerkUserId = (user as any).clerkId
      }

      // Fix username -> name
      if ((user as any).username && !user.name) {
        updates.name = (user as any).username
      }

      // Add default values for required fields if missing
      if (user.updatedAt === undefined) {
        updates.updatedAt = user.createdAt || Date.now()
      }

      if (user.isActive === undefined) {
        updates.isActive = true
      }

      if (user.emailVerified === undefined) {
        updates.emailVerified = false
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates)
        fixed++
      }
    }

    return { fixed, total: users.length }
  },
})
