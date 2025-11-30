import { clsx } from "clsx";
import React, { useEffect, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

import { Check } from "lucide-react";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";
import RemoveHighlightTooltip from "../tooltips/RemoveHighlightTooltip";
import SelectionTooltip from "../tooltips/SelectionTooltip";

interface ArticleRendererProps {
  content: string;
  highlights?: Array<{
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
  }>;
  annotations?: Array<{
    id: string;
    text: string;
    comment: string;
    startOffset: number;
    endOffset: number;
  }>;
  onAddHighlight?: (
    text: string,
    startOffset: number,
    endOffset: number,
  ) => void;
  onStartAnnotation?: (
    text: string,
    startOffset: number,
    endOffset: number,
  ) => void;
  onDeleteHighlight?: (highlightId: string) => void;
}

const ArticleRenderer: React.FC<ArticleRendererProps> = ({
  content,
  highlights = [],
  annotations = [],
  onAddHighlight,
  onStartAnnotation,
  onDeleteHighlight,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // State for remove highlight tooltip
  const [removeTooltipPosition, setRemoveTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [highlightToRemove, setHighlightToRemove] = useState<string | null>(
    null,
  );

  // Handle text selection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setTooltipPosition(null);
      setSelectedText("");
      setSelectionRange(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text || !contentRef.current) {
      setTooltipPosition(null);
      setSelectedText("");
      setSelectionRange(null);
      return;
    }

    // Check if the selection is within the content
    const range = selection.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    // Calculate position for tooltip
    const rect = range.getBoundingClientRect();
    const tooltipLeft = rect.left + rect.width / 2;
    const tooltipTop = rect.top + window.scrollY; // Use document coordinates for absolute positioning

    setTooltipPosition({
      top: tooltipTop,
      left: tooltipLeft,
    });
    setSelectedText(text);

    // Calculate absolute character offsets by walking the DOM
    const offsets = calculateAbsoluteOffsets(range);
    if (offsets) {
      setSelectionRange(offsets);
    }
  };

  // Calculate absolute character offsets from a Range
  const calculateAbsoluteOffsets = (
    range: Range,
  ): { startOffset: number; endOffset: number } | null => {
    if (!contentRef.current) return null;

    let currentPos = 0;
    let startOffset = -1;
    let endOffset = -1;

    const walk = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;

        // Check if this node contains the range start
        if (node === range.startContainer) {
          startOffset = currentPos + range.startOffset;
        }

        // Check if this node contains the range end
        if (node === range.endContainer) {
          endOffset = currentPos + range.endOffset;
          return true; // Stop walking
        }

        currentPos += textLength;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // NOTE: this is to handle the specific edge case of selecting text that extends beyond text nodes
        // Handle case where endContainer is an element (selection extends beyond text nodes)
        if (node === range.endContainer) {
          // Use current position as the end (end of last text node we saw)
          endOffset = currentPos;
          return true;
        }

        // Handle case where startContainer is an element
        if (node === range.startContainer) {
          // Start from current position
          startOffset = currentPos;
        }

        // Walk children
        for (let i = 0; i < node.childNodes.length; i++) {
          if (walk(node.childNodes[i])) {
            return true; // Stop if we found the end
          }
        }
      }

      return false;
    };

    walk(contentRef.current);

    if (startOffset >= 0 && endOffset >= 0) {
      return { startOffset, endOffset };
    }

    return null;
  };

  const handleHighlight = () => {
    // Clear selection immediately to prevent it from jumping during DOM manipulation
    window.getSelection()?.removeAllRanges();

    if (selectedText && selectionRange && onAddHighlight) {
      onAddHighlight(
        selectedText,
        selectionRange.startOffset,
        selectionRange.endOffset,
      );
    }
    setTooltipPosition(null);
    setSelectedText("");
    setSelectionRange(null);
    // Don't clear selection - let it stay
  };

  const handleComment = () => {
    // Clear selection immediately to prevent it from jumping during DOM manipulation
    window.getSelection()?.removeAllRanges();

    if (selectedText && selectionRange && onStartAnnotation) {
      onStartAnnotation(
        selectedText,
        selectionRange.startOffset,
        selectionRange.endOffset,
      );
    }
    setTooltipPosition(null);
    setSelectedText("");
    setSelectionRange(null);
    // Don't clear selection - let it stay
  };

  const handleCloseTooltip = () => {
    setTooltipPosition(null);
    setSelectedText("");
    setSelectionRange(null);
    // Clear selection when closing tooltip
    window.getSelection()?.removeAllRanges();
  };

  // Apply highlights and annotations to the rendered content
  useEffect(() => {
    if (!contentRef.current) return;

    // Remove existing highlights first
    const existingMarks = contentRef.current.querySelectorAll(
      "mark.highlight, mark.annotation",
    );
    existingMarks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(mark.textContent || ""),
          mark,
        );
        parent.normalize();
      }
    });

    // Apply highlights and annotations using character offsets
    const applyHighlightByRange = (
      startOffset: number,
      endOffset: number,
      className: string,
      style: string,
      highlightId?: string, // Optional ID for highlights
    ) => {
      if (!contentRef.current) return;

      let currentPos = 0;
      const nodesToWrap: Array<{
        node: Text;
        start: number;
        end: number;
      }> = [];

      // First pass: collect all text nodes that need wrapping
      const collectNodes = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const textNode = node as Text;
          const textLength = textNode.textContent?.length || 0;
          const nodeStart = currentPos;
          const nodeEnd = currentPos + textLength;

          // Check if this node overlaps with the highlight range
          if (nodeEnd > startOffset && nodeStart < endOffset) {
            // Calculate the portion of this node to highlight
            const highlightStart = Math.max(0, startOffset - nodeStart);
            const highlightEnd = Math.min(textLength, endOffset - nodeStart);

            nodesToWrap.push({
              node: textNode,
              start: highlightStart,
              end: highlightEnd,
            });
          }

          currentPos += textLength;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          // Skip code blocks, pre tags, and existing marks
          if (
            element.tagName === "CODE" ||
            element.tagName === "PRE" ||
            element.tagName === "MARK"
          ) {
            // Still need to count characters
            const text = element.textContent || "";
            currentPos += text.length;
            return;
          }

          // Walk children
          for (let i = 0; i < node.childNodes.length; i++) {
            collectNodes(node.childNodes[i]);
          }
        }
      };

      collectNodes(contentRef.current);

      // Second pass: wrap the collected nodes
      nodesToWrap.forEach(({ node, start, end }) => {
        const text = node.textContent || "";
        const parent = node.parentNode;
        if (!parent) return;

        // Create a document fragment to hold the new nodes
        const fragment = document.createDocumentFragment();

        // Add text before highlight (if any)
        if (start > 0) {
          fragment.appendChild(
            document.createTextNode(text.substring(0, start)),
          );
        }

        // Add highlighted text
        const mark = document.createElement("mark");
        mark.className = className;
        mark.setAttribute("style", style);
        if (highlightId) {
          mark.setAttribute("data-highlight-id", highlightId);
        }
        mark.textContent = text.substring(start, end);
        fragment.appendChild(mark);

        // Add text after highlight (if any)
        if (end < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(end)));
        }

        // Replace the original text node with the fragment
        parent.replaceChild(fragment, node);
      });
    };

    // Apply annotations (they have priority)
    annotations.forEach((annotation) => {
      applyHighlightByRange(
        annotation.startOffset,
        annotation.endOffset,
        "annotation",
        "background-color: #FFF4CC; border-bottom: 2px solid #F59E0B; cursor: pointer; padding: 2px 0;",
      );
    });

    // Apply highlights
    highlights.forEach((highlight) => {
      // Check if this range overlaps with any annotation
      const hasOverlap = annotations.some(
        (a) =>
          !(
            highlight.endOffset <= a.startOffset ||
            highlight.startOffset >= a.endOffset
          ),
      );

      if (!hasOverlap) {
        applyHighlightByRange(
          highlight.startOffset,
          highlight.endOffset,
          "highlight",
          "background-color: #FEF3C7; padding: 2px 0; cursor: pointer;",
          highlight.id, // Pass the ID
        );
      }
    });

    // Add click handlers to all highlight marks
    if (onDeleteHighlight) {
      const highlightMarks =
        contentRef.current.querySelectorAll("mark.highlight");
      highlightMarks.forEach((mark) => {
        const handleClick = (e: Event) => {
          e.stopPropagation();
          const target = e.target as HTMLElement;
          const highlightId = target.getAttribute("data-highlight-id");
          if (highlightId) {
            const rect = target.getBoundingClientRect();
            setRemoveTooltipPosition({
              top: rect.top + window.scrollY,
              left: rect.left + rect.width / 2,
            });
            setHighlightToRemove(highlightId);
          }
        };
        mark.addEventListener("click", handleClick);
      });
    }
  }, [content, highlights, annotations, onDeleteHighlight]); // Changed: now includes content

  const components: Components = React.useMemo(
    () => ({
      h1: ({ children, ...props }) => (
        <h1
          className="mt-6 mb-6 text-3xl leading-tight font-bold tracking-tight text-gray-900 md:text-4xl"
          {...props}
        >
          {children}
        </h1>
      ),
      h2: ({ children, ...props }) => (
        <h2
          className="mt-6 mb-5 text-2xl leading-snug font-bold text-gray-900 md:text-3xl"
          {...props}
        >
          {children}
        </h2>
      ),
      h3: ({ children, ...props }) => (
        <h3
          className="mt-6 mb-4 text-xl leading-snug font-semibold text-gray-900 md:text-2xl"
          {...props}
        >
          {children}
        </h3>
      ),
      h4: ({ children, ...props }) => (
        <h4
          className="mt-6 mb-3 text-lg font-semibold text-gray-900 md:text-xl"
          {...props}
        >
          {children}
        </h4>
      ),
      p: ({ children, ...props }) => (
        <p
          className="mb-6 text-lg leading-relaxed text-gray-800 last:mb-0"
          {...props}
        >
          {children}
        </p>
      ),
      blockquote: ({ children, ...props }) => (
        <blockquote
          className="my-8 rounded-r-lg border-l-4 border-gray-300 bg-gray-50/50 py-2 pl-6 text-xl text-gray-700 italic"
          {...props}
        >
          {children}
        </blockquote>
      ),
      ul: ({ children, className, ...props }) => {
        const isTaskList = className?.includes("contains-task-list");
        return (
          <ul
            className={clsx(
              "mb-6 space-y-2 text-lg text-gray-800",
              isTaskList
                ? "ml-0 list-none"
                : "ml-6 list-outside list-disc marker:text-gray-400",
            )}
            {...props}
          >
            {children}
          </ul>
        );
      },
      ol: ({ children, ...props }) => (
        <ol
          className="mb-6 ml-6 list-outside list-decimal space-y-2 text-lg text-gray-800 marker:text-gray-400"
          {...props}
        >
          {children}
        </ol>
      ),
      li: ({ children, className, ...props }) => {
        const isTaskListItem = className?.includes("task-list-item");
        return (
          <li
            className={clsx("pl-2", isTaskListItem && "-ml-2 flex items-start")}
            {...props}
          >
            {children}
          </li>
        );
      },
      input: ({ type, checked, ...props }) => {
        if (type === "checkbox") {
          return (
            <span className="mt-1 mr-3 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white">
              {checked ? (
                <Check className="h-3.5 w-3.5 text-gray-900" strokeWidth={3} />
              ) : null}
            </span>
          );
        }
        return <input type={type} checked={checked} {...props} />;
      },
      a: ({ children, href, ...props }) => (
        <a
          href={href}
          className="text-gray-900 underline decoration-gray-400 decoration-1 underline-offset-4 transition-all hover:decoration-gray-900"
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          {...props}
        >
          {children}
        </a>
      ),
      code: ({ className, children, ...props }: any) => {
        const isInline = !className;
        return isInline ? (
          <code
            className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800"
            {...props}
          >
            {children}
          </code>
        ) : (
          <code
            className={clsx("block overflow-x-auto p-4 text-sm", className)}
            {...props}
          >
            {children}
          </code>
        );
      },
      pre: ({ children, ...props }) => (
        <pre
          className="my-8 overflow-hidden rounded-lg border border-gray-800 bg-gray-900 text-gray-100 shadow-sm"
          {...props}
        >
          {children}
        </pre>
      ),
      hr: ({ ...props }) => <hr className="my-12 border-gray-200" {...props} />,
      img: ({ src, alt, ...props }) => (
        <figure className="my-10">
          <img
            src={src}
            alt={alt}
            className="h-auto w-full rounded-lg shadow-md"
            {...props}
          />
          {alt && (
            <figcaption className="mt-3 text-center text-sm text-gray-500 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      ),
    }),
    [], // Components never change
  );

  // Memoize the markdown content to prevent re-renders when tooltip state changes
  const markdownContent = React.useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeUnwrapImages]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    ),
    [content, components], // Re-render when content or components change
  );

  return (
    <>
      <div
        ref={contentRef}
        className="font-serif"
        onMouseUp={handleMouseUp}
        style={{ userSelect: "text" }}
      >
        {markdownContent}
      </div>

      {tooltipPosition && (
        <SelectionTooltip
          position={tooltipPosition}
          onHighlight={handleHighlight}
          onComment={handleComment}
          onClose={handleCloseTooltip}
        />
      )}

      {removeTooltipPosition && highlightToRemove && (
        <RemoveHighlightTooltip
          position={removeTooltipPosition}
          onRemove={() => {
            if (onDeleteHighlight) {
              onDeleteHighlight(highlightToRemove);
            }
            setRemoveTooltipPosition(null);
            setHighlightToRemove(null);
          }}
          onClose={() => {
            setRemoveTooltipPosition(null);
            setHighlightToRemove(null);
          }}
        />
      )}
    </>
  );
};

export default ArticleRenderer;
