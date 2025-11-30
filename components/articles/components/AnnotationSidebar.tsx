import { X } from "lucide-react";
import React, { useState } from "react";

export interface Annotation {
  id: string;
  text: string;
  comment: string;
  startOffset: number;
  endOffset: number;
}

interface AnnotationSidebarProps {
  annotations: Annotation[];
  onAddComment: (annotationId: string, comment: string) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  pendingAnnotation?: {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
  };
  onCancelPending: () => void;
}

const AnnotationSidebar: React.FC<AnnotationSidebarProps> = ({
  annotations,
  onAddComment,
  onDeleteAnnotation,
  pendingAnnotation,
  onCancelPending,
}) => {
  const [commentInput, setCommentInput] = useState("");

  const handleAddComment = () => {
    if (pendingAnnotation && commentInput.trim()) {
      onAddComment(pendingAnnotation.id, commentInput);
      setCommentInput("");
    }
  };

  return (
    <div className="h-full overflow-y-auto border-l border-gray-200 bg-[#FDFBF7] p-4">
      <h3 className="mb-4 text-lg font-bold text-gray-900">Comments</h3>

      {/* Pending annotation input */}
      {pendingAnnotation && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 rounded bg-gray-50 p-2 text-sm text-gray-700">
            "{pendingAnnotation.text}"
          </div>
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="mb-2 w-full rounded border border-gray-200 p-2 text-sm focus:border-gray-400 focus:outline-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddComment}
              className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Comment
            </button>
            <button
              onClick={() => {
                onCancelPending();
                setCommentInput("");
              }}
              className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing annotations */}
      <div className="space-y-3">
        {annotations.length === 0 && !pendingAnnotation && (
          <p className="text-sm text-gray-500">
            No comments yet. Select text to add a comment.
          </p>
        )}
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1 rounded bg-gray-50 p-2 text-sm text-gray-700">
                "{annotation.text}"
              </div>
              <button
                onClick={() => onDeleteAnnotation(annotation.id)}
                className="ml-2 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-800">{annotation.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnotationSidebar;
