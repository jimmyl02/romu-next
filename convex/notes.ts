import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const userId = identity.subject;
    const note = await ctx.db
      .query("notes")
      .withIndex("by_user_article", (q) =>
        q.eq("userId", userId).eq("articleId", args.articleId),
      )
      .unique();
    return note;
  },
});

export const update = mutation({
  args: {
    articleId: v.id("articles"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const userId = identity.subject;
    const note = await ctx.db
      .query("notes")
      .withIndex("by_user_article", (q) =>
        q.eq("userId", userId).eq("articleId", args.articleId),
      )
      .unique();

    if (note) {
      await ctx.db.patch(note._id, { content: args.content });
    } else {
      await ctx.db.insert("notes", {
        userId,
        articleId: args.articleId,
        content: args.content,
      });
    }
  },
});
