import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    userId: v.string(),
    title: v.string(),
    url: v.string(),
    content: v.string(), // Markdown content
    description: v.optional(v.string()),
    authors: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    username: v.optional(v.string()),
    email: v.string(),
    image: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  notes: defineTable({
    userId: v.string(),
    articleId: v.id("articles"),
    content: v.string(),
  }).index("by_user_article", ["userId", "articleId"]),

  messages: defineTable({
    userId: v.string(),
    articleId: v.id("articles"),
    role: v.string(), // "user" | "ai"
    content: v.string(),
    createdAt: v.number(),
  }).index("by_article", ["articleId", "userId", "createdAt"]),

  highlights: defineTable({
    articleId: v.id("articles"),
    userId: v.string(),
    text: v.string(),
    startOffset: v.number(),
    endOffset: v.number(),
  }).index("by_user_article", ["articleId", "userId"]),
});
