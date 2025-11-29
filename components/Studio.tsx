"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { clsx } from "clsx";
import { useMutation, useQuery } from "convex/react";
import { Bot, FileText, MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StudioProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: Id<"articles">;
}

export default function Studio({ isOpen, onClose, articleId }: StudioProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes");
  const [model, setModel] = useState<"gpt-4o-mini" | "gemini-2.5-flash">(
    "gpt-4o-mini",
  );

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
  // We use Convex for initial history, but useChat for active session state
  const existingMessages = useQuery(api.messages.list, { articleId });
  console.log(
    "existingMessages",
    existingMessages,
    existingMessages?.map((m) => ({
      id: m._id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text", text: m.content }],
    })),
  );
  const [messageInput, setMessageInput] = useState("");

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { articleId, model },
    }),
    messages: existingMessages?.map((m) => ({
      id: m._id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text", text: m.content }],
    })),
    // When the stream finishes, we don't need to do anything manually because
    // the server saves the message to Convex, and if we re-mount, we fetch from Convex.
    // However, for a seamless experience, we just let useChat handle the UI state.
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            {/* Model Picker */}
            <div className="border-b border-gray-100 px-4 py-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-500">Model:</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as any)}
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-gray-700 focus:border-black focus:outline-none"
                >
                  <option value="gpt-4o-mini">GPT 4.1 Nano</option>
                  <option value="gemini-2.5-flash-lite-preview-09-2025">
                    Gemini 2.5 Flash
                  </option>
                </select>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {existingMessages?.map((msg, idx) => (
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
                        : "bg-gray-100 text-black",
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {messages.map((msg, idx) => (
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
                    {msg.parts.length > 0 &&
                      msg.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <div
                                key={`${msg.id}-${i}`}
                                className="whitespace-pre-wrap"
                              >
                                {part.text}
                              </div>
                            );
                          default:
                            return null;
                        }
                      })}
                  </div>
                </div>
              ))}
              {existingMessages?.length === 0 && messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
                  <Bot className="h-8 w-8 opacity-20" />
                  <p className="text-sm">Ask a question about this article</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage({ text: messageInput });
                setMessageInput("");
              }}
              className="border-t border-gray-200 p-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.currentTarget.value)}
                  placeholder="Ask a question..."
                  className="w-full rounded-full bg-gray-100 py-3 pr-12 pl-4 text-black placeholder:text-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "submitted" || status === "streaming"}
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
