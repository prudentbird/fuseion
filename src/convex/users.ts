import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const createUser = mutation({
  args: {
    userId: v.string(),
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
    const existing = await ctx.db
      .query('users')
      .withIndex('by_external_id', (q) => q.eq('userId', args.userId))
      .unique();

    if (existing) {
      return existing;
    }

    const now = Date.now();
    const user = await ctx.db.insert('users', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(user);
  },
});

export const upSertUser = mutation({
  args: {
    userId: v.string(),
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
    const existing = await ctx.db
      .query('users')
      .withIndex('by_external_id', (q) => q.eq('userId', args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return await ctx.db.get(existing._id);
    }

    const now = Date.now();
    const user = await ctx.db.insert('users', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(user);
  },
});
