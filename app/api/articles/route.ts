import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { z } from "zod";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const articleSchema = z.object({
  title: z.string().describe("The title of the article"),
  description: z
    .string()
    .describe("A short summary or description of the article"),
  authors: z.array(z.string()).describe("List of authors of the article"),
  content: z.string().describe("The formatted markdown content of the article"),
});

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

    const { url, content } = await req.json();

    if (!url && !content) {
      return new NextResponse("Missing url or content", { status: 400 });
    }

    let textToProcess = content;

    if (url) {
      try {
        const response = await fetch(url);
        textToProcess = await response.text();
      } catch (error) {
        if (textToProcess === undefined || textToProcess === "") {
          console.error("Failed to fetch URL:", error);
          return new NextResponse("Failed to fetch URL", { status: 400 });
        }
      }
    }

    const prompt = `
      You are an expert editor and formatter.
      Process the following content into a beautiful, readable markdown article.
      
      Rules:
      1. Keep the core content and information accurate to the source.
      2. Be opinionated about formatting: use proper headers, lists, and emphasis to make it readable.
      3. Remove any web artifacts (ads, navigation links, "read more", etc.) if the source was a webpage.
      4. Return the result as a JSON object with title, description, authors, and markdown content.
      5. Attempt to preserve image links where if the URL is a relative path, convert it to an absolute path using the base domain
      
      Metadata:
      URL: ${url}

      Content to process:
      ${textToProcess.slice(0, 100000)} // Limit input size to avoid token limits if necessary, though Gemini has a large context window.
    `;

    const result = await generateObject({
      model: "google/gemini-2.5-flash-lite",
      schema: articleSchema,
      prompt,
    });

    // const result = {
    //   object: {
    //     title: "Sample Article Title",
    //     description: "This is a sample description for the article.",
    //     authors: ["John Doe", "Jane Smith"],
    //     content:
    //       "## Sample Markdown Content\n\nThis is the **body** of the article.\n\n- Item 1\n- Item 2",
    //   },
    // };

    const {
      title,
      description,
      authors,
      content: formattedContent,
    } = result.object;

    await convex.mutation(api.articles.create, {
      title,
      url: url || "",
      content: formattedContent,
      description,
      authors,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating article:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
