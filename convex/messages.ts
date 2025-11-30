import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // AuthZ: only allow messages for the current user for the articleId
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_article", (q) =>
        q.eq("articleId", args.articleId).eq("userId", identity.subject),
      )
      .order("asc")
      .collect();
    return messages;
  },
});

export const send = mutation({
  args: {
    articleId: v.id("articles"),
    content: v.string(),
    role: v.string(), // "user" | "ai"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const userId = identity.subject;

    await ctx.db.insert("messages", {
      userId,
      articleId: args.articleId,
      content: args.content,
      role: args.role,
      createdAt: Date.now(),
    });
  },
});
