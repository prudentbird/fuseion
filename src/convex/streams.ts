import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
