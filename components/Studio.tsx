"use client";

import { clsx } from "clsx";
import { FileText, MessageSquare, Send, X } from "lucide-react";
import { useState } from "react";

interface StudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Studio({ isOpen, onClose }: StudioProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes");
  const [noteContent, setNoteContent] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([
    {
      role: "ai",
      content:
        "Hello! I'm your AI research assistant. Ask me anything about this article.",
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessages = [
      ...chatMessages,
      { role: "user" as const, content: chatInput },
    ];
    setChatMessages(newMessages);
    setChatInput("");

    // Mock AI response
    setTimeout(() => {
      setChatMessages([
        ...newMessages,
        {
          role: "ai",
          content:
            "That's an interesting point! This article discusses causal trees in depth...",
        },
      ]);
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
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your notes here..."
            className="w-full flex-1 resize-none bg-transparent p-6 font-serif leading-relaxed text-black placeholder:text-gray-400 focus:outline-none"
          />
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {chatMessages.map((msg, idx) => (
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
