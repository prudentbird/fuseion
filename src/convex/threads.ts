import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

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
    const threadId = await ctx.db.insert("threads", {
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
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getThreadByUserIdAndThreadId = query({
  args: {
    userId: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("id"), args.threadId))
      .unique();
  },
});

export const internalUpdateThreadWithExternalId = internalMutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    status: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_external_id", (q) => q.eq("id", args.id))
      .unique();
    if (!thread) {
      return null;
    }
    return await ctx.db.patch(thread._id, {
      ...(args.title && { title: args.title }),
      ...(args.model && { model: args.model }),
      ...(args.status && { status: args.status }),
      ...(args.pinned && { pinned: args.pinned }),
      updatedAt: Date.now(),
    });
  },
});

export const updateThreadWithExternalId = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    status: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_external_id", (q) => q.eq("id", args.id))
      .unique();
    if (!thread) {
      return null;
    }
    return await ctx.db.patch(thread._id, {
      ...(args.title && { title: args.title }),
      ...(args.model && { model: args.model }),
      ...(args.status && { status: args.status }),
      ...(args.pinned && { pinned: args.pinned }),
      updatedAt: Date.now(),
    });
  },
});
