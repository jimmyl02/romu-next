import ArticleRenderer from "@/components/ArticleRenderer";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface LiveBlockProps {
  content: string;
  onUpdate: (newContent: string) => void;
  isEditingMode: boolean;
}

export default function LiveBlock({
  content,
  onUpdate,
  isEditingMode,
}: LiveBlockProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync local state if prop changes (e.g. from external save/load)
  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleBlur = () => {
    setIsFocused(false);
    if (value !== content) {
      onUpdate(value);
    }
  };

  const handleClick = () => {
    if (isEditingMode) {
      setIsFocused(true);
    }
  };

  // Determine styles based on content
  const getStyles = (text: string) => {
    if (text.startsWith("# ")) {
      return "mt-6 mb-6 text-3xl leading-tight font-bold tracking-tight text-gray-900 md:text-4xl";
    }
    if (text.startsWith("## ")) {
      return "mt-6 mb-5 text-2xl leading-snug font-bold text-gray-900 md:text-3xl";
    }
    if (text.startsWith("### ")) {
      return "mt-6 mb-4 text-xl leading-snug font-semibold text-gray-900 md:text-2xl";
    }
    if (text.startsWith("#### ")) {
      return "mt-6 mb-3 text-lg font-semibold text-gray-900 md:text-xl";
    }
    if (text.startsWith("> ")) {
      return "my-8 border-l-4 border-gray-300 bg-gray-50/50 py-2 pl-6 text-xl text-gray-700 italic";
    }
    // Default paragraph style
    return "mb-6 text-lg leading-relaxed text-gray-800";
  };

  // When entering edit mode, focus the textarea
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  if (isEditingMode && isFocused) {
    return (
      <div className="relative">
        <TextareaAutosize
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className={clsx(
            "w-full resize-none overflow-hidden bg-transparent p-0 font-serif outline-none focus:ring-0",
            getStyles(value),
          )}
          minRows={1}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "relative min-h-[1.5em] rounded transition-colors",
        isEditingMode && "cursor-text hover:bg-gray-50",
        // Visual cue for empty blocks in edit mode
        isEditingMode && !content.trim() && "bg-gray-50/50",
      )}
    >
      <ArticleRenderer content={value} />
    </div>
  );
}
