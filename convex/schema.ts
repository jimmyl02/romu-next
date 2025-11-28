import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    userId: v.string(),
    title: v.string(),
    url: v.string(),
    content: v.string(), // Markdown content
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_created", ["userId", "createdAt"]),
});
