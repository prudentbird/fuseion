import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema(
  {
    streams: defineTable({
      id: v.string(),
      threadId: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_thread", ["threadId"])
      .index("by_external_id", ["id"]),
    threads: defineTable({
      id: v.string(),
      title: v.string(),
      model: v.string(),
      status: v.string(),
      pinned: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
      userId: v.string(),
    })
      .index("by_user", ["userId"])
      .index("by_external_id", ["id"]),
    messages: defineTable({
      id: v.string(),
      role: v.string(),
      parts: v.string(),
      metadata: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      threadId: v.string(),
      userId: v.optional(v.string()),
    })
      .index("by_thread", ["threadId"])
      .index("by_external_id", ["id"])
      .index("by_user", ["userId"]),

    users: defineTable({
      userId: v.string(),
      tier: v.union(v.literal("free"), v.literal("pro")),
      name: v.string(),
      email: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      picture: v.optional(v.string()),
      credits: v.optional(v.number()),
      preferences: v.optional(
        v.object({
          name: v.optional(v.string()),
          occupation: v.optional(v.string()),
          additionalInfo: v.optional(v.string()),
          traits: v.optional(v.array(v.string())),
        }),
      ),
    })
      .index("by_email", ["email"])
      .index("by_external_id", ["userId"]),
  },
  {
    schemaValidation: true,
  },
);
