import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

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

export const listThreadsPaginated = query({
  args: {
    userId: v.string(),
    term: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const base = args.term
      ? ctx.db
          .query("threads")
          .withSearchIndex("search_title", (q) =>
            q.search("title", args.term as string).eq("userId", args.userId),
          )
      : ctx.db
          .query("threads")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .order("desc");

    return await base
      .filter((q) => q.neq(q.field("status"), "deleted"))
      .paginate(args.paginationOpts);
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
      ...(typeof args.title !== "undefined" ? { title: args.title } : {}),
      ...(typeof args.model !== "undefined" ? { model: args.model } : {}),
      ...(typeof args.status !== "undefined" ? { status: args.status } : {}),
      ...(typeof args.pinned !== "undefined" ? { pinned: args.pinned } : {}),
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
      ...(typeof args.title !== "undefined" ? { title: args.title } : {}),
      ...(typeof args.model !== "undefined" ? { model: args.model } : {}),
      ...(typeof args.status !== "undefined" ? { status: args.status } : {}),
      ...(typeof args.pinned !== "undefined" ? { pinned: args.pinned } : {}),
      updatedAt: Date.now(),
    });
  },
});
