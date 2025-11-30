import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // AuthZ: ensure that the user has access to the article
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    if (article.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const annotations = await ctx.db
      .query("annotations")
      .withIndex("by_user_article", (q) =>
        q.eq("articleId", args.articleId).eq("userId", identity.subject),
      )
      .collect();
    return annotations;
  },
});

export const create = mutation({
  args: {
    articleId: v.id("articles"),
    text: v.string(),
    comment: v.string(),
    startOffset: v.number(),
    endOffset: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // AuthZ: ensure that the user has access to the article
    const userId = identity.subject;
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    if (userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const annotationId = await ctx.db.insert("annotations", {
      articleId: args.articleId,
      userId,
      text: args.text,
      comment: args.comment,
      startOffset: args.startOffset,
      endOffset: args.endOffset,
    });
    return annotationId;
  },
});

export const update = mutation({
  args: {
    annotationId: v.id("annotations"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // AuthZ: verify that the annotation belongs to the user
    const annotation = await ctx.db.get(args.annotationId);
    if (!annotation) {
      throw new Error("Annotation not found");
    }
    if (annotation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.annotationId, { comment: args.comment });
  },
});

export const remove = mutation({
  args: {
    annotationId: v.id("annotations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // AuthZ: verify that the annotation belongs to the user
    const annotation = await ctx.db.get(args.annotationId);
    if (!annotation) {
      throw new Error("Annotation not found");
    }
    if (annotation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.annotationId);
  },
});
