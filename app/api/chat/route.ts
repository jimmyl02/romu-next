import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

// MODEL_MAP is the available models in the registry
const MODEL_MAP = {
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gemini-2.5-flash": "google/gemini-2.5-flash-lite-preview-09-2025",
};

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = await getToken({ template: "convex" });
    if (token) {
      convex.setAuth(token);
    }

    const { messages, articleId, model } = await req.json();

    if (!articleId) {
      return new NextResponse("Missing articleId", { status: 400 });
    }

    // Fetch article context
    const article = await convex.query(api.articles.get, { id: articleId });
    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    // Get the model name from the model registry
    if (!(model in MODEL_MAP)) {
      return new NextResponse("Model not found", { status: 400 });
    }
    const selectedModel = MODEL_MAP[model as keyof typeof MODEL_MAP];

    const systemPrompt = `
      You are a helpful AI assistant helping the user understand an article.
      
      Article Title: ${article.title}
      Article Content:
      ${article.content.slice(0, 50000)} // Limit context if needed
      
      Answer the user's questions based on the article content.
      Be concise and helpful.
    `;

    const result = await streamText({
      model: selectedModel,
      messages: convertToModelMessages(messages),
      system: systemPrompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
