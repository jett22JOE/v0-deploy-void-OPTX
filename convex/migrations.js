import { v } from "convex/values"
import { migration } from "convex/server"

export const fixClerkIds = migration({
  up: async (ctx) => {
    const users = await ctx.db.query("users").collect()
    for (const user of users) {
      if (user.clerkId && !user.clerkUserId) {
        await ctx.db.patch(user._id, { 
          clerkUserId: user.clerkId 
        })
        console.log(`Migrated user ${user._id}: ${user.clerkId} → clerkUserId`)
      }
    }
    console.log('Migration complete')
  },
})