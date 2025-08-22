import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const createStream = mutation({
  args: {
    id: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("streams", {
      id: args.id,
      threadId: args.threadId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listStreamsByThreadId = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("streams")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
  },
});

export const clearOldStreams = internalMutation({
  handler: async (ctx) => {
    const streams = await ctx.db.query("streams").collect();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - oneDayMs;
    for (const stream of streams) {
      if (stream.createdAt < cutoff) {
        await ctx.db.delete(stream._id);
      }
    }
  },
});
