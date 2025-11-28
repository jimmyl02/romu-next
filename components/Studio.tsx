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
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hello! I'm your AI research assistant. Ask me anything about this article." },
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
        { role: "ai", content: "That's an interesting point! This article discusses causal trees in depth..." },
      ]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className={clsx(
      "fixed inset-y-0 right-0 z-40 bg-white border-l border-gray-200 flex flex-col transition-all duration-300 shadow-2xl",
      "w-full md:w-[400px] lg:w-[500px]" // Full width on mobile, fixed width on desktop
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("notes")}
            className={clsx(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === "notes" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
            )}
          >
            <FileText className="w-4 h-4" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={clsx(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === "chat" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "notes" ? (
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your notes here..."
            className="flex-1 w-full bg-transparent p-6 text-black resize-none focus:outline-none font-serif leading-relaxed placeholder:text-gray-400"
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={clsx("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-gray-100 text-black rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
