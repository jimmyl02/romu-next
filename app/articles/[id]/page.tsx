"use client";

import Studio from "@/components/Studio";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { clsx } from "clsx";
import { useQuery } from "convex/react";
import { ArrowLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

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
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#FDFBF7]/90 backdrop-blur border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold truncate max-w-md text-gray-900">{article.title}</h1>
        </div>
        <button
          onClick={() => setIsStudioOpen(!isStudioOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
        >
          {isStudioOpen ? (
            <>
              <PanelRightClose className="w-4 h-4" />
              Hide Studio
            </>
          ) : (
            <>
              <PanelRightOpen className="w-4 h-4" />
              Open Studio
            </>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 relative">
        <main
          className={clsx(
            "flex-1 transition-all duration-300 ease-in-out mx-auto",
            isStudioOpen ? "mr-0 md:mr-[400px] lg:mr-[500px]" : "mr-0"
          )}
        >
          <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 leading-tight text-gray-900">{article.title}</h1>
              <div className="text-gray-500 text-sm">
                {new URL(article.url).hostname}
              </div>
            </div>
            
            <article className="prose prose-lg max-w-none prose-p:leading-relaxed prose-a:text-blue-600 prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </article>
          </div>
        </main>

        {/* Studio Sidebar */}
        <Studio isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />
      </div>
    </div>
  );
}
