import { Highlighter, MessageSquare } from "lucide-react";
import React from "react";

interface SelectionTooltipProps {
  position: { top: number; left: number };
  onHighlight: () => void;
  onComment: () => void;
  onClose: () => void;
}

const SelectionTooltip: React.FC<SelectionTooltipProps> = ({
  position,
  onHighlight,
  onComment,
  onClose,
}) => {
  return (
    <>
      {/* Invisible overlay to detect clicks outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onMouseDown={(e) => {
          // Prevent the mousedown from interfering with selection
          e.preventDefault();
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-50 flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: "translate(-50%, -100%) translateY(-10px)", // Reduced offset
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            onHighlight();
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <Highlighter className="h-4 w-4" />
          Highlight
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            onComment();
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <MessageSquare className="h-4 w-4" />
          Comment
        </button>
      </div>
    </>
  );
};

export default SelectionTooltip;
