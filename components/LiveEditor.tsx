import LiveBlock from "@/components/LiveBlock";
import { useEffect, useState } from "react";

interface LiveEditorProps {
  initialContent: string;
  onSave: (newContent: string) => void;
  isEditingMode: boolean;
}

export default function LiveEditor({
  initialContent,
  onSave,
  isEditingMode,
}: LiveEditorProps) {
  // Split content by double newlines to get blocks
  // We use a more robust regex to handle different newline styles if needed,
  // but for now \n\n is the standard for markdown paragraphs.
  const [blocks, setBlocks] = useState<string[]>([]);

  useEffect(() => {
    if (initialContent) {
      setBlocks(initialContent.split(/\n\n+/));
    } else {
      setBlocks([""]);
    }
  }, [initialContent]);

  const handleBlockUpdate = (index: number, newBlockContent: string) => {
    const newBlocks = [...blocks];
    newBlocks[index] = newBlockContent;
    setBlocks(newBlocks);

    // Reassemble and save
    const fullContent = newBlocks.join("\n\n");
    onSave(fullContent);
  };

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => (
        <LiveBlock
          key={`${index}-${block.substring(0, 10)}`} // Simple key generation
          content={block}
          onUpdate={(newContent) => handleBlockUpdate(index, newContent)}
          isEditingMode={isEditingMode}
        />
      ))}

      {/* Area to add new blocks at the end if in edit mode */}
      {isEditingMode && (
        <div
          className="flex h-24 cursor-text items-center justify-center rounded text-sm text-gray-400 hover:bg-gray-50"
          onClick={() => {
            const newBlocks = [...blocks, ""];
            setBlocks(newBlocks);
          }}
        >
          Click to add new block
        </div>
      )}
    </div>
  );
}
