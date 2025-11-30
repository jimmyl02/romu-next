import { clsx } from "clsx";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface Annotation {
  id: string;
  text: string;
  comment: string;
  startOffset: number;
  endOffset: number;
}

interface AnnotationItemProps {
  annotation: Annotation;
  style?: React.CSSProperties;
  onDelete: (id: string) => void;
  onEdit: (id: string, newComment: string) => void;
  isActive?: boolean;
  onClick?: () => void;
}

const AnnotationItem: React.FC<AnnotationItemProps> = ({
  annotation,
  style,
  onDelete,
  onEdit,
  isActive,
  onClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(annotation.comment);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(annotation.id, editValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(annotation.comment);
    setIsEditing(false);
  };

  return (
    <div
      className={clsx(
        "absolute right-0 w-[280px] rounded-lg border bg-white p-4 shadow-sm transition-all duration-200",
        isActive
          ? "border-blue-200 shadow-md ring-1 ring-blue-100"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md",
      )}
      style={style}
      onClick={onClick}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            U
          </div>
          <span className="text-xs font-medium text-gray-900">User</span>
          <span className="text-xs text-gray-400">Just now</span>
        </div>

        {!isEditing && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute top-full right-0 z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(annotation.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full rounded border border-gray-200 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            rows={3}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-gray-800">
            {annotation.comment}
          </p>
          <div className="mt-2 border-l-2 border-gray-200 pl-2">
            <p className="line-clamp-2 text-xs text-gray-500 italic">
              "{annotation.text}"
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AnnotationItem;
