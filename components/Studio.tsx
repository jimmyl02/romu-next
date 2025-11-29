"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { clsx } from "clsx";
import { useMutation, useQuery } from "convex/react";
import { FileText, MessageSquare, Send, X } from "lucide-react";
import { useEffect, useState } from "react";

interface StudioProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: Id<"articles">;
}

export default function Studio({ isOpen, onClose, articleId }: StudioProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes");
  const [chatInput, setChatInput] = useState("");

  // Notes
  const note = useQuery(api.notes.get, { articleId });
  const updateNote = useMutation(api.notes.update);
  const [localNoteContent, setLocalNoteContent] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Sync local note content with DB content ONLY when it first loads
  useEffect(() => {
    if (note && !hasLoaded) {
      setLocalNoteContent(note.content);
      setHasLoaded(true);
    }
  }, [note, hasLoaded]);

  // Debounced save
  useEffect(() => {
    if (!hasLoaded) return;

    const timer = setTimeout(() => {
      updateNote({ articleId, content: localNoteContent });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [localNoteContent, updateNote, articleId, hasLoaded]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNoteContent(e.target.value);
  };

  // Chat
  const messages = useQuery(api.messages.list, { articleId });
  const sendMessage = useMutation(api.messages.send);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    await sendMessage({
      articleId,
      content: chatInput,
      role: "user",
    });
    setChatInput("");

    // Mock AI response for now, but stored in DB
    setTimeout(() => {
      sendMessage({
        articleId,
        content:
          "That's an interesting point! This article discusses causal trees in depth...",
        role: "ai",
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      className={clsx(
        "fixed inset-y-0 right-0 z-40 flex flex-col border-l border-gray-200 bg-white shadow-2xl transition-all duration-300",
        "w-full md:w-[400px] lg:w-[500px]", // Full width on mobile, fixed width on desktop
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab("notes")}
            className={clsx(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === "notes"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black",
            )}
          >
            <FileText className="h-4 w-4" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={clsx(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === "chat"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black",
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeTab === "notes" ? (
          <textarea
            value={localNoteContent}
            onChange={handleNoteChange}
            placeholder="Write your notes here..."
            className="w-full flex-1 resize-none bg-transparent p-6 font-serif leading-relaxed text-black placeholder:text-gray-400 focus:outline-none"
          />
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages?.map((msg, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {messages?.length === 0 && (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              )}
            </div>
            <form
              onSubmit={handleSendMessage}
              className="border-t border-gray-200 p-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full rounded-full bg-gray-100 py-3 pr-12 pl-4 text-black placeholder:text-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black p-2 text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
