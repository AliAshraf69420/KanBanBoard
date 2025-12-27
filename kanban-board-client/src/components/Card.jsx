import { useState, useEffect, lazy, Suspense } from "react";
import { useBoardState } from "../hooks/useBoardState";

// Lazy load the modal for code splitting
const CardModal = lazy(() => import("./CardModal"));

export default function Card({ card }) {
  const { renameCard, removeCard } = useBoardState();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [input, setInput] = useState(card.title);
  const [isDragging, setIsDragging] = useState(false);

  // Update input when card title changes
  useEffect(() => {
    setInput(card.title);
  }, [card.title]);

  const handleSubmit = () => {
    renameCard(card.id, input.trim() || card.title);
    setIsEditing(false);
  };

  // Drag start for moving card
  const handleDragStart = (e) => {
    e.stopPropagation(); // Prevent parent list from also starting drag
    setIsDragging(true);
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ cardId: card.id, fromListId: card.listId })
    );
    e.dataTransfer.effectAllowed = "move";
    // Set drag image opacity
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-obsidian-bg border border-obsidian-border rounded p-2 flex justify-between items-center transition-opacity ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${!isEditing ? "cursor-grab active:cursor-grabbing" : ""}`}
      tabIndex={0}
      onKeyDown={(e) => {
        // Handle Enter for inline editing (only if not already handled by child)
        if (e.key === "Enter" && !isEditing && e.target === e.currentTarget) {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
    >
      {/* Card title / inline edit */}
      {isEditing ? (
        <input
          className="bg-obsidian-bg border border-obsidian-border rounded px-2 py-1 text-sm text-obsidian-text w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
      ) : (
        <div
          className="text-sm font-medium cursor-pointer flex-1"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              setIsModalOpen(true);
            }
          }}
          aria-label={`Open card details: ${card.title}`}
        >
          {card.title}
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeCard(card.listId, card.id);
        }}
        onKeyDown={(e) => e.stopPropagation()} // prevent Enter from triggering parent rename
        className="ml-2 text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
        title="Remove Card"
        aria-label="Remove card"
      >
        ✕
      </button>

      {/* Card Modal with Suspense for code splitting */}
      {isModalOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-obsidian-surface p-6 rounded-lg border border-obsidian-border">
                <p className="text-obsidian-text">Loading...</p>
              </div>
            </div>
          }
        >
          <CardModal card={card} closeModal={() => setIsModalOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
