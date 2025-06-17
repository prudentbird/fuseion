import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const createUser = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    email: v.string(),
    picture: v.optional(v.string()),
    tier: v.union(v.literal('free'), v.literal('pro')),
    preferences: v.optional(
      v.object({
        name: v.optional(v.string()),
        occupation: v.optional(v.string()),
        additionalInfo: v.optional(v.string()),
        traits: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('users', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
