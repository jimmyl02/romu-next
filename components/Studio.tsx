"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { clsx } from "clsx";
import { useMutation, useQuery } from "convex/react";
import { Bot, FileText, MessageSquare, Send, Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StudioProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: Id<"articles">;
}

interface SidebarItemProps {
  id: "notes" | "chat" | "settings";
  icon: React.ElementType;
  label: string;
  activeTab: "notes" | "chat" | "settings";
  setActiveTab: (tab: "notes" | "chat" | "settings") => void;
}

const SidebarItem = ({
  id,
  icon: Icon,
  label,
  activeTab,
  setActiveTab,
}: SidebarItemProps) => (
  <button
    onClick={() => setActiveTab(id)}
    className={clsx(
      "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-gray-200",
      activeTab === id
        ? "bg-gray-200 text-black"
        : "text-gray-400 hover:text-gray-600",
    )}
  >
    <Icon className="h-5 w-5 transition-colors" />
    {/* Tooltip */}
    <div className="pointer-events-none absolute left-14 z-50 rounded-md bg-black px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      {label}
    </div>
  </button>
);

export default function Studio({ isOpen, onClose, articleId }: StudioProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "chat" | "settings">(
    "notes",
  );
  const [model, setModel] = useState<"gpt-4o-mini" | "gemini-2.5-flash">(
    "gpt-4o-mini",
  );

  // Notes
  const note = useQuery(api.notes.get, { articleId });
  const updateNote = useMutation(api.notes.update);
  const [localNoteContent, setLocalNoteContent] = useState<string | null>(null);

  // Sync local note content with DB content ONLY when it first loads
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && note) {
      setTimeout(() => {
        setLocalNoteContent(note.content);
        initialized.current = true;
      }, 0);
    }
  }, [note]);

  // Debounced save
  useEffect(() => {
    if (localNoteContent === null) return;

    const timer = setTimeout(() => {
      updateNote({ articleId, content: localNoteContent });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [localNoteContent, updateNote, articleId]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNoteContent(e.target.value);
  };

  // Chat
  // We use Convex for initial history, but useChat for active session state
  const existingMessages = useQuery(api.messages.list, { articleId });
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
        "fixed inset-y-0 right-0 z-40 flex border-l border-gray-200 bg-white shadow-2xl transition-all duration-300",
        "w-full md:w-[450px] lg:w-[600px]", // Increased width for better split view
      )}
    >
      {/* Sidebar */}
      <div className="flex w-16 flex-col items-center border-r border-gray-100 bg-gray-50/50 py-4">
        <div className="flex flex-1 flex-col gap-2">
          <SidebarItem
            id="notes"
            icon={FileText}
            label="Notes"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <SidebarItem
            id="chat"
            icon={MessageSquare}
            label="Chat"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <SidebarItem
            id="settings"
            icon={Settings}
            label="Settings"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {activeTab === "notes" && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={localNoteContent ? localNoteContent : ""}
              onChange={handleNoteChange}
              placeholder="Write your notes here..."
              className="w-full flex-1 resize-none bg-transparent p-6 font-serif leading-relaxed text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex h-full flex-col">
            {/* Header with Model Picker */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={model}
                    onChange={(e) =>
                      setModel(
                        e.target.value as "gpt-4o-mini" | "gemini-2.5-flash",
                      )
                    }
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-100 focus:border-black focus:outline-none"
                  >
                    <option value="gpt-4o-mini">GPT 4.1 Nano</option>
                    <option value="gemini-2.5-flash-lite-preview-09-2025">
                      Gemini 2.5 Flash
                    </option>
                  </select>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {existingMessages?.map((msg, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "mb-2 flex",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800",
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
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
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
                <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                  <div className="rounded-full bg-gray-50 p-4">
                    <Bot className="h-8 w-8 opacity-20" />
                  </div>
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
              className="border-t border-gray-100 p-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.currentTarget.value)}
                  placeholder="Ask a question..."
                  className="w-full rounded-full bg-gray-100 py-3.5 pr-12 pl-5 text-sm text-black transition-all placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-black/5 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "submitted" || status === "streaming"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black p-2 text-white transition-transform hover:scale-105 hover:bg-gray-800 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                <Settings className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <h3 className="text-sm font-medium text-gray-900">
                  No settings available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Global settings will appear here in a future update.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
