import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_user_article", (q) =>
        q.eq("articleId", args.articleId).eq("userId", identity.subject),
      )
      .collect();
    return highlights;
  },
});

export const create = mutation({
  args: {
    articleId: v.id("articles"),
    text: v.string(),
    startOffset: v.number(),
    endOffset: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const userId = identity.subject;
    const highlightId = await ctx.db.insert("highlights", {
      articleId: args.articleId,
      userId,
      text: args.text,
      startOffset: args.startOffset,
      endOffset: args.endOffset,
    });
    return highlightId;
  },
});

export const remove = mutation({
  args: {
    highlightId: v.id("highlights"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // AuthZ: verify that the highlight belongs to the user
    const highlight = await ctx.db.get(args.highlightId);
    if (!highlight) {
      throw new Error("Highlight not found");
    }
    if (highlight.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.highlightId);
  },
});
