import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    // In a real app, you might want to filter messages by user if they are private,
    // or allow all users to see chat if it's a shared article.
    // For now, let's assume messages are private to the user-article context
    // OR we can just filter by articleId if it's a shared chat.
    // Based on the prompt "saving messages from the change which will be hooked up later",
    // and "writing a note per article", let's assume this is a personal studio for now.

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
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
