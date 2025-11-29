"use client";

import ArticleRenderer from "@/components/ArticleRenderer";
import LiveEditor from "@/components/LiveEditor";
import Studio from "@/components/Studio";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { clsx } from "clsx";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Edit,
  Eye,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as Id<"articles">;
  const article = useQuery(api.articles.get, { id });
  const updateArticle = useMutation(api.articles.update);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (article === undefined) {
    return <div className="p-8 text-gray-500">Loading article...</div>;
  }

  if (article === null) {
    return <div className="p-8 text-gray-500">Article not found.</div>;
  }

  const handleSave = async (newContent: string) => {
    await updateArticle({ id, content: newContent });
  };

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
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              {isEditing ? (
                <>
                  <Edit className="h-4 w-4" />
                  Editing
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Viewing
                </>
              )}
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full right-0 z-50 mt-1 w-40 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsDropdownOpen(false);
                    }}
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50",
                      isEditing && "bg-gray-50 text-blue-600",
                    )}
                  >
                    <Edit className="h-4 w-4" />
                    Editing
                    {isEditing && <Check className="ml-auto h-3 w-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsDropdownOpen(false);
                    }}
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50",
                      !isEditing && "bg-gray-50 text-blue-600",
                    )}
                  >
                    <Eye className="h-4 w-4" />
                    Viewing
                    {!isEditing && <Check className="ml-auto h-3 w-3" />}
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setIsStudioOpen(!isStudioOpen)}
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
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
        </div>
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

            {isEditing ? (
              <LiveEditor
                initialContent={article.content}
                onSave={handleSave}
                isEditingMode={true}
              />
            ) : (
              <ArticleRenderer content={article.content} />
            )}
          </div>
        </main>

        {/* Studio Sidebar */}
        {/* Studio Sidebar */}
        <Studio
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          articleId={id}
        />
      </div>
    </div>
  );
}
