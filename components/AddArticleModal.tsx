"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { useState } from "react";

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddArticleModal({ isOpen, onClose }: AddArticleModalProps) {
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
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add New Article</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full rounded bg-gray-50 border border-gray-200 px-3 py-2 text-black focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Content (Markdown)
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Article Title..."
              rows={8}
              className="w-full rounded bg-gray-50 border border-gray-200 px-3 py-2 text-black focus:outline-none focus:border-gray-400 transition-colors resize-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
               {/* Toggle placeholder */}
               <div className="w-8 h-4 bg-gray-200 rounded-full relative">
                  <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-0"></div>
               </div>
               <span className="text-sm text-gray-500">Enhance with AI</span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
