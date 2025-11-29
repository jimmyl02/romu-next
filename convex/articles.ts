import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return articles;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    content: v.string(),
    description: v.optional(v.string()),
    authors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const userId = identity.subject;
    const articleId = await ctx.db.insert("articles", {
      userId,
      title: args.title,
      url: args.url,
      content: args.content,
      description: args.description,
      authors: args.authors,
      createdAt: Date.now(),
    });
    return articleId;
  },
});

export const get = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const article = await ctx.db.get(args.id);
    if (!article) return null;

    // Simple authorization check
    if (article.userId !== identity.subject) {
      return null;
    }

    return article;
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const article = await ctx.db.get(args.id);
    if (!article) {
      throw new Error("Article not found");
    }
    if (article.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.id, { content: args.content });
  },
});
