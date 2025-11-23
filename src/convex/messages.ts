import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const addMessage = mutation({
  args: {
    id: v.string(),
    role: v.string(),
    parts: v.string(),
    threadId: v.string(),
    metadata: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("messages", {
      id: args.id,
      role: args.role,
      parts: args.parts,
      userId: args.userId,
      threadId: args.threadId,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertMessage = mutation({
  args: {
    id: v.string(),
    role: v.string(),
    parts: v.string(),
    threadId: v.string(),
    metadata: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("messages")
      .withIndex("by_external_id", (q) => q.eq("id", args.id))
      .unique();

    const now = Date.now();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        role: args.role,
        parts: args.parts,
        userId: args.userId,
        threadId: args.threadId,
        metadata: args.metadata,
        updatedAt: now,
      });
    }

    return await ctx.db.insert("messages", {
      id: args.id,
      role: args.role,
      parts: args.parts,
      userId: args.userId,
      threadId: args.threadId,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .take(100);
  },
});

export const getMessageCountByUserId = query({
  args: {
    userId: v.string(),
    differenceInHours: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const threshold = now - args.differenceInHours * 60 * 60 * 1000;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("createdAt"), threshold))
      .collect();

    return messages.length;
  },
});
