"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { useState } from "react";

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddArticleModal({
  isOpen,
  onClose,
}: AddArticleModalProps) {
  const create = useMutation(api.articles.create);
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simple title extraction or placeholder
      const title = url.split("//")[1]?.split("/")[0] || "Untitled Article";

      await create({
        title,
        url,
        content,
      });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              URL
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Content (Markdown)
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Article Title..."
              rows={8}
              className="w-full resize-none rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-black transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {/* Toggle placeholder */}
              <div className="relative h-4 w-8 rounded-full bg-gray-200">
                <div className="absolute left-0 h-4 w-4 rounded-full bg-gray-400"></div>
              </div>
              <span className="text-sm text-gray-500">Enhance with AI</span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded bg-black px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
