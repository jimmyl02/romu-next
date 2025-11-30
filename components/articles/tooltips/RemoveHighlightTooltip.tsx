import React from "react";

interface RemoveHighlightTooltipProps {
  position: {
    top: number;
    left: number;
  };
  onRemove: () => void;
  onClose: () => void;
}

const RemoveHighlightTooltip: React.FC<RemoveHighlightTooltipProps> = ({
  position,
  onRemove,
  onClose,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: "translate(-50%, -100%) translateY(-10px)", // Reduced offset
        }}
      >
        <button
          onClick={onRemove}
          className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium whitespace-nowrap text-red-700 transition-colors hover:bg-red-50"
        >
          Remove Highlight
        </button>
      </div>
    </>
  );
};

export default RemoveHighlightTooltip;
