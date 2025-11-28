"use client";

import ArticleRenderer from "@/components/ArticleRenderer";
import Studio from "@/components/Studio";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { clsx } from "clsx";
import { useQuery } from "convex/react";
import { ArrowLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as Id<"articles">;
  const article = useQuery(api.articles.get, { id });
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (article === undefined) {
    return <div className="p-8 text-gray-500">Loading article...</div>;
  }

  if (article === null) {
    return <div className="p-8 text-gray-500">Article not found.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-[#FDFBF7]/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-500 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="max-w-md truncate text-lg font-bold text-gray-900">
            {article.title}
          </h1>
        </div>
        <button
          onClick={() => setIsStudioOpen(!isStudioOpen)}
          className="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          {isStudioOpen ? (
            <>
              <PanelRightClose className="h-4 w-4" />
              Hide Studio
            </>
          ) : (
            <>
              <PanelRightOpen className="h-4 w-4" />
              Open Studio
            </>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="relative flex flex-1">
        <main
          className={clsx(
            "mx-auto flex-1 transition-all duration-300 ease-in-out",
            isStudioOpen ? "mr-0 md:mr-[400px] lg:mr-[500px]" : "mr-0",
          )}
        >
          <div className="mx-auto max-w-3xl px-6 py-12">
            <div className="mb-8">
              <h1 className="mb-2 text-4xl leading-tight font-bold text-gray-900">
                {article.title}
              </h1>
              <div className="text-sm text-gray-500">
                {new URL(article.url).hostname}
              </div>
            </div>

            <ArticleRenderer content={article.content} />
          </div>
        </main>

        {/* Studio Sidebar */}
        <Studio isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />
      </div>
    </div>
  );
}
