import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createThread = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    model: v.string(),
    status: v.string(),
    pinned: v.boolean(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const threadId = await ctx.db.insert('threads', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return threadId;
  },
});

export const listThreads = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('threads')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
  },
});
