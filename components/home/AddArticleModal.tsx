"use client";

import { FileText, Link as LinkIcon, X } from "lucide-react";
import { useState } from "react";

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddArticleModal({
  isOpen,
  onClose,
}: AddArticleModalProps) {
  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: activeTab === "url" ? url : undefined,
          content: activeTab === "text" ? content : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save article");
      }

      onClose();
      setUrl("");
      setContent("");
    } catch (error) {
      console.error("Failed to save article:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Article
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === "url"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            URL
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === "text"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            Text Content
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "url" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Article URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-black transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Content
              </label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste article content here..."
                rows={8}
                className="w-full resize-none rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-black transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>
          )}

          <div className="rounded bg-gray-50 p-3 text-xs text-gray-500">
            Note: All article content will be automatically formatted and
            enhanced using AI.
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded bg-black px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Save Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
