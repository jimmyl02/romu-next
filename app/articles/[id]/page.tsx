"use client";

import AnnotationItem, {
  Annotation,
} from "@/components/articles/components/AnnotationItem";
import Studio from "@/components/articles/components/Studio";
import ArticleRenderer from "@/components/articles/renderer/ArticleRenderer";
import LiveEditor from "@/components/articles/renderer/LiveEditor";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { safeUrlCleanup } from "@/util/url";
import { clsx } from "clsx";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Edit,
  Eye,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as Id<"articles">;
  const article = useQuery(api.articles.get, { id });
  const updateArticle = useMutation(api.articles.update);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Highlight state
  const highlights = useQuery(api.highlights.list, { articleId: id });
  const addHighlightRaw = useMutation(
    api.highlights.create,
  ).withOptimisticUpdate((localStore, args) => {
    const { articleId, text, startOffset, endOffset } = args;
    const existingHighlights = localStore.getQuery(api.highlights.list, {
      articleId,
    });

    // Now that we have the existing highlights, we can optimistically add the new highlight
    if (existingHighlights !== undefined) {
      const newHighlight = {
        _id: crypto.randomUUID() as Id<"highlights">,
        _creationTime: Date.now(),
        articleId,
        userId: "", // this is okay as convex will just roll this back
        text,
        startOffset,
        endOffset,
      };
      localStore.setQuery(api.highlights.list, { articleId }, [
        ...existingHighlights,
        newHighlight,
      ]);
    }
  });
  const addHighlight = useCallback(
    (text: string, startOffset: number, endOffset: number) => {
      addHighlightRaw({ articleId: id, text, startOffset, endOffset });
    },
    [id],
  );
  const removeHighlightRaw = useMutation(
    api.highlights.remove,
  ).withOptimisticUpdate((localStore, args) => {
    const { highlightId } = args;
    const existingHighlights = localStore.getQuery(api.highlights.list, {
      articleId: id,
    });
    if (existingHighlights !== undefined) {
      localStore.setQuery(api.highlights.list, { articleId: id }, [
        ...existingHighlights.filter((h) => h._id !== highlightId),
      ]);
    }
  });
  const removeHighlight = useCallback((highlightId: string) => {
    removeHighlightRaw({ highlightId: highlightId as Id<"highlights"> });
  }, []);

  // Annotations state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [pendingAnnotation, setPendingAnnotation] = useState<{
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
    initialTop?: number;
  } | null>(null);
  const [annotationPositions, setAnnotationPositions] = useState<
    Record<string, number>
  >({});
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
    null,
  );

  // Calculate annotation positions
  useEffect(() => {
    const calculatePositions = () => {
      const positions: Record<string, number> = {};
      const sortedAnnotations = [...annotations].sort(
        (a, b) => a.startOffset - b.startOffset,
      );

      // First pass: get ideal positions from DOM
      const idealPositions: { id: string; top: number; height: number }[] = [];

      // Include pending annotation in calculation
      const allAnnotations = [...sortedAnnotations];
      if (pendingAnnotation) {
        allAnnotations.push({
          ...pendingAnnotation,
          comment: "", // Dummy
        });
      }

      allAnnotations.forEach((annotation) => {
        const mark = document.querySelector(
          `mark[data-annotation-id="${annotation.id}"]`,
        );
        if (mark) {
          const rect = mark.getBoundingClientRect();
          // Calculate top relative to the article container
          // We'll need to adjust this based on the container's position
          const container = document.getElementById("article-container");
          const containerRect = container?.getBoundingClientRect();

          if (containerRect) {
            const top = rect.top - containerRect.top;
            idealPositions.push({ id: annotation.id, top, height: 150 }); // Assume approx height or measure
          }
        }
      });

      // Second pass: resolve collisions
      let lastBottom = 0;
      idealPositions.forEach((pos) => {
        let top = pos.top;
        if (top < lastBottom + 10) {
          top = lastBottom + 10;
        }
        positions[pos.id] = top;
        lastBottom = top + pos.height;
      });

      setAnnotationPositions(positions);
    };

    // Run after a short delay to allow rendering
    const timeout = setTimeout(calculatePositions, 100);
    window.addEventListener("resize", calculatePositions);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", calculatePositions);
    };
  }, [annotations, highlights, pendingAnnotation]); // Re-run when content changes

  const handleStartAnnotation = (
    text: string,
    startOffset: number,
    endOffset: number,
    initialTop?: number,
  ) => {
    const id = `annotation-${Date.now()}-${Math.random()}`;
    setPendingAnnotation({ id, text, startOffset, endOffset, initialTop });
  };

  const handleAddComment = (annotationId: string, comment: string) => {
    if (pendingAnnotation && pendingAnnotation.id === annotationId) {
      setAnnotations([
        ...annotations,
        {
          id: pendingAnnotation.id,
          text: pendingAnnotation.text,
          comment,
          startOffset: pendingAnnotation.startOffset,
          endOffset: pendingAnnotation.endOffset,
        },
      ]);
      setPendingAnnotation(null);
    }
  };

  const handleEditAnnotation = (annotationId: string, newComment: string) => {
    setAnnotations(
      annotations.map((a) =>
        a.id === annotationId ? { ...a, comment: newComment } : a,
      ),
    );
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    setAnnotations(annotations.filter((a) => a.id !== annotationId));
  };

  const handleCancelPending = () => {
    setPendingAnnotation(null);
  };

  if (article === undefined) {
    return <div className="p-8 text-gray-500">Loading article...</div>;
  }

  if (article === null) {
    return <div className="p-8 text-gray-500">Article not found.</div>;
  }

  const handleSave = async (newContent: string) => {
    await updateArticle({ id, content: newContent });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-[#FDFBF7]/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-500 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="max-w-md truncate text-lg font-bold text-gray-900">
            {article.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              {isEditing ? (
                <>
                  <Edit className="h-4 w-4" />
                  Editing
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Viewing
                </>
              )}
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full right-0 z-50 mt-1 w-40 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsDropdownOpen(false);
                    }}
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50",
                      isEditing && "bg-gray-50 text-blue-600",
                    )}
                  >
                    <Edit className="h-4 w-4" />
                    Editing
                    {isEditing && <Check className="ml-auto h-3 w-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsDropdownOpen(false);
                    }}
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50",
                      !isEditing && "bg-gray-50 text-blue-600",
                    )}
                  >
                    <Eye className="h-4 w-4" />
                    Viewing
                    {!isEditing && <Check className="ml-auto h-3 w-3" />}
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setIsStudioOpen(!isStudioOpen)}
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            {isStudioOpen ? (
              <>
                <PanelRightClose className="h-4 w-4" />
                Hide Studio
              </>
            ) : (
              <>
                <PanelRightOpen className="h-4 w-4" />
                Open Studio
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex flex-1">
        <main
          className={clsx(
            "mx-auto flex-1 transition-all duration-300 ease-in-out",
            isStudioOpen ? "mr-0 md:mr-[400px] lg:mr-[500px]" : "mr-0",
          )}
        >
          <div className="flex justify-center">
            <div
              id="article-container"
              className="relative max-w-3xl px-6 py-12"
            >
              <div className="mb-8">
                <h1 className="mb-2 text-4xl leading-tight font-bold text-gray-900">
                  {article.title}
                </h1>
                {article.url !== undefined && (
                  <div className="text-sm text-gray-500">
                    {safeUrlCleanup(article.url)}
                  </div>
                )}
              </div>

              {isEditing ? (
                <LiveEditor
                  initialContent={article.content}
                  onSave={handleSave}
                  isEditingMode={true}
                />
              ) : (
                <ArticleRenderer
                  content={article.content}
                  highlights={highlights}
                  annotations={annotations}
                  onAddHighlight={addHighlight}
                  onStartAnnotation={handleStartAnnotation}
                  onDeleteHighlight={removeHighlight}
                  pendingAnnotation={pendingAnnotation}
                />
              )}
            </div>
            {/* Inline Annotations Column */}
            {!isEditing && (
              <div
                className={clsx(
                  "relative w-[300px] flex-shrink-0 pt-12",
                  annotations.length > 0 || pendingAnnotation
                    ? "block xl:block"
                    : "hidden",
                )}
              >
                {annotations.map((annotation) => (
                  <AnnotationItem
                    key={annotation.id}
                    annotation={annotation}
                    style={{
                      top: annotationPositions[annotation.id] || 0,
                    }}
                    onDelete={handleDeleteAnnotation}
                    onEdit={handleEditAnnotation}
                    isActive={activeAnnotationId === annotation.id}
                    onClick={() => setActiveAnnotationId(annotation.id)}
                  />
                ))}

                {/* Pending Annotation */}
                {pendingAnnotation && (
                  <div
                    className="absolute right-0 w-[280px] rounded-lg border border-blue-200 bg-white p-4 shadow-md ring-1 ring-blue-100"
                    style={{
                      // Position it near the selection if possible, or fixed
                      top:
                        annotationPositions[pendingAnnotation.id] ||
                        pendingAnnotation.initialTop ||
                        0,
                    }}
                  >
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full rounded border border-gray-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
                      rows={3}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(
                            pendingAnnotation.id,
                            (e.target as HTMLTextAreaElement).value,
                          );
                        }
                      }}
                      // Add ref or state to capture value for button click
                      onChange={(e) => {
                        // We could add local state here if we want the button to work
                        // For now, let's just rely on Enter or add a simple state
                      }}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={handleCancelPending}
                        className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          // Find the textarea and submit
                          const textarea = e.currentTarget.parentElement
                            ?.previousElementSibling as HTMLTextAreaElement;
                          if (textarea && textarea.value) {
                            handleAddComment(
                              pendingAnnotation.id,
                              textarea.value,
                            );
                          }
                        }}
                        className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Studio Sidebar */}
        <Studio
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          articleId={id}
        />
      </div>
    </div>
  );
}
